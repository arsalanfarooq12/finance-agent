import {
  GoogleGenerativeAI,
  GenerativeModel,
  type GenerateContentRequest,
} from "@google/generative-ai";

const MODEL_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",

  "gemini-3.5-flash",
];

interface ModelConfig {
  tools?: any;
  systemInstruction?: string;
}

function isRetryableError(error: any): boolean {
  const status = error?.status ?? error?.response?.status;
  return status === 429 || status === 503;
}

export async function generateWithFallback(
  genAI: GoogleGenerativeAI,
  config: ModelConfig,
  request: GenerateContentRequest
): Promise<{
  response: Awaited<ReturnType<GenerativeModel["generateContent"]>>["response"];
  modelUsed: string;
}> {
  let lastError: any;

  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const modelName = MODEL_CHAIN[i]!;
    // Try to generate content with the current model
    try {
      const modelParams = {
        model: modelName,
        tools: config.tools,
        ...(config.systemInstruction !== undefined
          ? { systemInstruction: config.systemInstruction }
          : {}),
      };

      const model = genAI.getGenerativeModel(modelParams);

      const result = await model.generateContent(request);

      if (i > 0) {
        console.log(
          `[model-fallback] Recovered using ${modelName} after ${i} failure(s)`
        );
      }

      return { response: result.response, modelUsed: modelName! };
    } catch (error: any) {
      lastError = error;
      // If the error is not retryable, throw it immediately. Otherwise, log a warning and continue to the next model in the chain.
      if (!isRetryableError(error)) {
        // Not an overload/rate-limit error — don't fall back, fail immediately
        throw error;
      }

      console.warn(
        `[model-fallback] ${modelName} failed (${
          error?.status ?? "unknown"
        }), trying next model...`
      );
      // Loop continues to next model in chain
    }
  }

  // All models in the chain failed
  throw new Error(
    `All models exhausted. Last error: ${lastError?.message ?? lastError}`
  );
}
