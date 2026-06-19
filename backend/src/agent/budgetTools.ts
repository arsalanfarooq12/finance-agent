import { budgetQueries, expenseQueries } from "../db/database.js";

export interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: "safe" | "warning" | "over";
}

export function getBudgetStatuses(): BudgetStatus[] {
  const budgets = budgetQueries.getAll.all() as Array<{
    category: string;
    limit_amount: number;
  }>;
  if (budgets.length === 0) return [];

  // Get current month's spending by category
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const byCategory = expenseQueries.getByCategory.all() as Array<{
    category: string;
    total: number;
  }>;

  const totalSpend = byCategory.reduce((sum, c) => sum + c.total, 0);

  return budgets.map((budget) => {
    const spent =
      budget.category === "Overall"
        ? totalSpend
        : byCategory.find((c) => c.category === budget.category)?.total ?? 0;

    const percentUsed = (spent / budget.limit_amount) * 100;

    let status: BudgetStatus["status"] = "safe";
    if (percentUsed >= 100) status = "over";
    else if (percentUsed >= 80) status = "warning";

    return {
      category: budget.category,
      limit: budget.limit_amount,
      spent,
      remaining: Math.max(budget.limit_amount - spent, 0),
      percentUsed: Math.min(percentUsed, 999),
      status,
    };
  });
}
