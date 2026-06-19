import axios from "axios";
import { type CategoryData, type Expense, type MonthlyData } from "./types";
const API_URL = import.meta.env.VITE_API_URL || "/api";
export const sendMessage = async (message: string) => {
  const { data } = await axios.post(`${API_URL}/chat`, { message });
  return data as { reply: string; toolsCalled: string[] };
};

export const getExpenses = async (): Promise<Expense[]> => {
  const { data } = await axios.get(`${API_URL}/expeses`);
  return data;
};

export const getCategories = async (): Promise<CategoryData[]> => {
  const { data } = await axios.get(`${API_URL}/expenses/categories`);
  return data;
};

export const getMonthly = async (): Promise<MonthlyData[]> => {
  const { data } = await axios.get(`${API_URL}/expenses/monthly`);
  return data;
};

export const deleteExpense = async (id: number) => {
  await axios.delete(`${API_URL}/expenses/${id}`);
};
export interface ExtractedExpense {
  description: string;
  amount: number;
  category: string;
  date: string;
}

export const uploadPDF = async (
  file: File
): Promise<{
  expenses: ExtractedExpense[];
  message: string;
  pageCount: number;
}> => {
  const formData = new FormData();
  formData.append("pdf", file);

  const { data } = await axios.post(`${API_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const saveBulkExpenses = async (
  expenses: ExtractedExpense[]
): Promise<void> => {
  await axios.post(`${API_URL}/expenses/bulk`, { expenses });
};
export const clearAll = async () => {
  await axios.delete(`${API_URL}/expenses`);
};

export interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: "safe" | "warning" | "over";
}

export const getBudgets = async (): Promise<BudgetStatus[]> => {
  const { data } = await axios.get(`${API_URL}/budgets`);
  return data;
};

export const setBudget = async (
  category: string,
  limit: number
): Promise<void> => {
  await axios.post(`${API_URL}/budgets`, { category, limit });
};

export const deleteBudget = async (category: string): Promise<void> => {
  await axios.delete(`${API_URL}/budgets/${category}`);
};
