# FinanceAI — Personal Finance Agent

A fullstack AI-powered personal finance assistant. Paste your expenses in natural language or CSV, and the agent categorizes them, analyzes your spending, and gives personalized financial advice — all in real time.

---

## Tech Stack

| Layer       | Technology                                |
| ----------- | ----------------------------------------- |
| Frontend    | React + TypeScript + Vite                 |
| Styling     | Tailwind CSS v4 + custom CSS variables    |
| Charts      | Recharts                                  |
| HTTP client | Axios                                     |
| Backend     | Express + TypeScript                      |
| Database    | SQLite via `better-sqlite3`               |
| AI model    | Gemini 1.5 Flash (chat + tools)           |
| Embeddings  | gemini-embedding-001 (RAG)                |
| AI SDKs     | `@google/generative-ai` + `@google/genai` |

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

| Method | Endpoint                   | Description                        |
| ------ | -------------------------- | ---------------------------------- |
| POST   | `/api/chat`                | Send a message to the agent        |
| GET    | `/api/expenses`            | Get all expenses                   |
| GET    | `/api/expenses/categories` | Get totals grouped by category     |
| GET    | `/api/expenses/monthly`    | Get totals grouped by month        |
| DELETE | `/api/expenses/:id`        | Delete a single expense            |
| DELETE | `/api/expenses`            | Clear all expenses + conversations |
| GET    | `/api/health`              | Health check                       |

---

## Agent Tools

The agent has 4 tools. It decides which to call based on tool descriptions and the user's message.

| Tool                   | Trigger                    | What it does                                                   |
| ---------------------- | -------------------------- | -------------------------------------------------------------- |
| `parseAndSaveExpenses` | User provides expense data | Extracts structured expenses from any format, saves to SQLite  |
| `analyzeSpending`      | User asks about spending   | Queries SQLite, returns totals by category + monthly summary   |
| `getFinancialAdvice`   | User asks for advice/tips  | Searches RAG vector store, returns relevant financial guidance |
| `clearExpenses`        | User asks to reset         | Deletes all rows from expenses table                           |

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

## What to Build Next (Phase 4)

- [ ] Multi-agent system (orchestrator + specialist agents)
- [ ] File upload — parse expenses from PDF bank statements
- [ ] Budget goals — set limits per category, get alerts
- [ ] Export to CSV
- [ ] User authentication (multiple users, separate data)
- [ ] Deploy to Railway (backend) + Vercel (frontend)
