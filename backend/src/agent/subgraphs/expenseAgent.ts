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
  insertExpense,
  getExpensesByCategory,
  getTotalSpend,
  getMonthlyExpenses,
  deleteAllExpenses,
} from "../../db/database.js";
import { getBudgetStatuses } from "../budgetTools.js";

// ExpenseAgent has its own state — userId flows through
const ExpenseState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    default: () => [],
    reducer: messagesStateReducer,
  }),
  userId: Annotation<string>(),
});

// ── Tools ────────────────────────────────────────────────────

const parseAndSaveExpenses = tool(
  async ({ expenses, userId }: { expenses: any[]; userId: string }) => {
    const today = new Date().toISOString().split("T")[0];
    for (const exp of expenses) {
      await insertExpense(userId, {
        description: exp.description,
        amount: Math.abs(exp.amount),
        category: exp.category,
        date: today!,
      });
    }
    return `Saved ${expenses.length} expenses successfully.`;
  },
  {
    name: "parseAndSaveExpenses",
    description:
      "Parse expenses from any text format and save to database. Use when user provides expense data in any format.",
    schema: z.object({
      userId: z.string().describe("The user's ID"),
      expenses: z.array(
        z.object({
          description: z.string(),
          amount: z.number(),
          category: z.enum([
            "Housing",
            "Food",
            "Transport",
            "Entertainment",
            "Shopping",
            "Health",
            "Utilities",
            "Education",
            "Other",
          ]),
          date: z.string(),
        })
      ),
    }),
  }
);

const analyzeSpending = tool(
  async ({ userId }: { userId: string }) => {
    const byCategory = await getExpensesByCategory(userId);
    const total = await getTotalSpend(userId);
    if (total === 0) return "No expenses found in the database.";

    const breakdown = byCategory
      .map(
        (c) =>
          `${c.category}: ₹${c.total.toLocaleString("en-IN")} (${(
            (c.total / total) *
            100
          ).toFixed(1)}%)`
      )
      .join("\n");

    return `Total: ₹${total.toLocaleString(
      "en-IN"
    )}\n\nBy Category:\n${breakdown}`;
  },
  {
    name: "analyzeSpending",
    description:
      "Analyze current spending patterns, totals, and category breakdown. Use when user asks about their spending.",
    schema: z.object({ userId: z.string() }),
  }
);

const clearExpenses = tool(
  async ({ userId }: { userId: string }) => {
    await deleteAllExpenses(userId);
    return "All expenses cleared from the database.";
  },
  {
    name: "clearExpenses",
    description:
      "Delete all expenses. Only use when user explicitly asks to clear or delete all their data. and always confirm with the user before proceeding.",
    schema: z.object({ userId: z.string() }),
  }
);

const expenseTools = [parseAndSaveExpenses, analyzeSpending, clearExpenses];

// ── Nodes ────────────────────────────────────────────────────

async function expenseModelNode(state: typeof ExpenseState.State) {
  console.log("\n  [ExpenseAgent] Calling model...");

  const response = await invokeWithFallback(
    [
      new SystemMessage(`You are an expense tracking specialist.
      You help users track, save, and analyze their expenses.
      The current user's ID is: ${state.userId}
      Always pass userId="${state.userId}" when calling tools.
      When saving expenses:
      - Extract all expenses from the user's message
      - Use today's date for all entries
      - Categories: Housing, Food, Transport, Entertainment, Shopping, Health, Utilities, Education, Other
      After saving, always analyze spending to give the user a summary.`),
      ...state.messages,
    ],
    expenseTools
  );

  return { messages: [response] };
}

function expenseShouldContinue(state: typeof ExpenseState.State): string {
  const last = state.messages[state.messages.length - 1] as AIMessage;
  return last.tool_calls?.length ? "tools" : END;
}

// ── Build subgraph ────────────────────────────────────────────

export const expenseAgent = new StateGraph(ExpenseState)
  .addNode("model", expenseModelNode)
  .addNode("tools", new ToolNode(expenseTools))
  .addEdge(START, "model")
  .addEdge("tools", "model")
  .addConditionalEdges("model", expenseShouldContinue, {
    tools: "tools",
    [END]: END,
  })
  .compile();
