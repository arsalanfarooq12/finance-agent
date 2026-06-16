import { type Tool } from "@google/generative-ai";
import { expenseQueries } from "../db/database.js";
import { vectorStore } from "./knowledgeBase.js";

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
          "Delete all expenses from the database. Only use this if the user explicitly asks to clear, reset, or delete all their data.",
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
  args: Record<string, any>
): Promise<string> {
  switch (name) {
    case "parseAndSaveExpenses": {
      const expenses = args.expenses as Array<{
        description: string;
        amount: number;
        category: string;
        date: string;
      }>;

      const today = new Date().toISOString().split("T")[0];
      let saved = 0;

      for (const expense of expenses) {
        expenseQueries.insert.run({
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          date: expense.date || today,
        });
        saved++;
      }

      return `Successfully saved ${saved} expenses to the database.`;
    }

    case "analyzeSpending": {
      const byCategory = expenseQueries.getByCategory.all() as Array<{
        category: string;
        total: number;
        count: number;
      }>;

      const totalResult = expenseQueries.getTotalSpend.get() as {
        total: number;
      };
      const total = totalResult?.total || 0;

      if (total === 0) {
        return "No expenses found in the database. Please add some expenses first.";
      }

      const monthly = expenseQueries.getMonthly.all() as Array<{
        month: string;
        total: number;
        count: number;
      }>;

      const categoryBreakdown = byCategory
        .map(
          (c) =>
            `${c.category}: ₹${c.total.toLocaleString("en-IN")} (${(
              (c.total / total) *
              100
            ).toFixed(1)}%, ${c.count} transactions)`
        )
        .join("\n");

      const monthlyBreakdown = monthly
        .map(
          (m) =>
            `${m.month}: ₹${m.total.toLocaleString("en-IN")} (${
              m.count
            } transactions)`
        )
        .join("\n");

      return `SPENDING ANALYSIS:
Total Spend: ₹${total.toLocaleString("en-IN")}

By Category:
${categoryBreakdown}

Monthly Summary:
${monthlyBreakdown}`;
    }

    case "getFinancialAdvice": {
      const context = await vectorStore.search(args.query, 3);
      return `FINANCIAL KNOWLEDGE BASE:\n${context}`;
    }

    case "clearExpenses": {
      expenseQueries.deleteAll.run();
      return "All expenses have been cleared from the database.";
    }

    default:
      return `Unknown tool: ${name}`;
  }
}
