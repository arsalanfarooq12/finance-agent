export interface Message {
  role: "user" | "assistant";
  content: string;
  toolsCalled?: string[];
  timestamp: Date;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface CategoryData {
  category: string;
  total: number;
  count: number;
}

export interface MonthlyData {
  month: string;
  total: number;
  count: number;
}
