import {
  getAllBudgets,
  getExpensesByCategory,
  getTotalSpend,
} from "../db/database.js";
export interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: "safe" | "warning" | "over";
}

export async function getBudgetStatuses(userId: string) {
  const budgets = await getAllBudgets(userId);
  if (budgets.length === 0) return [];

  const byCategory = await getExpensesByCategory(userId);
  const totalSpend = await getTotalSpend(userId);

  return budgets.map((budget: any) => {
    const spent =
      budget.category === "Overall"
        ? totalSpend
        : byCategory.find((c: any) => c.category === budget.category)?.total ??
          0;

    const percentUsed = (spent / Number(budget.limit_amount)) * 100;
    const status =
      percentUsed >= 100 ? "over" : percentUsed >= 80 ? "warning" : "safe";

    return {
      category: budget.category,
      limit: Number(budget.limit_amount),
      spent,
      remaining: Math.max(Number(budget.limit_amount) - spent, 0),
      percentUsed,
      status,
    };
  });
}
