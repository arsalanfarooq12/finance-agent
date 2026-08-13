# FinanceAI — Personal Finance Agent

A production-deployed fullstack AI agent for personal finance. Users paste expenses in natural language or CSV, upload PDF bank statements, set budget limits, and get AI-driven analysis and advice — all in real time through a streaming chat interface with a live dashboard.

**Live URLs:**

- Frontend: `https://finance-agent-one-azure.vercel.app`

---

## Tech Stack

| Layer              | Technology                                                                        |
| ------------------ | --------------------------------------------------------------------------------- |
| Frontend           | React 18 + TypeScript + Vite                                                      |
| Styling            | Tailwind CSS v4 + CSS custom properties (inline hex, no Tailwind gray-\* classes) |
| Charts             | Recharts                                                                          |
| HTTP client        | Axios + native `fetch` (streaming)                                                |
| Markdown rendering | `react-markdown` (assistant messages only)                                        |
| Auth client        | `@supabase/supabase-js` (anon key)                                                |
| Backend            | Express + TypeScript (compiled via `tsc`)                                         |
| Agent framework    | LangGraph.js (`@langchain/langgraph`)                                             |
| LLM                | `@langchain/google-genai` (reads `GOOGLE_API_KEY`)                                |
| Embeddings         | `@google/genai` SDK — `gemini-embedding-001` (reads `GOOGLE_API_KEY`)             |
| Database           | PostgreSQL via Supabase                                                           |
| Auth server        | Supabase Auth + JWT verification middleware                                       |
| File upload        | Multer (in-memory storage)                                                        |
| PDF parsing        | `pdfjs-dist` (NOT `pdf-parse` — breaks under ESM)                                 |

### AI Models

| Purpose             | Model                        |
| ------------------- | ---------------------------- |
| Chat + tool calling | `gemini-2.5-flash` (primary) |
| Fallback 1          | `gemini-2.5-flash-lite`      |
| Fallback 2          | `gemini-3.5-flash`           |
| Embeddings          | `gemini-embedding-001`       |

> CRITICAL: `gemini-1.5-flash` and ALL `gemini-2.0-*` models are SHUT DOWN (404). Never use them.
> CRITICAL: `@langchain/google-genai` reads `GOOGLE_API_KEY` — NOT `GEMINI_API_KEY`. Both SDKs must use `GOOGLE_API_KEY`.

---

## Project Structure

```
finance-agent/
├── backend/
│   ├── src/
│   │   ├── agent/
│   │   │   ├── state.ts                  # AgentState — shared LangGraph state
│   │   │   ├── llm.ts                    # LLM factory + invokeWithFallback()
│   │   │   ├── orchestrator.ts           # OrchestratorGraph + runAgent() + streamAgent()
│   │   │   ├── knowledgeBase.ts          # 10 financial docs, in-memory vector store
│   │   │   ├── budgetTools.ts            # getBudgetStatuses() logic
│   │   │   └── subgraphs/
│   │   │       ├── expenseAgent.ts       # ExpenseAgent subgraph
│   │   │       ├── budgetAgent.ts        # BudgetAgent subgraph
│   │   │       └── adviceAgent.ts        # AdviceAgent subgraph
│   │   ├── db/
│   │   │   └── database.ts               # All Supabase query functions
│   │   ├── lib/
│   │   │   └── supabase.ts               # Supabase service role client (lazy init)
│   │   ├── middleware/
│   │   │   └── verifyToken.ts            # JWT verification middleware
│   │   ├── routes/
│   │   │   ├── chat.ts                   # POST /api/chat + POST /api/chat/stream (SSE)
│   │   │   ├── expenses.ts               # GET/DELETE /api/expenses + bulk
│   │   │   ├── upload.ts                 # POST /api/upload (PDF)
│   │   │   └── budget.ts                 # GET/POST/DELETE /api/budgets
│   │   ├── env.ts                        # dotenv.config() — MUST be first import
│   │   └── index.ts                      # Express server entry point
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.tsx                  # Chat panel — streaming + agent badges
│   │   │   ├── Dashboard.tsx             # Charts, stat cards, skeletons
│   │   │   ├── BudgetPanel.tsx           # Budget form + progress bars
│   │   │   ├── PDFUpload.tsx             # Drag-drop + editable preview table
│   │   │   ├── UploadStatement.tsx       # Reusable collapsible PDF upload wrapper
│   │   │   └── ConfirmDialog.tsx         # Reusable modal (replaces window.confirm)
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx           # session, user, displayName, avatarUrl
│   │   ├── pages/
│   │   │   └── AuthPage.tsx              # Login + register tabs + Google OAuth
│   │   ├── lib/
│   │   │   └── supabase.ts               # Supabase anon client
│   │   ├── api.ts                        # All axios calls + streamMessage() via fetch
│   │   ├── types.ts                      # All TypeScript interfaces
│   │   ├── App.tsx                       # Auth gate + split layout
│   │   └── main.tsx                      # Wraps App in AuthProvider
│   └── index.css                         # Tailwind + CSS variables
└── langgraph-learning/                   # Separate LangGraph learning project (5 builds)
```

---

## Environment Variables

