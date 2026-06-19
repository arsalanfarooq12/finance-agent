# FinanceAI — Personal Finance Agent

A fullstack AI-powered personal finance assistant. Paste your expenses in natural language or CSV, and the agent categorizes them, analyzes your spending, and gives personalized financial advice — all in real time.

---

## Tech Stack

| Layer       | Technology                                           |
| ----------- | ---------------------------------------------------- |
| Frontend    | React + TypeScript + Vite                            |
| Styling     | Tailwind CSS v4 + custom CSS variables               |
| Charts      | Recharts                                             |
| HTTP client | Axios                                                |
| Backend     | Express + TypeScript                                 |
| Database    | SQLite via `better-sqlite3`                          |
| AI model    | Gemini 2.5 Flash (chat + tools), with fallback chain |
| Embeddings  | gemini-embedding-001 (RAG)                           |
| AI SDKs     | `@google/generative-ai` + `@google/genai`            |

---

## Project Structure

```
finance-agent/
├── backend/
│   ├── src/
│   │   ├── agent/
│   │   │   ├── agent.ts          # Agent loop (max 8 steps)
│   │   │   ├── tools.ts          # Tool definitions + implementations
│   │   │   └── knowledgeBase.ts  # RAG vector store + financial docs
│   │   ├── db/
│   │   │   └── database.ts       # SQLite setup, prepared statements
│   │   ├── routes/
│   │   │   ├── chat.ts           # POST /api/chat
│   │   │   └── expenses.ts       # GET/DELETE /api/expenses
│   │   └── index.ts              # Express server entry point
│   ├── finance.db                # SQLite database (auto-created)
│   └── .env                      # GEMINI_API_KEY, PORT
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.tsx          # Chat panel
│   │   │   └── Dashboard.tsx     # Charts + transactions panel
│   │   ├── api.ts                # All axios API calls
│   │   ├── types.ts              # Shared TypeScript interfaces
│   │   ├── App.tsx               # Root layout, tab state, refreshKey
│   │   └── main.tsx              # React entry point
│   └── index.css                 # Tailwind + CSS variables (earthy palette)
```

---

## How to Run

### Prerequisites

- Node.js 18+
- A Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### 1. Backend

```bash
cd backend

# Create .env file
echo "GEMINI_API_KEY=your_key_here" > .env
echo "PORT=3001" >> .env

# Install dependencies
npm install

# Start server
npm run dev
```

Server runs on `http://localhost:3001`

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

App runs on `http://localhost:5173`

---

## How It Works — Data Flow

### Sending a message

```
User types in Chat.tsx
        ↓
sendMessage() in api.ts
        ↓
POST /api/chat { message }
        ↓
routes/chat.ts → calls runAgent(message)
        ↓
agent.ts loads conversation history from SQLite
        ↓
Sends history + message to Gemini 1.5 Flash
        ↓
Gemini decides: call a tool OR answer directly
        ↓
If tool → executeTool() runs it → result added to history → loop
If answer → reply saved to SQLite → returned to frontend
        ↓
Chat.tsx renders reply + toolsCalled badges
        ↓
onAgentReply() triggers refreshKey++
        ↓
Dashboard.tsx re-fetches from /api/expenses/*
        ↓
Charts and tables update live
```

### RAG (Financial Advice)

```
Server starts
        ↓
vectorStore.initialize() runs
        ↓
10 financial knowledge docs embedded via gemini-embedding-001
        ↓
Each doc becomes a 768-dimension float array stored in memory

When getFinancialAdvice tool is called:
        ↓
User query is embedded into a vector
        ↓
Cosine similarity calculated against all 10 doc vectors
        ↓
Top 2-3 most relevant docs returned as context
        ↓
Context injected into the prompt → Gemini answers from real data
```

### Memory (Conversation History)

```
Every user message → saved to conversations table in SQLite
Every assistant reply → saved to conversations table in SQLite

On every agent call:
        ↓
Last 20 messages loaded from SQLite
        ↓
Converted to Gemini Content[] format
        ↓
Sent with every API call as full history
        ↓
Model "remembers" because it sees all previous turns
```

---

## API Endpoints

| Method | Endpoint                   | Description                                             |
| ------ | -------------------------- | ------------------------------------------------------- |
| POST   | `/api/chat`                | Send a message to the agent                             |
| GET    | `/api/expenses`            | Get all expenses                                        |
| GET    | `/api/expenses/categories` | Get totals grouped by category                          |
| GET    | `/api/expenses/monthly`    | Get totals grouped by month                             |
| POST   | `/api/expenses/bulk`       | Save multiple expenses at once (used by PDF upload)     |
| DELETE | `/api/expenses/:id`        | Delete a single expense                                 |
| DELETE | `/api/expenses`            | Clear all expenses + conversations                      |
| POST   | `/api/upload`              | Upload a PDF bank statement, returns extracted expenses |
| GET    | `/api/budgets`             | Get all budgets with live spend status                  |
| POST   | `/api/budgets`             | Set/update a budget (category + limit)                  |
| DELETE | `/api/budgets/:category`   | Remove a budget                                         |
| GET    | `/api/health`              | Health check                                            |

