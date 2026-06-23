import { Router } from "express";
import { type AuthRequest } from "../middleware/verifyToken.js";
import {
  getAllExpenses,
  getExpensesByCategory,
  getMonthlyExpenses,
  deleteExpenseById,
  deleteAllExpenses,
  bulkInsertExpenses,
} from "../db/database.js";
import { clearConversations } from "../db/database.js";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  try {
    const data = await getAllExpenses(req.userId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/categories", async (req: AuthRequest, res) => {
  try {
    const data = await getExpensesByCategory(req.userId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/monthly", async (req: AuthRequest, res) => {
  try {
    const data = await getMonthlyExpenses(req.userId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/bulk", async (req: AuthRequest, res) => {
  try {
    const { expenses } = req.body;
    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({ error: "No expenses provided" });
    }
    await bulkInsertExpenses(req.userId!, expenses);
    res.json({ saved: expenses.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/", async (req: AuthRequest, res) => {
  try {
    await deleteAllExpenses(req.userId!);
    await clearConversations(req.userId!);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const expenseId = req.params.id;
    if (typeof expenseId !== "string") {
      return res.status(400).json({ error: "Invalid expense id" });
    }

    await deleteExpenseById(req.userId!, expenseId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;