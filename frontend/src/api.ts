import axios from "axios";
import { type CategoryData, type Expense, type MonthlyData } from "./types";

export const sendMessage = async (message: string) => {
  const { data } = await axios.post("/api/chat", { message });
  return data as { reply: string; toolsCalled: string[] };
};

export const getExpenses = async (): Promise<Expense[]> => {
  const { data } = await axios.get("/api/expenses");
  return data;
};

export const getCategories = async (): Promise<CategoryData[]> => {
  const { data } = await axios.get("/api/expenses/categories");
  return data;
};

export const getMonthly = async (): Promise<MonthlyData[]> => {
  const { data } = await axios.get("/api/expenses/monthly");
  return data;
};

export const deleteExpense = async (id: number) => {
  await axios.delete(`/api/expenses/${id}`);
};

export const clearAll = async () => {
  await axios.delete("/api/expenses");
};
