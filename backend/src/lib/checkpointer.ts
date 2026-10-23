import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

let saver: PostgresSaver | null = null;

export function getCheckpointer(): PostgresSaver {
  if (!saver)
    saver = PostgresSaver.fromConnString(process.env.SUPABASE_DB_URL!);
  return saver;
}
