// backend/src/scripts/seedKnowledge.ts
import "../env.js";
import pg from "pg";
import { financialKnowledge } from "../agent/knowledgeBase.js";
import { embedDocument } from "../lib/embeddings.js";

const pool = new pg.Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  max: 1,
});

const ids: string[] = [];
for (const doc of financialKnowledge) {
  const id = `seed-${doc.id}`;
  ids.push(id);
  const vec = await embedDocument(`${doc.title}\n${doc.content}`);
  await pool.query(
    `insert into public.knowledge_documents (id, user_id, source, title, content, embedding)
     values ($1, null, 'seed', $2, $3, $4::extensions.vector)
     on conflict (id) do update
       set title = excluded.title, content = excluded.content, embedding = excluded.embedding`,
    [id, doc.title, doc.content, JSON.stringify(vec)]
  );
  console.log(`upserted ${id}: ${doc.title}`);
  await new Promise((r) => setTimeout(r, 500)); // stay under free-tier rate limits
}

// Remove seed docs that were deleted from the array
const del = await pool.query(
  `delete from public.knowledge_documents
   where source = 'seed' and user_id is null and id <> all($1::text[])`,
  [ids]
);
console.log(`removed ${del.rowCount} stale seed docs`);

await pool.end();
process.exit(0);
