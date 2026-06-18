import { GoogleGenerativeAI, type Content } from "@google/generative-ai";
import * as dotenv from "dotenv";
import { agentTools, executeTool } from "./tools.js";
import { conversationQueries } from "../db/database.js";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  tools: agentTools,
  systemInstruction: `You are a personal finance assistant for Indian users. You help users track expenses, analyze spending, and give practical financial advice.

Your capabilities:
- Parse and save expenses from any format the user provides
- Analyze spending patterns and give breakdowns
- Compare spending to healthy benchmarks
- Give personalized financial advice based on a knowledge base

Rules:
- Always use parseAndSaveExpenses when the user provides expense data
- Always use analyzeSpending before giving spending feedback
- Always use getFinancialAdvice when giving tips or recommendations
- Use Indian Rupee (₹) for all amounts
- Be concise, practical, and encouraging
- When you save expenses, confirm what you saved and give a quick insight
- Never make up financial data — always query the database first`,
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
