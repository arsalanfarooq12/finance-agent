import { GoogleGenerativeAI, type Content } from "@google/generative-ai";
import * as dotenv from "dotenv";
import { agentTools, executeTool } from "./tools.js";
import { conversationQueries } from "../db/database.js";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  tools: agentTools,
  systemInstruction: `You are a personal finance assistant for Indian users. You help users track expenses, analyze spending, manage budgets, and give practical financial advice.

Your capabilities:
- Parse and save expenses from any format the user provides
- Analyze spending patterns and give breakdowns
- Set and update budget limits (overall or per-category)
- Check budget status and warn the user proactively
- Give personalized financial advice based on a knowledge base

Rules:
- Always use parseAndSaveExpenses when the user provides expense data
- After saving expenses, ALWAYS call checkBudgetStatus and mention if any budget is near or over limit
- Always use analyzeSpending before giving spending feedback
- Always use getFinancialAdvice when giving tips or recommendations
- Use setBudget when the user wants to set or change a spending limit
- Use Indian Rupee (₹) for all amounts
- Be concise, practical, and encouraging
- If a budget status is "warning" or "over", mention it clearly but kindly
- Never make up financial data — always query tools first`,
});

export async function runAgent(userMessage: string): Promise<{
  reply: string;
  toolsCalled: string[];
}> {
  // Load conversation history from DB
  const dbHistory = conversationQueries.getRecent.all() as Array<{
    role: string;
    content: string;
  }>;

  // Build history in Gemini format
  const history: Content[] = dbHistory.map((h) => ({
    role: h.role as "user" | "model",
    parts: [{ text: h.content }],
  }));

  // Add current user message
  history.push({ role: "user", parts: [{ text: userMessage }] });

  // Save user message to DB
  conversationQueries.insert.run({ role: "user", content: userMessage });

  const toolsCalled: string[] = [];
  let stepCount = 0;
  const maxSteps = 8;

  while (stepCount < maxSteps) {
    stepCount++;

    const response = await model.generateContent({ contents: history });
    const candidate = response.response.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];

    // Add model response to history
    history.push({ role: "model", parts });

    const functionCall = parts.find((p) => p.functionCall)?.functionCall;

    if (functionCall) {
      const { name, args } = functionCall;
      toolsCalled.push(name);

      const result = await executeTool(name, args as Record<string, any>);

      history.push({
        role: "user",
        parts: [{ functionResponse: { name, response: { result } } }],
      });
    } else {
      // Final answer
      const reply =
        parts.find((p) => p.text)?.text ?? "I couldn't generate a response.";

      // Save assistant reply to DB
      conversationQueries.insert.run({ role: "model", content: reply });

      return { reply, toolsCalled };
    }
  }

  return { reply: "Max steps reached. Please try again.", toolsCalled };
}