---

## Feature: PDF Bank Statement Upload

Lets users drag and drop a PDF bank statement onto the dashboard. The system extracts text, uses Gemini to identify transactions, and shows an editable preview before anything is saved.

### Data Flow

```
1. PDFUpload.tsx
   User drags a PDF onto the dashboard drop zone

2. api.ts → uploadPDF()
   File is wrapped in FormData, sent via
   POST /api/upload (multipart/form-data)

3. Multer middleware (backend)
   Receives the file as an in-memory buffer
   (no disk writes), max size 10MB, PDF only

4. extractTextFromPDF()
   pdfjs-dist reads every page and concatenates
   all text content into one raw string

5. extractExpensesFromText()
   Raw text + a structured-extraction system prompt
   sent to Gemini 1.5 Flash with
   responseMimeType: "application/json"
   Model returns a JSON array of transactions,
   skipping credits/deposits/refunds

6. Date + amount correction
   Backend forces the current year onto any date
   Gemini got wrong, and takes Math.abs() of amounts
   (AI-inferred years are never trusted directly)

7. Preview table (frontend)
   Extracted expenses are shown in an editable table —
   description, category (dropdown), amount, date
   Rows can be edited or deleted before saving

8. POST /api/expenses/bulk
   On "Save All", the edited array is sent in one
   request and looped into SQLite inserts

9. Dashboard refresh
   onSaved() callback triggers fetchData(),
   charts and transaction list update immediately
```

### Key Files

| File                                    | Role                                                         |
| --------------------------------------- | ------------------------------------------------------------ |
| `backend/src/routes/upload.ts`          | Multer config, PDF text extraction, Gemini extraction prompt |
| `backend/src/routes/expenses.ts`        | `/bulk` route for saving the final reviewed list             |
| `frontend/src/components/PDFUpload.tsx` | Drag-and-drop zone, upload states, editable preview table    |
| `frontend/src/api.ts`                   | `uploadPDF()` and `saveBulkExpenses()`                       |

### Important Technical Notes

**`pdf-parse` is broken under ESM/tsx** — it throws `pdfParse is not a function` when default-imported. Use `pdfjs-dist` instead:

```typescript
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item: any) => item.str).join(" ") + "\n";
  }
  return fullText;
}
```

**Never trust AI-extracted years.** Gemini sometimes infers an old year (e.g. 2023) when the statement text doesn't clearly show one. Always override with the current year server-side before saving:

```typescript
const currentYear = new Date().getFullYear().toString();
date: exp.date?.startsWith(currentYear)
  ? exp.date
  : `${currentYear}-${exp.date?.slice(5)}`;
```

**Upload limits** — `multer.memoryStorage()` keeps the file in RAM only (never written to disk), capped at 10MB, PDF mimetype only enforced via `fileFilter`.

**Skip non-expense rows** — the extraction prompt explicitly tells Gemini to skip credits, salary deposits, refunds, and balance lines, since a bank statement contains far more than just expenses.

---

## Agent Tools

The agent has 4 tools. It decides which to call based on tool descriptions and the user's message.

| Tool                   | Trigger                              | What it does                                                   |
| ---------------------- | ------------------------------------ | -------------------------------------------------------------- |
| `parseAndSaveExpenses` | User provides expense data           | Extracts structured expenses from any format, saves to SQLite  |
| `analyzeSpending`      | User asks about spending             | Queries SQLite, returns totals by category + monthly summary   |
| `getFinancialAdvice`   | User asks for advice/tips            | Searches RAG vector store, returns relevant financial guidance |
| `clearExpenses`        | User asks to reset                   | Deletes all rows from expenses table                           |
| `setBudget`            | User wants to set/change a limit     | Upserts a budget row (category or "Overall")                   |
| `checkBudgetStatus`    | After saving expenses, or on request | Compares spend vs limits, returns safe/warning/over status     |

---

## Database Schema

```sql
CREATE TABLE expenses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  amount      REAL NOT NULL,
  category    TEXT NOT NULL,       -- Housing, Food, Transport, etc.
  date        TEXT NOT NULL,       -- YYYY-MM-DD
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE conversations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  role        TEXT NOT NULL,       -- 'user' or 'model'
  content     TEXT NOT NULL,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE budgets (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  category      TEXT NOT NULL UNIQUE,  -- 'Overall' or an expense category
  limit_amount  REAL NOT NULL,
  created_at    TEXT DEFAULT (datetime('now'))
);
```

---

## Expense Categories

The agent automatically assigns one of these categories to each expense:

`Housing` · `Food` · `Transport` · `Entertainment` · `Shopping` · `Health` · `Utilities` · `Education` · `Other`

---

## Environment Variables

### Backend `.env`

```
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
```

---

## Important Technical Notes

### Recharts

- Use `type` imports for interfaces: `import { type CategoryData } from "../types"`
- Pie label callback: type as `any` — `label={({ name, percent }: any) => ...}`
- Pass `fill` in data objects instead of using deprecated `<Cell>` component:
  ```tsx
  const data = items.map((item, i) => ({ ...item, fill: COLORS[i] }));
  ```

### Gemini SDKs

