import { StateGraph, START, END } from "@langchain/langgraph";
import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import {
  SystemMessage,
  AIMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { z } from "zod";
import { invokeWithFallback } from "../llm.js";
import { vectorStore } from "../knowledgeBase.js";

const AdviceState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    default: () => [],
    reducer: messagesStateReducer,
  }),
  userId: Annotation<string>(),
});

// ── Tools ────────────────────────────────────────────────────

const getFinancialAdvice = tool(
  async ({ query }: { query: string }) => {
    const context = await vectorStore.search(query, 3);
    return `FINANCIAL KNOWLEDGE BASE:\n${context}`;
  },
  {
    name: "getFinancialAdvice",
    description:
      "Search financial knowledge base for advice and best practices. Use for any financial advice, tips, or recommendations.",
    schema: z.object({
      query: z
        .string()
        .describe("The financial topic or question to search for"),
    }),
  }
);

const adviceTools = [getFinancialAdvice];

// ── Nodes ────────────────────────────────────────────────────

async function adviceModelNode(state: typeof AdviceState.State) {
  console.log("\n  [AdviceAgent] Calling model...");

  const response = await invokeWithFallback(
    [
      new SystemMessage(`You are a personal finance advisor for Indian users.
      You give practical, actionable financial advice based on a knowledge base.
      Always search the knowledge base before giving advice.
      Use Indian Rupee (₹) for all amounts.
      Reference the 50/30/20 rule and Indian-specific benchmarks where relevant.
      Be encouraging and specific, not generic.`),
      ...state.messages,
    ],
    adviceTools
  );

  return { messages: [response] };
}

function adviceShouldContinue(state: typeof AdviceState.State): string {
  const last = state.messages[state.messages.length - 1] as AIMessage;
  return last.tool_calls?.length ? "tools" : END;
}

export const adviceAgent = new StateGraph(AdviceState)
  .addNode("model", adviceModelNode)
  .addNode("tools", new ToolNode(adviceTools))
  .addEdge(START, "model")
  .addEdge("tools", "model")
  .addConditionalEdges("model", adviceShouldContinue, {
    tools: "tools",
    [END]: END,
  })
  .compile();
