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
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL?.trim().replace(/\/$/, ""), // trim + strip trailing slash
].filter((origin): origin is string => Boolean(origin));

console.log("Allowed CORS origins:", allowedOrigins); // temporary debug log

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked CORS origin:", origin); // temporary debug log
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
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
    console.log(`Server running on PORT ${PORT}`);
  });
}

start().catch(console.error);
