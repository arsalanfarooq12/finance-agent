import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentState } from "./state.js";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { invokeWithFallback } from "./llm.js";
import { expenseAgent } from "./subgraphs/expenseAgent.js";
import { budgetAgent } from "./subgraphs/budgetAgent.js";
import { adviceAgent } from "./subgraphs/adviceAgent.js";
import { insertConversation, getRecentConversations } from "../db/database.js";

import { Command } from "@langchain/langgraph";
import type { RunnableConfig } from "@langchain/core/runnables";
import { randomUUID } from "node:crypto";
import { getCheckpointer } from "../lib/checkpointer.js";
// ── Orchestrator node — classifies intent ──────────────────────
async function orchestratorNode(state: typeof AgentState.State) {
  console.log("\n[Orchestrator] Classifying intent...");

  const response = await invokeWithFallback([
    new SystemMessage(`You are a routing orchestrator for a personal finance assistant.
    Analyze the user's message and decide which specialist to route to.

    Specialists:
    - "expense" — tracking expenses, saving transactions, analyzing spending patterns, clearing data
    - "budget" — setting budget limits, checking budget status, managing spending caps
    - "advice" — financial tips, recommendations, how to save money, investment basics
    - "general" — greetings, off-topic, unclear requests that don't fit the above

    Reply with ONLY one word: "expense", "budget", "advice", or "general"`),
    ...state.messages,
  ]);

  const route = response.content.toString().trim().toLowerCase();
  console.log(`[Orchestrator] Route: ${route}`);
  return { route };
}

// ── Routing function ──────────────────────────────────────────
function orchestratorRoute(state: typeof AgentState.State): string {
  const route = state.route;
  if (route.includes("expense")) return "expenseAgent";
  if (route.includes("budget")) return "budgetAgent";
  if (route.includes("advice")) return "adviceAgent";
  return "generalAgent";
}

// ── Specialist caller nodes ───────────────────────────────────

async function callExpenseAgent(
  state: typeof AgentState.State,
  config: RunnableConfig
) {
  console.log("\n[Orchestrator] → ExpenseAgent");
  const result = await expenseAgent.invoke(
    { messages: state.messages, userId: state.userId },
    config
  );
  const last = result.messages[result.messages.length - 1];
  const answer =
    typeof last!.content === "string"
      ? last!.content
      : JSON.stringify(last!.content);
  return {
    finalAnswer: answer,
    messages: [new AIMessage(answer)],
  };
}

async function callBudgetAgent(state: typeof AgentState.State) {
  console.log("\n[Orchestrator] → BudgetAgent");
  const result = await budgetAgent.invoke({
    messages: state.messages,
    userId: state.userId,
  });
  const last = result.messages[result.messages.length - 1];
  const answer =
    typeof last!.content === "string"
      ? last!.content
      : JSON.stringify(last!.content);
  return {
    finalAnswer: answer,
    messages: [new AIMessage(answer)],
  };
}

async function callAdviceAgent(state: typeof AgentState.State) {
  console.log("\n[Orchestrator] → AdviceAgent");
  const result = await adviceAgent.invoke({
    messages: state.messages,
    userId: state.userId,
  });
  const last = result.messages[result.messages.length - 1];
  const answer =
    typeof last!.content === "string"
      ? last!.content
      : JSON.stringify(last!.content);
  return {
    finalAnswer: answer,
    messages: [new AIMessage(answer)],
  };
}

async function generalAgent(state: typeof AgentState.State) {
  console.log("\n[Orchestrator] → GeneralAgent (direct answer)");
  const response = await invokeWithFallback([
    new SystemMessage(
      "You are a friendly personal finance assistant. Answer the user's question helpfully and concisely. Use ₹ for amounts."
    ),
    ...state.messages,
  ]);
  const answer = response.content.toString();
  return {
    finalAnswer: answer,
    messages: [response],
  };
}

// ── Build orchestrator graph ──────────────────────────────────

const orchestratorGraph = new StateGraph(AgentState)
  .addNode("orchestrator", orchestratorNode)
  .addNode("expenseAgent", callExpenseAgent)
  .addNode("budgetAgent", callBudgetAgent)
  .addNode("adviceAgent", callAdviceAgent)
  .addNode("generalAgent", generalAgent)

  .addEdge(START, "orchestrator")
  .addEdge("expenseAgent", END)
  .addEdge("budgetAgent", END)
  .addEdge("adviceAgent", END)
  .addEdge("generalAgent", END)

  .addConditionalEdges("orchestrator", orchestratorRoute, {
    expenseAgent: "expenseAgent",
    budgetAgent: "budgetAgent",
    adviceAgent: "adviceAgent",
    generalAgent: "generalAgent",
  })

  .compile({ checkpointer: getCheckpointer() });

