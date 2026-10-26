# FinanceAI: Personal Finance Agent

A deployed, multi-user AI finance assistant. Chat in natural language to track expenses, set budgets and get advice. Upload PDF bank statements, and watch a live dashboard update as you go. Replies stream in real time, and destructive agent actions ask for confirmation first.

**Live app:** https://finance-agent-one-azure.vercel.app

---

## Current status

| Area                                                                                                | Status                                                  |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Frontend (Vercel) and backend (Render)                                                              | Deployed and working                                    |
| Multi-agent chat (orchestrator + Expense, Budget, Advice, General)                                  | Done                                                    |
| SSE streaming with agent badges                                                                     | Done                                                    |
| Auth (email/password + Google) and per-user data isolation (RLS)                                    | Done                                                    |
| PDF statement upload with editable preview                                                          | Done                                                    |
| Budgets with warnings, dashboard, skeleton loaders                                                  | Done                                                    |
| RAG on Supabase pgvector (persistent, seeded by script)                                             | Done                                                    |
| Human-in-the-loop confirmation for "clear all expenses" (LangGraph `interrupt()` + `PostgresSaver`) | Done                                                    |
| Chat history restored on page load (`GET /api/chat/history`)                                        | Done                                                    |
| Rate limiting: per IP, per user, and a daily chat cap in Postgres                                   | Done                                                    |
| Checkpoint pruning (`pg_cron` job)                                                                  | Added, check `cron.job_run_details` to confirm it runs  |
| CI: build checks, `npm audit`, Dependabot                                                           | Done, merge Dependabot PRs one at a time after checking |
| Automated tests (Vitest)                                                                            | In progress (first unit tests written, more planned)    |

## Features

- Chat-based expense tracking, budgets and advice, streamed word by word
- Orchestrator routes each message to a specialist agent with its own tools
- Confirmation step before the agent clears all expenses, which survives server restarts
- Advice grounded in a vector knowledge base (pgvector)
- PDF bank statement upload with an editable preview before saving
- Dashboard with charts, budget progress bars and a transaction list
- Per-user data isolation with Supabase Auth and row-level security
- Restored chat history on load
- Rate limiting and a daily message cap to protect the LLM quota

---

## Tech stack

| Layer      | Technology                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, react-markdown, axios, `fetch` for SSE |
| Backend    | Express 5, TypeScript (compiled with `tsc`), zod, multer, pdfjs-dist                          |
| Agents     | LangGraph.js (`@langchain/langgraph`), `@langchain/google-genai`                              |
| Embeddings | `@google/genai`, `gemini-embedding-001` at 768 dimensions                                     |
| Database   | Supabase PostgreSQL: app tables, pgvector, LangGraph checkpoint tables, `pg_cron`             |
| Auth       | Supabase Auth with JWT verification middleware                                                |
| Hosting    | Frontend on Vercel, backend on Render                                                         |
| Tooling    | Vitest, GitHub Actions, Dependabot                                                            |

**LLM models:** the primary model and the fallback chain are configured in `backend/src/agent/llm.ts`, which is the source of truth. Model names change often, and Google has retired older ones (`gemini-1.5-*` and `gemini-2.0-*` return 404). `invokeWithFallback()` moves to the next model only on 429 and 503 and fails fast on other errors.

> `@langchain/google-genai` and `@google/genai` both read `GOOGLE_API_KEY`

---

## Architecture

```
Browser (React)
  Chat.tsx + api.ts ──── SSE ────►  Express
                                      │  cors → ipLimiter → json → verifyToken → limiters
                                      ▼
                             LangGraph orchestrator (checkpointed in Postgres)
                             classifies the message, then routes to:
              ┌──────────────┬──────────────┬──────────────┬─────────────┐
         ExpenseAgent    BudgetAgent    AdviceAgent    GeneralAgent
         (subgraph)      (subgraph)     (subgraph)     (direct LLM)
              │                              │
      confirm node ── interrupt()      pgvector search
              │                              │
              └──────────────┬───────────────┘
                             ▼
                  Supabase PostgreSQL
```

### Agents

| Agent        | Handles                                      | Tools                                                      |
| ------------ | -------------------------------------------- | ---------------------------------------------------------- |
| ExpenseAgent | Saving and analyzing expenses, clearing data | `parseAndSaveExpenses`, `analyzeSpending`, `clearExpenses` |
| BudgetAgent  | Budget limits and status                     | `setBudget`, `checkBudgetStatus`, `deleteBudget`           |
| AdviceAgent  | Tips and recommendations                     | `getFinancialAdvice` (RAG)                                 |
| GeneralAgent | Greetings and off-topic                      | None (direct LLM)                                          |

