import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import chatRoutes from "./routes/chat.js";
import expenseRoutes from "./routes/expenses.js";
import { vectorStore } from "./agent/knowledgeBase.js";
import uploadRoutes from "./routes/upload.js";
import budgetRoutes from "./routes/budget.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins: string[] = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter((value): value is string => Boolean(value));

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/upload", uploadRoutes);

app.use("/api/budgets", budgetRoutes);
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  await vectorStore.initialize();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);
