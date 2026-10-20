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
  userId?: string; // <-- Added context tracking
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
  const userId = options.userId ?? "anonymous";

  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const modelName = MODEL_CHAIN[i]!;
    const startTime = Date.now();

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
      const durationMs = Date.now() - startTime;

      // Structured success log
      console.log(
        JSON.stringify({
          level: "INFO",
          event: "LLM_SUCCESS",
          userId,
          model: modelName,
          attemptIndex: i,
          durationMs,
          timestamp: new Date().toISOString(),
        })
      );

      return response;
    } catch (error: any) {
      lastError = error;
      const durationMs = Date.now() - startTime;
      const status = error?.status ?? error?.response?.status;

      // Structured warning log for retryable failures
      console.warn(
        JSON.stringify({
          level: "WARN",
          event: "LLM_ATTEMPT_FAILED",
          userId,
          model: modelName,
          attemptIndex: i,
          status: status ?? "unknown",
          durationMs,
          error: error?.message,
          timestamp: new Date().toISOString(),
        })
      );

      if (status !== 429 && status !== 503) {
        throw error; // Fail fast on non-retryable errors
      }
    }
  }

  throw new Error(
    `All models exhausted. Last error: ${lastError?.message ?? lastError}`
  );
}
