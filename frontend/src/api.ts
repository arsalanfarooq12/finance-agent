import axios from "axios";
import { supabase } from "./lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// centralized Axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
});

//  inject Supabase auth header into every request
apiClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export interface ExtractedExpense {
  [key: string]: any;
}

export const sendMessage = async (message: string) => {
  const { data } = await apiClient.post<{
    reply: string;
    toolsCalled: string[];
  }>("/chat", { message });
  return data;
};

export const getExpenses = async () => {
  const { data } = await apiClient.get("/expenses");
  return data;
};

export const getCategories = async () => {
  const { data } = await apiClient.get("/expenses/categories");
  return data;
};

export const getMonthly = async () => {
  const { data } = await apiClient.get("/expenses/monthly");
  return data;
};

export const deleteExpense = async (id: number) => {
  await apiClient.delete(`/expenses/${id}`);
};

export const clearAll = async () => {
  await apiClient.delete("/expenses");
};

export const uploadPDF = async (file: File) => {
  const formData = new FormData();
  formData.append("pdf", file);

  const { data } = await apiClient.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const saveBulkExpenses = async (expenses: ExtractedExpense[]) => {
  await apiClient.post("/expenses/bulk", { expenses });
};

export const getBudgets = async () => {
  const { data } = await apiClient.get("/budgets");
  return data;
};

export const setBudget = async (category: string, limit: number) => {
  await apiClient.post("/budgets", { category, limit });
};

export const deleteBudget = async (category: string) => {
  await apiClient.delete(`/budgets/${encodeURIComponent(category)}`);
};
export const getChatHistory = async () => {
  const { data } = await apiClient.get<
    { role: "user" | "assistant"; content: string; createdAt: string | null }[]
  >("/chat/history");
  return data;
};

export interface PendingConfirmation {
  threadId: string;
  action: string;
  message: string;
}

export interface StreamHandlers {
  onToken: (token: string) => void;
  onAgent: (agent: string) => void;
  onDone: () => void;
  onError: () => void;
  onInterrupt: (p: PendingConfirmation) => void;
  onRateLimited?: (message: string) => void;
}

async function postSSE(
  path: string,
  body: unknown,
  h: StreamHandlers
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ""}`,
    },
    body: JSON.stringify(body),
  });
  // Handle rate limiting and errors
  if (response.status === 429) {
    const body = await response.json().catch(() => null);
    h.onRateLimited?.(
      body?.error ?? "Too many requests. Please try again shortly."
    );
    return;
  }
  // Handle non-OK responses
  if (!response.ok || !response.body) {
    h.onError();
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const { chunk, type } = JSON.parse(trimmed.slice(6));
          if (type === "token") h.onToken(chunk);
          else if (type === "agent") h.onAgent(chunk);
          else if (type === "interrupt") h.onInterrupt(chunk);
          else if (type === "done") h.onDone();
          else if (type === "error") h.onError();
        } catch {
          // skip malformed JSON chunks
        }
      }
    }
  } catch {
    h.onError();
  }
}

export const streamMessage = (message: string, h: StreamHandlers) =>
  postSSE("/chat/stream", { message }, h);

export const resumeMessage = (
  threadId: string,
  approved: boolean,
  h: StreamHandlers
) => postSSE("/chat/resume", { threadId, approved }, h);
