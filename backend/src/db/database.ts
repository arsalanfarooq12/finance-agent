import { supabase } from "../lib/supabase.js";

// ── EXPENSES ─────────────────────────────────────────────────

export async function insertExpense(
  userId: string,
  expense: {
    description: string;
    amount: number;
    category: string;
    date: string;
  }
) {
  const { error } = await supabase
    .from("expenses")
    .insert({ ...expense, user_id: userId });
  if (error) throw error;
}

export async function getAllExpenses(userId: string) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getExpensesByCategory(userId: string) {
  const { data, error } = await supabase
    .from("expenses")
    .select("category, amount")
    .eq("user_id", userId);
  if (error) throw error;

  // Group by category client-side
  const grouped: Record<string, { total: number; count: number }> = {};
  for (const row of data) {
    if (!grouped[row.category]) grouped[row.category] = { total: 0, count: 0 };
    grouped[row.category]!.total += Number(row.amount);
    grouped[row.category]!.count += 1;
  }

  return Object.entries(grouped)
    .map(([category, { total, count }]) => ({ category, total, count }))
    .sort((a, b) => b.total - a.total);
}

export async function getMonthlyExpenses(userId: string) {
  const { data, error } = await supabase
    .from("expenses")
    .select("date, amount")
    .eq("user_id", userId);
  if (error) throw error;

  // Group by YYYY-MM client-side
  const grouped: Record<string, { total: number; count: number }> = {};
  for (const row of data) {
    const month = row.date.slice(0, 7);
    if (!grouped[month]) grouped[month] = { total: 0, count: 0 };
    grouped[month].total += Number(row.amount);
    grouped[month].count += 1;
  }

  return Object.entries(grouped)
    .map(([month, { total, count }]) => ({ month, total, count }))
    .sort((a, b) => b.month.localeCompare(a.month));
}

export async function getTotalSpend(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("expenses")
    .select("amount")
    .eq("user_id", userId);
  if (error) throw error;
  return data.reduce((sum, row) => sum + Number(row.amount), 0);
}

export async function deleteExpenseById(userId: string, id: string) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId); // safety: user can only delete their own
  if (error) throw error;
}

export async function deleteAllExpenses(userId: string) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}

export async function bulkInsertExpenses(
  userId: string,
  expenses: Array<{
    description: string;
    amount: number;
    category: string;
    date: string;
  }>
) {
  const rows = expenses.map((e) => ({ ...e, user_id: userId }));
  const { error } = await supabase.from("expenses").insert(rows);
  if (error) throw error;
}

// ── BUDGETS ──────────────────────────────────────────────────

export async function upsertBudget(
  userId: string,
  category: string,
  limitAmount: number
) {
  const { error } = await supabase
    .from("budgets")
    .upsert(
      { user_id: userId, category, limit_amount: limitAmount },
      { onConflict: "user_id,category" }
    );
  if (error) throw error;
}

export async function getAllBudgets(userId: string) {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function deleteBudgetByCategory(userId: string, category: string) {
  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("user_id", userId)
    .eq("category", category);
  if (error) throw error;
}

// ── CONVERSATIONS ─────────────────────────────────────────────

export async function insertConversation(
  userId: string,
  role: string,
  content: string
) {
  const { error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, role, content });
  if (error) throw error;
}

export async function getRecentConversations(userId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("role, content")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(20);
  if (error) throw error;
  return data;
}

export async function clearConversations(userId: string) {
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}
