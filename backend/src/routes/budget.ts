import { Router } from "express";
import { type AuthRequest } from "../middleware/verifyToken.js";
import {
  getAllBudgets,
  upsertBudget,
  deleteBudgetByCategory,
  getExpensesByCategory,
  getTotalSpend,
} from "../db/database.js";

const router = Router();

interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: "safe" | "warning" | "over";
}

router.get("/", async (req: AuthRequest, res) => {
  try {
    const budgets = await getAllBudgets(req.userId!);
    if (budgets.length === 0) return res.json([]);

    const byCategory = await getExpensesByCategory(req.userId!);
    const totalSpend = await getTotalSpend(req.userId!);

    const statuses: BudgetStatus[] = budgets.map((b: any) => {
      const spent =
        b.category === "Overall"
          ? totalSpend
          : byCategory.find((c: any) => c.category === b.category)?.total ?? 0;

      const percentUsed = (spent / Number(b.limit_amount)) * 100;
      const status =
        percentUsed >= 100 ? "over" : percentUsed >= 80 ? "warning" : "safe";

      return {
        category: b.category,
        limit: Number(b.limit_amount),
        spent,
        remaining: Math.max(Number(b.limit_amount) - spent, 0),
        percentUsed,
        status,
      };
    });

    res.json(statuses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { category, limit } = req.body;
    if (!category || !limit) {
      return res.status(400).json({ error: "category and limit are required" });
    }
    await upsertBudget(req.userId!, category, limit);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:category", async (req: AuthRequest, res) => {
  try {
    const category = req.params.category;
    if (typeof category !== "string") {
      return res.status(400).json({ error: "Invalid category" });
    }
    await deleteBudgetByCategory(req.userId!, category);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
