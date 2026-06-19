import { useEffect, useState } from "react";
// import PDFUpload from "./PDFUpload";
import BudgetPanel from "./BudgetPanel";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getCategories,
  getMonthly,
  getExpenses,
  deleteExpense,
  clearAll,
} from "../api";
import { type CategoryData, type Expense, type MonthlyData } from "../types";
import UploadStatement from "./UploadStatement";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#14b8a6",
];

interface Props {
  refreshKey: number;
}

export default function Dashboard({ refreshKey }: Props) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, mon, exps] = await Promise.all([
        getCategories(),
        getMonthly(),
        getExpenses(),
      ]);
      setCategories(cats);
      setMonthly(mon);
      setExpenses(exps);
      setTotal(cats.reduce((sum, c) => sum + c.total, 0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleDelete = async (id: number) => {
    await deleteExpense(id);
    fetchData();
  };

  const handleClearAll = async () => {
    if (!confirm("Clear all expenses and conversation history?")) return;
    await clearAll();
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-center px-8">
        {/* <div className="text-5xl mb-4">📊</div> */}
        <UploadStatement fetchData={fetchData} />
        <h3 className="text-white font-semibold text-lg mb-2">
          No expenses yet
        </h3>
        <p className="text-gray-400 text-sm">
          Paste your expenses in the chat and your dashboard will update
          automatically.
        </p>
      </div>
    );
  }

  const categoriesWithColor = categories.map((cat, i) => ({
    ...cat,
    fill: COLORS[i % COLORS.length],
  }));
  return (
    <div className="h-full overflow-y-auto bg-gray-900 px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Dashboard</h2>
          <p className="text-gray-400 text-xs mt-0.5">
            Total: ₹{total.toLocaleString("en-IN")}
          </p>
        </div>
        <button
          onClick={handleClearAll}
          className="text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 px-3 py-1.5 rounded-lg transition-colors"
        >
          Clear All
        </button>
      </div>
      <UploadStatement fetchData={fetchData} />
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-gray-400 text-xs">Total Spend</p>
          <p className="text-white font-bold text-lg mt-0.5">
            ₹{total.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-gray-400 text-xs">Transactions</p>
          <p className="text-white font-bold text-lg mt-0.5">
            {expenses.length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-gray-400 text-xs">Categories</p>
          <p className="text-white font-bold text-lg mt-0.5">
            {categories.length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-gray-400 text-xs">Top Category</p>
          <p className="text-white font-bold text-lg mt-0.5">
            {categories[0]?.category ?? "—"}
          </p>
          <p className="text-white font-medium text-sm mt-0.5">
            ₹{categories[0]?.total?.toLocaleString("en-IN") ?? "—"}
          </p>
        </div>
      </div>
      <BudgetPanel refreshKey={refreshKey} />
      {/* Pie Chart */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-white text-sm font-medium mb-3">
          Spending by Category
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={categoriesWithColor}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={75}
              label={({ name, percent }: any) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
              fontSize={10}
            ></Pie>
            <Tooltip
              formatter={(val: any) => `₹${val.toLocaleString("en-IN")}`}
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      {monthly.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="text-white text-sm font-medium mb-3">
            Monthly Spending
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthly}>
              <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: any) => `₹${val.toLocaleString("en-IN")}`}
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-white text-sm font-medium mb-3">
          Category Breakdown
        </h3>
        <div className="space-y-2">
          {categories.map((cat, i) => (
            <div key={cat.category}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">{cat.category}</span>
                <span className="text-gray-400">
                  ₹{cat.total.toLocaleString("en-IN")} · {cat.count} items
                </span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(cat.total / total) * 100}%`,
                    backgroundColor: COLORS[i % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-white text-sm font-medium mb-3">
          All Transactions
        </h3>
        <div className="space-y-2">
          {expenses.slice(0, 20).map((exp) => (
            <div
              key={exp.id}
              className="flex items-center justify-between py-1.5 border-b border-gray-700 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  {exp.description}
                </p>
                <p className="text-gray-500 text-xs">
                  {exp.category} · {exp.date}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="text-white text-xs font-medium">
                  ₹{exp.amount.toLocaleString("en-IN")}
                </span>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
