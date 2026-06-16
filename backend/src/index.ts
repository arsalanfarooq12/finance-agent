import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import chatRoutes from "./routes/chat.js";
import expenseRoutes from "./routes/expenses.js";
import { vectorStore } from "./agent/knowledgeBase.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/expenses", expenseRoutes);

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