Two SDKs are used side by side:

- `@google/generative-ai` — for chat and tool calling (`getGenerativeModel`)
- `@google/genai` — for embeddings (`models.embedContent` with `gemini-embedding-001`)

The old `text-embedding-004` model name is deprecated and returns 404. Always use `gemini-embedding-001` via the new SDK.

### Agent Safety

Always keep `maxSteps = 8` in the agent loop. Without it, a confused model can loop indefinitely and exhaust your API quota.

---

## Feature: Budget Goals

Lets users set spending limits — either one overall monthly budget or per-category limits (Food, Transport, etc.) — and get warned automatically when they're close to or over the line.

### Data Flow

```
Budget can be set two ways:
  A) BudgetPanel.tsx form → POST /api/budgets directly
  B) Chat message ("set my food budget to 8000") → agent
     recognizes intent → calls setBudget tool

Either path writes to the budgets table via an UPSERT
(category is UNIQUE, so re-setting a budget just updates it)

On read (dashboard load, or after any expense is saved):
  getBudgetStatuses() in budgetTools.ts runs:
    1. Pulls all budgets from SQLite
    2. Pulls current month's spend by category
    3. For "Overall" budget, sums all categories
    4. Calculates percentUsed = spent / limit * 100
    5. Assigns status:
         < 80%   → safe   (green)
         80-99%  → warning (amber)
         >= 100% → over   (red)

Two places consume this:
  - GET /api/budgets → BudgetPanel.tsx renders progress bars
  - checkBudgetStatus tool → agent calls this proactively
    after parseAndSaveExpenses and mentions warnings in
    its natural-language reply, without being asked
```

### Key Files

| File                                      | Role                                                            |
| ----------------------------------------- | --------------------------------------------------------------- |
| `backend/src/db/database.ts`              | `budgets` table + `budgetQueries` (upsert, getAll, delete)      |
| `backend/src/agent/budgetTools.ts`        | `getBudgetStatuses()` — core comparison logic                   |
| `backend/src/agent/tools.ts`              | `setBudget` and `checkBudgetStatus` tool definitions            |
| `backend/src/agent/agent.ts`              | System prompt instructs agent to check budgets after every save |
| `backend/src/routes/budgets.ts`           | REST endpoints for manual budget management                     |
| `frontend/src/components/BudgetPanel.tsx` | Add/edit form + color-coded progress bars on dashboard          |

### Why This Matters (Proactive Agent Behavior)

This is the first place in the app where the agent acts **without being explicitly asked**. The system prompt rule —

> "After saving expenses, ALWAYS call checkBudgetStatus and mention if any budget is near or over limit"

— turns the agent from purely reactive (answers questions) into proactive (volunteers useful information). This is the same pattern production assistants use for things like fraud alerts or low-balance warnings.

---

## Feature: Model Fallback Chain

Gemini occasionally returns `429` (rate limited) or `503` (overloaded) during high traffic. Instead of the whole agent failing, every chat call silently retries with a lighter model.

### Fallback Chain

```
gemini-2.5-flash          (primary — best balance of speed/quality)
        ↓ on 429/503
gemini-2.5-flash-lite      (faster, cheaper, still solid)
        ↓ on 429/503
gemini-3.5-flash           (final fallback)
        ↓ on 429/503
throws — all models exhausted
```

Any **other** error type (400 bad request, 401 auth, etc.) skips the fallback chain entirely and fails immediately — fallback is only for capacity-related errors, never for bugs in the request itself.

### Data Flow

```
agent.ts loop calls generateWithFallback() once per step
        ↓
modelFallback.ts tries gemini-2.5-flash
        ↓ (success) → returns response + which model was used
        ↓ (429/503) → logs warning, tries next model in chain
        ↓ (any other error) → throws immediately, no retry
        ↓
Same tools, same systemInstruction, same conversation history
are reused across every attempt — only the model name changes
```

### Key Files

| File                                 | Role                                                               |
| ------------------------------------ | ------------------------------------------------------------------ |
| `backend/src/agent/modelFallback.ts` | `generateWithFallback()` — the retry/fallback wrapper              |
| `backend/src/agent/agent.ts`         | Calls `generateWithFallback()` instead of calling a model directly |

### Important Technical Notes

**Fallback is per agent step, not per conversation.** If step 3 of an 8-step tool-calling loop hits a 429, only that step retries with a lighter model — the rest of the loop continues normally, so the user never sees a full failure mid-conversation.

**This app's confirmed working chain (June 2026):** `gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-3.5-flash`.

---

## Color Palette (Active Theme — Dark Blue)

| Name    | Hex       | Usage                                 |
| ------- | --------- | ------------------------------------- |
| Base    | `#141619` | App background                        |
| Surface | `#2c2e3a` | Card surfaces, input areas            |
| Deep    | `#050a44` | Headers, user message bubbles         |
| Accent  | `#0a21c0` | Buttons, progress bars, active states |
| Muted   | `#b3b4bd` | Secondary text                        |

> Note: an earthy "Café Noir / Kombu / Moss" palette was tried and reverted. CSS variables for it may still exist commented out — the active theme is the dark blue one above.

---
