import { type Tool } from "@google/generative-ai";

import { vectorStore } from "./knowledgeBase.js";

import { getBudgetStatuses } from "./budgetTools.js";
import {
  insertExpense,
  getExpensesByCategory,
  getTotalSpend,
  getMonthlyExpenses,
  deleteAllExpenses,
  bulkInsertExpenses,
  upsertBudget,
} from "../db/database.js";
// Tool definitions for Gemini
export const agentTools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "parseAndSaveExpenses",
        description:
          "Parse expenses from raw text or CSV input and save them to the database. Use this whenever the user provides expense data in any format — typed sentences, comma separated values, or structured lists.",
        parameters: {
          type: "object" as any,
          properties: {
            expenses: {
              type: "array" as any,
              description: "Array of parsed expenses",
              items: {
                type: "object" as any,
                properties: {
                  description: {
                    type: "string" as any,
                    description: "What the expense was for",
                  },
                  amount: {
                    type: "number" as any,
                    description: "Amount in rupees",
                  },
                  category: {
                    type: "string" as any,
                    description:
                      "Category: Housing, Food, Transport, Entertainment, Shopping, Health, Utilities, Education, or Other",
                  },
                  date: {
                    type: "string" as any,
                    description:
                      "Date in YYYY-MM-DD format, use today if not specified",
                  },
                },
                required: ["description", "amount", "category", "date"],
              },
            },
          },
          required: ["expenses"],
        },
      },
      {
        name: "analyzeSpending",
        description:
          "Analyze the user's spending from the database. Returns totals by category, percentages, and monthly summary. Use this when the user asks about their spending patterns, totals, or wants a breakdown.",
        parameters: {
          type: "object" as any,
          properties: {},
        },
      },
      {
        name: "getFinancialAdvice",
        description:
          "Get personalized financial advice based on the user's question. Uses a knowledge base of financial best practices. Use this when the user asks for advice, tips, or wants to know if their spending is healthy.",
        parameters: {
          type: "object" as any,
          properties: {
            query: {
              type: "string" as any,
              description: "The financial question or topic to get advice on",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "clearExpenses",
        description:
          "Delete all expenses from the database. Only use this if the user explicitly asks to clear, reset, or delete all their data, Always confirm with the user before performing this action. Always warn the user that this action is irreversible.",
        parameters: {
          type: "object" as any,
          properties: {},
        },
      },
      {
        name: "setBudget",
        description:
          "Set or update a budget limit. Use category 'Overall' for total monthly budget, or a specific category name like 'Food' or 'Transport' for category-specific budgets. Use this when the user wants to set, change, or define spending limits.",
        parameters: {
          type: "object" as any,
          properties: {
            category: {
              type: "string" as any,
              description:
                "Budget category: 'Overall' or a specific expense category",
            },
            limit: {
              type: "number" as any,
              description: "The budget limit amount in rupees",
            },
          },
          required: ["category", "limit"],
        },
      },
      {
        name: "checkBudgetStatus",
        description:
          "Check current spending against all set budgets. Use this whenever expenses are added, or when the user asks about their budget status, how much they have left, or if they're overspending.",
        parameters: {
          type: "object" as any,
          properties: {},
        },
      },
    ],
  },
];

// Tool implementations
export async function executeTool(
  name: string,
  args: Record<string, any>,
  userId: string
): Promise<string> {
  switch (name) {
    case "parseAndSaveExpenses": {
      const today = new Date().toISOString().split("T")[0];
      for (const expense of args.expenses) {
        await insertExpense(userId, {
          description: expense.description,
          amount: Math.abs(expense.amount),
          category: expense.category,
          date: today!,
        });
      }
      return `Successfully saved ${args.expenses.length} expenses.`;
    }
    case "analyzeSpending": {
      const byCategory = await getExpensesByCategory(userId);
      const total = await getTotalSpend(userId);
      if (total === 0) return "No expenses found.";
      const breakdown = byCategory
        .map(
          (c) =>
            `${c.category}: ₹${c.total.toLocaleString("en-IN")} (${(
              (c.total / total) *
              100
            ).toFixed(1)}%)`
        )
        .join("\n");
      return `Total: ₹${total.toLocaleString("en-IN")}\n\n${breakdown}`;
    }

    case "getFinancialAdvice": {
      const context = await vectorStore.search(args.query, 3);
      return `FINANCIAL KNOWLEDGE BASE:\n${context}`;
    }

    case "clearExpenses": {
      await deleteAllExpenses(userId);
      return "All expenses cleared.";
    }
    case "setBudget": {
      await upsertBudget(userId, args.category, args.limit);
      return `Budget set: ${args.category} → ₹${args.limit.toLocaleString(
        "en-IN"
      )}`;
    }

    case "checkBudgetStatus": {
      const statuses = await getBudgetStatuses(userId);
      if (statuses.length === 0) return "No budgets set yet.";
      return (
        "BUDGET STATUS:\n" +
        statuses
          .map(
            (s) =>
              `${s.category}: ₹${s.spent.toLocaleString(
                "en-IN"
              )} / ₹${s.limit.toLocaleString("en-IN")} (${s.percentUsed.toFixed(
                0
              )}%) — ${s.status.toUpperCase()}`
          )
          .join("\n")
      );
    }
    default:
      return `Unknown tool: ${name}`;
  }
}
