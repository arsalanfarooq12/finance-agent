import { Router } from "express";
import { expenseQueries } from "../db/database.js";
import { conversationQueries } from "../db/database.js";

const router = Router();

// Get all expenses
router.get("/", (req, res) => {
  const expenses = expenseQueries.getAll.all();
  res.json(expenses);
});

// Get category breakdown
router.get("/categories", (req, res) => {
  const categories = expenseQueries.getByCategory.all();
  res.json(categories);
});

// Get monthly summary
router.get("/monthly", (req, res) => {
  const monthly = expenseQueries.getMonthly.all();
  res.json(monthly);
});

// Delete single expense
router.delete("/:id", (req, res) => {
  expenseQueries.deleteById.run(req.params.id);
  res.json({ success: true });
});

// Clear all data
router.delete("/", (req, res) => {
  expenseQueries.deleteAll.run();
  conversationQueries.clearAll.run();
  res.json({ success: true });
});

export default router;