Each specialist is a subgraph with the loop `model → tools → model`. The orchestrator calls a specialist from a wrapper node and passes the run config through so checkpointing and interrupts work.

### Human-in-the-loop (clearExpenses)

1. The Expense agent decides to call `clearExpenses`. Instead of going to the tools node, the graph routes to a `confirm` node.
2. The `confirm` node calls `interrupt()`. LangGraph saves the paused run to Postgres (`PostgresSaver`) and the stream emits an `interrupt` event with `{ threadId, action, message }`, then `done`.
3. The chat UI shows a confirmation card (Delete / Cancel). Sending new messages is blocked while it is open.
4. `POST /api/chat/resume` with `{ threadId, approved }` resumes from the checkpoint. The server verifies the thread belongs to the caller (`threadId` starts with the user id) and that a confirmation is really pending.
5. Approve runs the delete. Cancel returns "Cancelled. Nothing was deleted."

Notes:

- Each chat request uses a fresh `thread_id` of the form `${userId}:${uuid}`.
- The resume value is sent as `{ approved }`, not a bare boolean. LangGraph treats `false` as an empty resume value and throws `EmptyInputError`.
- The `confirm` node re-runs from the top on resume, so nothing before `interrupt()` may have side effects.
- `POST /api/chat` (non-streaming) cannot resume an interrupt and tells the user to use the streaming chat.

### Knowledge base (RAG)

Advice documents live in the `knowledge_documents` table (768-dimension vectors, HNSW index, cosine distance). The SQL function `match_documents(query_embedding, match_count, min_similarity, p_user_id)` returns the closest documents above a similarity cutoff. Documents are embedded with the `RETRIEVAL_DOCUMENT` task type and queries with `RETRIEVAL_QUERY`. `user_id = null` marks a shared document, and the table is ready for per-user uploads later. The seed script upserts by stable id, so it is safe to re-run after editing the docs.

### Rate limiting

| Scope                                      | Limit                                                                |
| ------------------------------------------ | -------------------------------------------------------------------- |
| All requests, per IP (health check exempt) | 300 per 15 min                                                       |
| Chat routes, per user                      | 8 per minute                                                         |
| Daily chat messages, per user              | `DAILY_CHAT_LIMIT` (default 15), counted in Postgres (`usage_daily`) |
| PDF uploads, per user                      | 5 per hour                                                           |
| Other API routes, per user                 | 120 per minute                                                       |

The daily counter uses an atomic SQL function (`consume_chat_quota`), and the day resets at midnight IST. `/api/chat/resume` is deliberately not counted, so a confirmation click is never blocked. The server runs with `trust proxy` enabled because Render sits behind a proxy. Limiters sit after `cors()` so 429 responses carry CORS headers. Per-minute counters are in memory and reset on restart.

### Streaming events (SSE)

| `type`      | `chunk`                                                    |
| ----------- | ---------------------------------------------------------- |
| `agent`     | name of the running specialist                             |
| `token`     | a piece of the reply text                                  |
| `interrupt` | `{ threadId, action, message }` for a pending confirmation |
| `done`      | empty, the stream has finished                             |
| `error`     | error message                                              |

---

## Project structure

```
finance-agent/
├── .github/
│   ├── workflows/ci.yml            # build + npm audit for backend and frontend
│   └── dependabot.yml
├── backend/
│   ├── src/
│   │   ├── agent/
│   │   │   ├── state.ts, llm.ts, orchestrator.ts, knowledgeBase.ts, budgetTools.ts
│   │   │   └── subgraphs/          # expenseAgent.ts, budgetAgent.ts, adviceAgent.ts
│   │   ├── db/database.ts          # Supabase query functions
│   │   ├── lib/                    # supabase.ts, checkpointer.ts, embeddings.ts, format.ts
│   │   ├── middleware/             # verifyToken.ts, rateLimit.ts
│   │   ├── routes/                 # chat.ts, expenses.ts, upload.ts, budget.ts
│   │   ├── scripts/                # setupCheckpointer.ts, seedKnowledge.ts
│   │   ├── env.ts                  # must be the first import in index.ts
│   │   └── index.ts
│   └── vitest.config.ts
└── frontend/
    └── src/
        ├── components/             # Chat, Dashboard, BudgetPanel, PDFUpload, UploadStatement, ConfirmDialog
        ├── contexts/AuthContext.tsx
        ├── pages/AuthPage.tsx
        ├── lib/supabase.ts
        └── api.ts, types.ts, App.tsx, main.tsx, index.css
```

---

## Getting started

### Prerequisites

- Node.js 20+
- A Supabase project
- A Google AI (Gemini) API key

### Environment variables

