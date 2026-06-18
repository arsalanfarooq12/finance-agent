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

  const { data } = await axios.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const saveBulkExpenses = async (
  expenses: ExtractedExpense[]
): Promise<void> => {
  await axios.post("/api/expenses/bulk", { expenses });
};
export const clearAll = async () => {
  await axios.delete("/api/expenses");
};
