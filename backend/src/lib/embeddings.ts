// backend/src/lib/embeddings.ts
import { GoogleGenAI } from "@google/genai";

const DIMS = 768;
let client: GoogleGenAI | null = null;
const getClient = () =>
  (client ??= new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! }));

function normalize(v: number[]): number[] {
  const mag = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / mag);
}

async function embed(
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY"
) {
  const res: any = await getClient().models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: { taskType, outputDimensionality: DIMS },
  });
  const values: number[] = res.embeddings[0].values;
  if (values.length !== DIMS)
    throw new Error(`Expected ${DIMS} dims, got ${values.length}`);
  return normalize(values);
}

export const embedDocument = (t: string) => embed(t, "RETRIEVAL_DOCUMENT");
export const embedQuery = (t: string) => embed(t, "RETRIEVAL_QUERY");
