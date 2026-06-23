import axios from "axios";
import { supabase } from "./lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// Minimal type for extracted expenses returned from PDF parsing
export interface ExtractedExpense {
  [key: string]: any;
}

// Helper that adds auth header automatically
async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    Authorization: `Bearer ${session?.access_token ?? ""}`,
  };
}

export const sendMessage = async (message: string) => {
  const { data } = await axios.post(
    `${API_URL}/chat`,
    { message },
    { headers: await authHeaders() }
  );
  return data as { reply: string; toolsCalled: string[] };
};

export const getExpenses = async () => {
  const { data } = await axios.get(`${API_URL}/expenses`, {
    headers: await authHeaders(),
  });
  return data;
};

export const getCategories = async () => {
  const { data } = await axios.get(`${API_URL}/expenses/categories`, {
    headers: await authHeaders(),
  });
  return data;
};

export const getMonthly = async () => {
  const { data } = await axios.get(`${API_URL}/expenses/monthly`, {
    headers: await authHeaders(),
  });
  return data;
};

export const deleteExpense = async (id: number) => {
  await axios.delete(`${API_URL}/expenses/${id}`, {
    headers: await authHeaders(),
  });
};

export const clearAll = async () => {
  await axios.delete(`${API_URL}/expenses`, {
    headers: await authHeaders(),
  });
};

export const uploadPDF = async (file: File) => {
  const formData = new FormData();
  formData.append("pdf", file);
  const { data } = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(await authHeaders()),
    },
  });
  return data;
};

export const saveBulkExpenses = async (expenses: ExtractedExpense[]) => {
  await axios.post(
    `${API_URL}/expenses/bulk`,
    { expenses },
    { headers: await authHeaders() }
  );
};

export const getBudgets = async () => {
  const { data } = await axios.get(`${API_URL}/budgets`, {
    headers: await authHeaders(),
  });
  return data;
};

export const setBudget = async (category: string, limit: number) => {
  await axios.post(
    `${API_URL}/budgets`,
    { category, limit },
    { headers: await authHeaders() }
  );
};

export const deleteBudget = async (category: string) => {
  await axios.delete(`${API_URL}/budgets/${encodeURIComponent(category)}`, {
    headers: await authHeaders(),
  });
};