### Backend `.env` and Vercel

```
GOOGLE_API_KEY=your_gemini_api_key        # Used by BOTH @langchain/google-genai AND @google/genai
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production
FRONTEND_URL=https://finance-agent-one-azure.vercel.app
```

> Do NOT use `GEMINI_API_KEY` — `@langchain/google-genai` reads `GOOGLE_API_KEY` by default. Using the wrong name causes the LLM to hang silently with no error.

### Frontend `.env` and Vercel

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend.vercel.app/api
```

---

## Database Schema (PostgreSQL via Supabase)

All tables have RLS enabled. Every row scoped to `user_id`.

```sql
CREATE TABLE expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount      NUMERIC NOT NULL,
  category    TEXT NOT NULL,
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE budgets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category      TEXT NOT NULL,
  limit_amount  NUMERIC NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category)
);

CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE weekly_summaries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary     TEXT NOT NULL,
  week_start  DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## Multi-Agent Architecture (LangGraph)

The agent layer was fully refactored from a manual while loop to LangGraph.js with a multi-agent orchestrator pattern.

### Architecture

```
User message → POST /api/chat/stream (SSE)
        ↓
OrchestratorGraph.stream()
        ↓
OrchestratorNode — classifies intent via LLM
        ↓
  ┌─────────────────────────────────────────┐
  │             │              │            │
ExpenseAgent  BudgetAgent  AdviceAgent  GeneralAgent
(subgraph)    (subgraph)   (subgraph)   (direct LLM)
```

### What each agent does

| Agent        | Routes when                         | Tools                                                      |
| ------------ | ----------------------------------- | ---------------------------------------------------------- |
| ExpenseAgent | Expense tracking, saving, analyzing | `parseAndSaveExpenses`, `analyzeSpending`, `clearExpenses` |
| BudgetAgent  | Setting limits, checking budgets    | `setBudget`, `checkBudgetStatus`, `deleteBudget`           |
| AdviceAgent  | Financial tips, recommendations     | `getFinancialAdvice` (RAG)                                 |
| GeneralAgent | Greetings, off-topic, unclear       | Direct LLM — no tools                                      |

### Key files

| File                              | Role                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `agent/state.ts`                  | `AgentState` — shared typed state (`messages`, `userId`, `route`, `finalAnswer`) |
| `agent/llm.ts`                    | `invokeWithFallback()` — 3-tier model fallback, only retries on 429/503          |
| `agent/orchestrator.ts`           | Orchestrator graph + `runAgent()` (non-streaming) + `streamAgent()` (SSE)        |
| `agent/subgraphs/expenseAgent.ts` | Full LangGraph subgraph with tools + agent loop                                  |
| `agent/subgraphs/budgetAgent.ts`  | Full LangGraph subgraph with tools + agent loop                                  |
| `agent/subgraphs/adviceAgent.ts`  | Full LangGraph subgraph with RAG tool                                            |

### LangGraph concepts used

| Concept                              | Where used                                        |
| ------------------------------------ | ------------------------------------------------- |
| `StateGraph`                         | All 4 graphs (orchestrator + 3 specialists)       |
| `Annotation.Root`                    | Typed state for each graph                        |
| `messagesStateReducer`               | Auto-appends messages across all nodes            |
| `ToolNode`                           | Replaces the old `executeTool()` switch statement |
| `addConditionalEdges`                | Agent loop routing + orchestrator routing         |
| `compile({ recursionLimit })`        | Replaces old `maxSteps` check                     |
| `.stream({ streamMode: "updates" })` | SSE streaming to frontend                         |

### Model fallback chain

```
gemini-2.5-flash     (primary)
        ↓ on 429/503 only
gemini-2.5-flash-lite
        ↓ on 429/503 only
gemini-3.5-flash     (last resort)
        ↓ on 429/503
throws — all models exhausted

Any other error (400/401/404) → fails immediately, no retry
Fallback is per LLM call, not per conversation
```

---

## Streaming Architecture (SSE)

```
Frontend: fetch() POST /api/chat/stream
        ↓
Backend: res.setHeader("Content-Type", "text/event-stream")
         orchestratorGraph.stream({ streamMode: "updates" })
        ↓
For each graph update:
  - agent node name → sent as { type: "agent", chunk: "expenseAgent" }
  - finalAnswer text → chunked word by word as { type: "token", chunk: "word " }
  - completion → { type: "done" }
        ↓
Frontend ReadableStream reader:
  onToken  → appends word to last assistant message in state
  onAgent  → shows specialist badge ("💰 Expense Agent" etc.)
  onDone   → sets loading false
  onError  → shows error message
```

### Agent badges shown in chat

| Agent        | Badge         |
| ------------ | ------------- |
| expenseAgent | Expense Agent |
| budgetAgent  | Budget Agent  |
| adviceAgent  | Advice Agent  |
| generalAgent | General       |

---

## API Endpoints

All require `Authorization: Bearer <token>` except `/api/health`.

