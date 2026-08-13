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

async function callExpenseAgent(state: typeof AgentState.State) {
  console.log("\n[Orchestrator] → ExpenseAgent");
  const result = await expenseAgent.invoke({
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

  .compile();

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
  const result = await orchestratorGraph.invoke({
    messages,
    userId,
  });

  const reply = result.finalAnswer || "I couldn't generate a response.";
  const agentUsed = result.route || "general";

  // Save reply
  await insertConversation(userId, "model", reply);

  return { reply, agentUsed };
}

// ── Streaming version ─────────────────────────────────────────

export async function streamAgent(
  userMessage: string,
  userId: string,
  onChunk: (chunk: string, type: "token" | "agent" | "done") => void
): Promise<void> {
  const dbHistory = await getRecentConversations(userId);
  await insertConversation(userId, "user", userMessage);

  const messages = [
    ...dbHistory.map((h: any) =>
      h.role === "user" ? new HumanMessage(h.content) : new AIMessage(h.content)
    ),
    new HumanMessage(userMessage),
  ];

  let finalReply = "";

  // Stream graph events
  const stream = await orchestratorGraph.stream(
    { messages, userId },
    { streamMode: "updates" }
  );

  for await (const update of stream) {
    const nodeName = Object.keys(update)[0] || "";
    const nodeData = (update as any)[nodeName];

    // Notify frontend which agent is running
    if (
      ["expenseAgent", "budgetAgent", "adviceAgent", "generalAgent"].includes(
        nodeName
      )
    ) {
      onChunk(nodeName, "agent");
    }

    // Stream the final answer token by token
    if (nodeData?.finalAnswer && nodeData.finalAnswer !== finalReply) {
      const newText = nodeData.finalAnswer;
      // Simulate streaming by chunking the text
      // Real token streaming requires LangChain streaming callbacks
      const words = newText.split(" ");
      for (const word of words) {
        onChunk(word + " ", "token");
        await new Promise((r) => setTimeout(r, 20)); // small delay for effect
      }
      finalReply = newText;
    }
  }

  // Save final reply
  if (finalReply) {
    await insertConversation(userId, "model", finalReply);
  }

  onChunk("", "done");
}
