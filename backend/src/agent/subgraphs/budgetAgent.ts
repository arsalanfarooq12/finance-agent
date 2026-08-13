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
import {
  upsertBudget,
  getAllBudgets,
  deleteBudgetByCategory,
  getExpensesByCategory,
  getTotalSpend,
} from "../../db/database.js";

const BudgetState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    default: () => [],
    reducer: messagesStateReducer,
  }),
  userId: Annotation<string>(),
});

// ── Tools ────────────────────────────────────────────────────

const setBudget = tool(
  async ({
    userId,
    category,
    limit,
  }: {
    userId: string;
    category: string;
    limit: number;
  }) => {
    await upsertBudget(userId, category, limit);
    return `Budget set: ${category} → ₹${limit.toLocaleString(
      "en-IN"
    )} per month`;
  },
  {
    name: "setBudget",
    description:
      "Set or update a budget limit for a category. Use 'Overall' for total monthly budget.",
    schema: z.object({
      userId: z.string(),
      category: z
        .string()
        .describe("'Overall' or a specific category like Food, Transport"),
      limit: z.number().describe("Monthly budget limit in rupees"),
    }),
  }
);

const checkBudgetStatus = tool(
  async ({ userId }: { userId: string }) => {
    const budgets = await getAllBudgets(userId);
    if (budgets.length === 0) return "No budgets set yet.";

    const byCategory = await getExpensesByCategory(userId);
    const totalSpend = await getTotalSpend(userId);

    const statuses = budgets.map((b: any) => {
      const spent =
        b.category === "Overall"
          ? totalSpend
          : byCategory.find((c: any) => c.category === b.category)?.total ?? 0;
      const pct = ((spent / Number(b.limit_amount)) * 100).toFixed(0);
      const status =
        spent >= Number(b.limit_amount)
          ? "OVER"
          : spent >= Number(b.limit_amount) * 0.8
          ? "WARNING"
          : "safe";
      return `${b.category}: ₹${spent.toLocaleString("en-IN")} / ₹${Number(
        b.limit_amount
      ).toLocaleString("en-IN")} (${pct}%) — ${status}`;
    });

    return `BUDGET STATUS:\n${statuses.join("\n")}`;
  },
  {
    name: "checkBudgetStatus",
    description: "Check current spending against all set budget limits.",
    schema: z.object({ userId: z.string() }),
  }
);

const deleteBudget = tool(
  async ({ userId, category }: { userId: string; category: string }) => {
    await deleteBudgetByCategory(userId, category);
    return `Budget for ${category} removed.`;
  },
  {
    name: "deleteBudget",
    description: "Remove a budget limit for a specific category.",
    schema: z.object({ userId: z.string(), category: z.string() }),
  }
);

const budgetTools = [setBudget, checkBudgetStatus, deleteBudget];

// ── Nodes ────────────────────────────────────────────────────

async function budgetModelNode(state: typeof BudgetState.State) {
  console.log("\n  [BudgetAgent] Calling model...");

  const response = await invokeWithFallback(
    [
      new SystemMessage(`You are a budget management specialist.
      You help users set, track, and manage spending limits.
      The current user's ID is: ${state.userId}
      Always pass userId="${state.userId}" when calling tools.
      After setting or checking budgets, give clear actionable feedback.
      Warn clearly when spending is above 80% or over the limit.`),
      ...state.messages,
    ],
    budgetTools
  );

  return { messages: [response] };
}

function budgetShouldContinue(state: typeof BudgetState.State): string {
  const last = state.messages[state.messages.length - 1] as AIMessage;
  return last.tool_calls?.length ? "tools" : END;
}

export const budgetAgent = new StateGraph(BudgetState)
  .addNode("model", budgetModelNode)
  .addNode("tools", new ToolNode(budgetTools))
  .addEdge(START, "model")
  .addEdge("tools", "model")
  .addConditionalEdges("model", budgetShouldContinue, {
    tools: "tools",
    [END]: END,
  })
  .compile();