| Method | Endpoint                   | Description                            |
| ------ | -------------------------- | -------------------------------------- |
| POST   | `/api/chat`                | Non-streaming chat (JSON response)     |
| POST   | `/api/chat/stream`         | Streaming chat (SSE — primary)         |
| GET    | `/api/expenses`            | All expenses for current user          |
| GET    | `/api/expenses/categories` | Totals by category                     |
| GET    | `/api/expenses/monthly`    | Totals by month                        |
| POST   | `/api/expenses/bulk`       | Bulk save (used by PDF upload)         |
| DELETE | `/api/expenses/:id`        | Delete single expense                  |
| DELETE | `/api/expenses`            | Clear all expenses + conversations     |
| POST   | `/api/upload`              | Upload PDF, returns extracted expenses |
| GET    | `/api/budgets`             | All budgets with live status           |
| POST   | `/api/budgets`             | Set/update a budget                    |
| DELETE | `/api/budgets/:category`   | Remove a budget                        |
| GET    | `/api/health`              | Health check (public)                  |

---

## Authentication

Supabase Auth — email/password + Google OAuth.

```
AuthPage.tsx → supabase.auth.signUp/signInWithPassword/signInWithOAuth
        ↓
Supabase returns JWT
        ↓
AuthContext stores session, derives displayName + avatarUrl from user_metadata
        ↓
api.ts adds Authorization: Bearer <token> to every request
        ↓
verifyToken.ts validates token → attaches req.userId
        ↓
All DB queries filter by .eq("user_id", req.userId)
```

### Display name resolution

```typescript
displayName =
  user?.user_metadata?.full_name ??
  user?.user_metadata?.name ??
  user?.email?.split("@")[0] ??
  "User";

avatarUrl = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture;
```

For email signup, name collected in form → passed via `options.data.full_name` in `signUp()`.

---

## RAG System

```
Server start → vectorStore.initialize()
        ↓
10 financial knowledge docs embedded via gemini-embedding-001
Each doc → 768-dim float array stored in memory

On getFinancialAdvice tool call:
        ↓
Query embedded → cosine similarity against all 10 vectors
        ↓
Top 3 most relevant docs returned as context
        ↓
Context + question → Gemini → grounded answer
```

**Note:** Vector store is in-memory — resets on server restart. Planned upgrade: Supabase pgvector for persistence.

---

## UI

### Active Color Palette

```css
:root {
  --bg-base: #212121;
  --bg-surface: #2d2d2d;
  --bg-deep: #171717;
  --accent: #0a21c0;
  --accent-hover: #0d29e8;
  --muted: #8e8ea0;
  --white: #ececec;
  --border: #3d3d3d;
}
```

Do NOT use Tailwind gray-\* classes — use inline hex or CSS variables.

### Component notes

**`Chat.tsx`**

- Streaming via `fetch` + `ReadableStream` — tokens appear word by word
- Assistant messages: `react-markdown`, no bubble, text on dark background
- User messages: `#2f2f2f` bubble
- Agent badge appears above message showing which specialist ran
- Auto-growing textarea, icon-only send button

---

## Important Technical Notes

### Supabase lazy init

`getSupabase()` in `lib/supabase.ts` creates client on first call — not at module level. Prevents `supabaseUrl is required` crash from ES module initialization order.

### `env.ts` must be first import

```typescript
// index.ts
import "./env.js"; // MUST be first — loads dotenv before any other module initializes
import express from "express";
```

### Middleware order

```typescript
app.use(cors({...}));        // 1st — handles OPTIONS preflight
app.use(express.json());     // 2nd
app.use("/api/...", routes); // 3rd
```

### PDF parsing

`pdf-parse` throws under ESM. Always use `pdfjs-dist`:

```typescript
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
```

### Recharts

- No `<Cell>` — pass `fill` in data objects
- Pie label: `label={({ name, percent }: any) => ...}`
- Always `type` imports for interfaces

### CORS debugging

`curl -i /api/health` first. CORS errors on every route = server unreachable, not CORS misconfiguration.

---

## Completed Features

- [x] Multi-agent LangGraph architecture (Orchestrator + 3 specialist subgraphs)
- [x] SSE streaming chat (tokens appear word by word)

- [x] RAG pipeline (embeddings, cosine similarity, grounded advice)
- [x] PDF bank statement upload (pdfjs-dist + Gemini extraction + editable preview)
- [x] Budget goals (per-category + overall, color-coded warnings, proactive alerts)
- [x] Multi-user auth (Supabase — email/password + Google OAuth)
- [x] PostgreSQL via Supabase (full per-user data isolation + RLS)
- [x] React-markdown rendering in chat
- [x] Skeleton loading states (Dashboard + BudgetPanel)
- [x] ConfirmDialog (replaces window.confirm for destructive actions)
- [x] Mobile responsive (stacked layout)
- [x] Deployed (Vercel — both frontend and backend)

## Next Steps

- [ ] Replace in-memory RAG with Supabase pgvector (persist across restarts)
- [ ] CSV export (`GET /api/expenses/export`)
- [ ] Weekly summary cron (separate service → `weekly_summaries` table → UI banner)
- [ ] Human-in-the-loop for destructive actions (LangGraph `interrupt()`)
- [ ] LangGraph checkpointing (MemorySaver → PostgresSaver for persistent sessions)
