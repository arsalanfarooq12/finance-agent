import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Primary model
export function getPrimaryLLM() {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    maxRetries: 0, // We handle retries ourselves via fallback
  });
}

// Fallback models in order
const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.5-flash",
];

// Wraps any LLM call with the 3-tier fallback chain
// Only retries on 429/503 — fails fast on other errors
export async function invokeWithFallback(
  messages: any[],
  tools?: any[]
): Promise<any> {
  let lastError: any;

  for (const modelName of FALLBACK_MODELS) {
    try {
      const llm = new ChatGoogleGenerativeAI({
        model: modelName,
        temperature: 0,
        maxRetries: 0,
      });

      const model = tools ? llm.bindTools(tools) : llm;
      const response = await model.invoke(messages);

      if (modelName !== FALLBACK_MODELS[0]) {
        console.log(`[llm-fallback] Recovered using ${modelName}`);
      }

      return response;
    } catch (error: any) {
      lastError = error;
      const status = error?.status ?? error?.response?.status;

      if (status !== 429 && status !== 503) {
        throw error; // Not a capacity error — fail immediately
      }

      console.warn(
        `[llm-fallback] ${modelName} failed (${status}), trying next...`
      );
    }
  }

  throw new Error(`All models exhausted. Last error: ${lastError?.message}`);
}
