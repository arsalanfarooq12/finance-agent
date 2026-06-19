import { Router } from "express";
import { budgetQueries } from "../db/database.js";
import { getBudgetStatuses } from "../agent/budgetTools.js";

const router = Router();

router.get("/", (req, res) => {
  const statuses = getBudgetStatuses();
  res.json(statuses);
});

router.post("/", (req, res) => {
  const { category, limit } = req.body;
  if (!category || !limit) {
    return res.status(400).json({ error: "category and limit are required" });
  }
  budgetQueries.upsert.run({ category, limit_amount: limit });
  res.json({ success: true });
});

router.delete("/:category", (req, res) => {
  budgetQueries.delete.run(req.params.category);
  res.json({ success: true });
});

export default router;