// ── Public API — replaces old runAgent() ──────────────────────

export async function runAgent(
  userMessage: string,
  userId: string
): Promise<{
  reply: string;
  agentUsed: string;
}> {
  // Load conversation history
  const dbHistory = await getRecentConversations(userId);
  const history = dbHistory.map((h: any) => ({
    role: h.role === "user" ? "human" : "assistant",
    content: h.content,
  }));

  // Save user message
  await insertConversation(userId, "user", userMessage);

  // Build messages — history + new message
  const messages = [
    ...history.map((h: any) =>
      h.role === "human"
        ? new HumanMessage(h.content)
        : new AIMessage(h.content)
    ),
    new HumanMessage(userMessage),
  ];

  // Run the graph
  const threadId = `${userId}:${randomUUID()}`;
  const result = await orchestratorGraph.invoke(
    { messages, userId },
    { configurable: { thread_id: threadId } }
  );
  if ((result as any).__interrupt__) {
    return {
      reply: "That action needs confirmation. Please use the streaming chat.",
      agentUsed: "expense",
    };
  }
  const reply = result.finalAnswer || "I couldn't generate a response.";
  const agentUsed = result.route || "general";

  // Save reply
  await insertConversation(userId, "model", reply);

  return { reply, agentUsed };
}

// ── Streaming version ─────────────────────────────────────────

type ChunkType = "token" | "agent" | "done" | "interrupt";
type OnChunk = (chunk: any, type: ChunkType) => void;

const AGENT_NODES = [
  "expenseAgent",
  "budgetAgent",
  "adviceAgent",
  "generalAgent",
];

async function pumpStream(
  stream: AsyncIterable<any>,
  threadId: string,
  onChunk: OnChunk
) {
  let finalReply = "";

  for await (const update of stream) {
    console.log("[stream update]", JSON.stringify(update));
    // Interrupts arrive as an "__interrupt__" key in "updates" mode
    if (update.__interrupt__) {
      const payload = update.__interrupt__[0]?.value ?? {};
      onChunk({ threadId, ...payload }, "interrupt");
      continue;
    }

    const nodeName = Object.keys(update)[0] || "";
    const nodeData = update[nodeName];

    if (AGENT_NODES.includes(nodeName)) onChunk(nodeName, "agent");

    if (nodeData?.finalAnswer && nodeData.finalAnswer !== finalReply) {
      for (const word of nodeData.finalAnswer.split(" ")) {
        onChunk(word + " ", "token");
        await new Promise((r) => setTimeout(r, 20));
      }
      finalReply = nodeData.finalAnswer;
    }
  }
  return finalReply;
}

export async function streamAgent(
  userMessage: string,
  userId: string,
  onChunk: OnChunk
) {
  const dbHistory = await getRecentConversations(userId);
  await insertConversation(userId, "user", userMessage);

  const messages = [
    ...dbHistory.map((h: any) =>
      h.role === "user" ? new HumanMessage(h.content) : new AIMessage(h.content)
    ),
    new HumanMessage(userMessage),
  ];

  const threadId = `${userId}:${randomUUID()}`;
  const stream = await orchestratorGraph.stream(
    { messages, userId },
    {
      streamMode: "updates",
      recursionLimit: 25,
      configurable: { thread_id: threadId },
    }
  );

  const finalReply = await pumpStream(stream, threadId, onChunk);
  if (finalReply) await insertConversation(userId, "model", finalReply);
  onChunk("", "done"); // sent after an interrupt too, so the UI's loading state clears
}

export async function resumeAgent(
  threadId: string,
  userId: string,
  approved: boolean,
  onChunk: OnChunk
) {
  // Ownership check: threadId must belong to this user
  if (!threadId.startsWith(`${userId}:`)) throw new Error("Invalid thread");

  const config = {
    streamMode: "updates" as const,
    recursionLimit: 25,
    configurable: { thread_id: threadId },
  };

  // Reject stale or double-clicked resumes
  const snap = await orchestratorGraph.getState(config);
  if (!snap.tasks?.some((t: any) => t.interrupts?.length))
    throw new Error("No pending confirmation");

  const stream = await orchestratorGraph.stream(
    new Command({ resume: { approved } }),
    config
  );
  const finalReply = await pumpStream(stream, threadId, onChunk);
  if (finalReply) await insertConversation(userId, "model", finalReply);
  onChunk("", "done");
}
