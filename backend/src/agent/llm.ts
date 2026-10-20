// src/utils/llm.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const MODEL_CHAIN = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
];

interface InvokeOptions {
  tools?: any[];
  responseMimeType?: string;
  temperature?: number;
}

/**
 * Unified LLM invocation with fallback across MODEL_CHAIN.
 * Works seamlessly for LangGraph agents, orchestrators, and standalone tasks (like PDF parsing).
 */
export async function invokeWithFallback(
  messages: any[],
  options: InvokeOptions = {}
): Promise<any> {
  let lastError: any;

  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const modelName = MODEL_CHAIN[i]!;
    try {
      const llm = new ChatGoogleGenerativeAI({
        model: modelName,
        temperature: options.temperature ?? 0,
        maxRetries: 0,
        ...(options.responseMimeType
          ? { modelKwargs: { responseMimeType: options.responseMimeType } }
          : {}),
      });

      const model =
        options.tools && options.tools.length > 0
          ? llm.bindTools(options.tools)
          : llm;

      const response = await model.invoke(messages);

      if (i > 0) {
        console.log(
          `[llm-fallback] Recovered using ${modelName} after ${i} failure(s)`
        );
      }

      return response;
    } catch (error: any) {
      lastError = error;
      const status = error?.status ?? error?.response?.status;

      // Only retry on 429 (Rate Limit) or 503 (Service Overload)
      if (status !== 429 && status !== 503) {
        throw error;
      }

      console.warn(
        `[llm-fallback] ${modelName} failed (${
          status || "unknown"
        }), trying next model...`
      );
    }
  }

  throw new Error(
    `All models exhausted. Last error: ${lastError?.message ?? lastError}`
  );
}