Backend (`backend/.env`, and the Render dashboard in production):

```
GOOGLE_API_KEY=              # read by both Gemini SDKs
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=   # never expose to the frontend
SUPABASE_ANON_KEY=
SUPABASE_DB_URL=             # Supabase session pooler connection string (port 5432)
FRONTEND_URL=
DAILY_CHAT_LIMIT=15          # optional
NODE_ENV=
```

Frontend (`frontend/.env`):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=                # e.g. https://your-backend.onrender.com/api
```

Do not set `PORT` on Render. The platform injects it. Use the session pooler URL for `SUPABASE_DB_URL`: the direct connection is IPv6-only and Render's free tier does not reach it.

### Database setup (one time)

1. Create `expenses`, `budgets`, `conversations` and `weekly_summaries` with RLS enabled. Every row is scoped to `user_id`.
2. Enable pgvector and create `knowledge_documents` and `match_documents`.
3. Create `usage_daily` and `consume_chat_quota`.
4. Create the LangGraph checkpoint tables, then enable RLS on them:
   ```bash
   cd backend && npx tsx src/scripts/setupCheckpointer.ts
   ```
5. Seed the knowledge base:
   ```bash
   npx tsx src/scripts/seedKnowledge.ts
   ```
6. Schedule checkpoint pruning with `pg_cron` (`prune_checkpoints()` removes threads older than a day).

### Run locally

```bash
# backend (port 3001)
cd backend && npm install && npm run dev

# frontend
cd frontend && npm install && npm run dev
```

If every request fails with `ECONNREFUSED` or a CORS error, check that the backend is running and that the Vite proxy points at port 3001 before debugging anything else.

### Tests

```bash
cd backend
npm test            # run once (CI)
npm run test:watch  # re-run on save
```

Tests live next to the code as `*.test.ts`. Vitest is set up for the backend

---

## API

All routes require `Authorization: Bearer <token>` except `/api/health`.

| Method | Endpoint                   | Description                                       |
| ------ | -------------------------- | ------------------------------------------------- |
| POST   | `/api/chat`                | Non-streaming chat (cannot resume confirmations)  |
| POST   | `/api/chat/stream`         | Streaming chat over SSE                           |
| POST   | `/api/chat/resume`         | Resume a paused run with `{ threadId, approved }` |
| GET    | `/api/chat/history`        | Recent messages for the chat UI                   |
| GET    | `/api/expenses`            | All expenses                                      |
| GET    | `/api/expenses/categories` | Totals by category                                |
| GET    | `/api/expenses/monthly`    | Totals by month                                   |
| POST   | `/api/expenses/bulk`       | Bulk save (PDF upload flow)                       |
| DELETE | `/api/expenses/:id`        | Delete one expense                                |
| DELETE | `/api/expenses`            | Clear all expenses and conversations              |
| POST   | `/api/upload`              | PDF to extracted expenses                         |
| GET    | `/api/budgets`             | All budgets with live status                      |
| POST   | `/api/budgets`             | Set or update a budget                            |
| DELETE | `/api/budgets/:category`   | Remove a budget                                   |
| GET    | `/api/health`              | Health check (public)                             |

---

## Authentication

Supabase Auth with email/password and Google OAuth. The frontend sends the session JWT as a bearer token. `verifyToken` validates it with Supabase and sets `req.userId`, and every database query filters by `.eq("user_id", userId)`. The display name comes from `user_metadata.full_name` with fallbacks to `name` and then the email prefix, and the avatar from `avatar_url` or `picture`.

---

## Development rules

- `env.ts` must be the first import in `index.ts`, and the Supabase client is created lazily inside a function.
- Middleware order: `cors()` first, then limiters, then `express.json()`.
- Use `pdfjs-dist` for PDFs (`pdfjs-dist/legacy/build/pdf.mjs`), not `pdf-parse`.
- Never trust AI-inferred dates. Override them with the server date, and `Math.abs()` PDF amounts.
- Tool descriptions are prompts: vague descriptions cause wrong tool choices. Pass `userId` to every tool.
- Frontend: extensionless imports, inline hex values or CSS variables (no Tailwind `gray-*`), no `<Cell>` in Recharts. Backend imports use `.js` extensions.
- TypeScript is pinned to 6.0.x because `typescript-eslint` does not yet support TypeScript 7. Dependabot is set to ignore major bumps of `typescript` and `@types/node`.

---

## Roadmap

- Finish the Vitest suite and add a test step to CI
- Retry transient 503s on the same model before falling back

- CSV export (`GET /api/expenses/export`)
- Weekly summary cron feeding `weekly_summaries` and a UI banner

- Expense search and date filters, React error boundaries
