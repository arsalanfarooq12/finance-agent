import { useEffect, useState } from "react";
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

// ── Skeleton primitives ───────────────────────────────────────────────────────

function SkeletonBlock({
  className = "",
  style = {},
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: "#3d3d3d", ...style }}
    />
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: "#2d2d2d" }}>
      <SkeletonBlock className="h-3 w-16 mb-2" />
      <SkeletonBlock className="h-6 w-24" />
    </div>
  );
}

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "#2d2d2d" }}>
      <SkeletonBlock className="h-4 w-36 mb-4" />
      <SkeletonBlock style={{ height }} />
    </div>
  );
}

function TransactionRowSkeleton() {
  return (
    <div
      className="flex items-center justify-between py-2 border-b last:border-0"
      style={{ borderColor: "#3d3d3d" }}
    >
      <div className="flex-1 space-y-1.5">
        <SkeletonBlock className="h-3 w-3/4" />
        <SkeletonBlock className="h-2.5 w-1/3" />
      </div>
      <SkeletonBlock className="h-3 w-12 ml-4" />
    </div>
  );
}

function CategoryRowSkeleton() {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <SkeletonBlock className="h-2.5 w-20" />
        <SkeletonBlock className="h-2.5 w-24" />
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: "#3d3d3d" }}
      >
        <div
          className="h-full rounded-full animate-pulse"
          style={{ width: "50%", backgroundColor: "#4d4d5d" }}
        />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="h-full overflow-y-auto px-4 py-4 space-y-4"
      style={{ backgroundColor: "#212121" }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <SkeletonBlock className="h-5 w-24" />
          <SkeletonBlock className="h-3 w-32" />
        </div>
        <SkeletonBlock className="h-7 w-16 rounded-lg" />
      </div>
      <SkeletonBlock className="h-12 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="rounded-xl p-4" style={{ backgroundColor: "#2d2d2d" }}>
        <SkeletonBlock className="h-4 w-28 mb-3" />
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <CategoryRowSkeleton key={i} />
          ))}
        </div>
      </div>
      <ChartSkeleton height={200} />
      <ChartSkeleton height={160} />
      <div className="rounded-xl p-4" style={{ backgroundColor: "#2d2d2d" }}>
        <SkeletonBlock className="h-4 w-36 mb-3" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <CategoryRowSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="rounded-xl p-4" style={{ backgroundColor: "#2d2d2d" }}>
        <SkeletonBlock className="h-4 w-32 mb-3" />
        {[...Array(6)].map((_, i) => (
          <TransactionRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

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

  if (loading) return <DashboardSkeleton />;

  if (total === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full text-center px-8"
        style={{ backgroundColor: "#212121" }}
      >
        <UploadStatement fetchData={fetchData} />
        <h3 className="text-lg font-semibold mt-4" style={{ color: "#ececec" }}>
          No expenses yet
        </h3>
        <p className="text-sm mt-1" style={{ color: "#8e8ea0" }}>
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
    <div
      className="h-full overflow-y-auto px-4 py-4 space-y-4"
      style={{ backgroundColor: "#212121" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg" style={{ color: "#ececec" }}>
            Dashboard
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#8e8ea0" }}>
            Total: ₹{total.toLocaleString("en-IN")}
          </p>
        </div>
        <button
          onClick={handleClearAll}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: "#ef4444", border: "1px solid #3d3d3d" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "#ef4444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "#3d3d3d";
          }}
        >
          Clear All
        </button>
      </div>

      <UploadStatement fetchData={fetchData} />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Spend", value: `₹${total.toLocaleString("en-IN")}` },
          { label: "Transactions", value: expenses.length },
          { label: "Categories", value: categories.length },
          {
            label: "Top Category",
            value: categories[0]?.category ?? "—",
            sub: categories[0]?.total
              ? `₹${categories[0].total.toLocaleString("en-IN")}`
              : undefined,
          },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="rounded-xl p-3"
            style={{ backgroundColor: "#2d2d2d" }}
          >
            <p className="text-xs" style={{ color: "#8e8ea0" }}>
              {label}
            </p>
            <p
              className="font-bold text-lg mt-0.5"
              style={{ color: "#ececec" }}
            >
              {value}
            </p>
            {sub && (
              <p
                className="font-medium text-sm mt-0.5"
                style={{ color: "#ececec" }}
              >
                {sub}
              </p>
            )}
          </div>
        ))}
      </div>

      <BudgetPanel refreshKey={refreshKey} />

      {/* Pie Chart */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "#2d2d2d" }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: "#ececec" }}>
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
            />
            <Tooltip
              formatter={(val: any) => `₹${val.toLocaleString("en-IN")}`}
              contentStyle={{
                backgroundColor: "#2d2d2d",
                border: "1px solid #3d3d3d",
                borderRadius: "8px",
                color: "#ececec",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      {monthly.length > 0 && (
        <div className="rounded-xl p-4" style={{ backgroundColor: "#2d2d2d" }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: "#ececec" }}>
            Monthly Spending
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthly}>
              <XAxis dataKey="month" tick={{ fill: "#8e8ea0", fontSize: 11 }} />
              <YAxis
                tick={{ fill: "#8e8ea0", fontSize: 11 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: any) => `₹${val.toLocaleString("en-IN")}`}
                contentStyle={{
                  backgroundColor: "#2d2d2d",
                  border: "1px solid #3d3d3d",
                  borderRadius: "8px",
                  color: "#ececec",
                }}
              />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "#2d2d2d" }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: "#ececec" }}>
          Category Breakdown
        </h3>
        <div className="space-y-2">
          {categories.map((cat, i) => (
            <div key={cat.category}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "#ececec" }}>{cat.category}</span>
                <span style={{ color: "#8e8ea0" }}>
                  ₹{cat.total.toLocaleString("en-IN")} · {cat.count} items
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: "#3d3d3d" }}
              >
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

      {/* Transaction List */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "#2d2d2d" }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: "#ececec" }}>
          All Transactions
        </h3>
        <div>
          {expenses.slice(0, 20).map((exp) => (
            <div
              key={exp.id}
              className="flex items-center justify-between py-1.5 last:border-0"
              style={{ borderBottom: "1px solid #3d3d3d" }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "#ececec" }}
                >
                  {exp.description}
                </p>
                <p className="text-xs" style={{ color: "#8e8ea0" }}>
                  {exp.category} · {exp.date}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span
                  className="text-xs font-medium"
                  style={{ color: "#ececec" }}
                >
                  ₹{exp.amount.toLocaleString("en-IN")}
                </span>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="text-xs transition-colors"
                  style={{ color: "#3d3d3d" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color =
                      "#ef4444")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color =
                      "#3d3d3d")
                  }
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
