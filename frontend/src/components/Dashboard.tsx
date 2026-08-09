import { useEffect, useState, type CSSProperties } from "react";
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
  Cell,
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
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  refreshKey: number;
}

const ACCENT = "#8b5cf6";
// const ACCENT_SOFT = "#a78bfa";

const COLORS = [
  "#8b5cf6",
  "#a78bfa",
  "#7c3aed",
  "#6366f1",
  "#818cf8",
  "#6d5dfc",
];

const TEXT_PRIMARY = "#f4f4f5";
const TEXT_SECONDARY = "#a1a1aa";
const TEXT_MUTED = "#71717a";
const BORDER = "#303033";
const SURFACE = "#27272a";
const BACKGROUND = "#18181b";

function SkeletonBlock({
  className = "",
  style = {},
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{
        backgroundColor: "#303033",
        ...style,
      }}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="h-full overflow-y-auto px-5 py-5"
      style={{ backgroundColor: BACKGROUND }}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-6 w-28" />
            <SkeletonBlock className="h-3 w-36" />
          </div>

          <SkeletonBlock className="h-8 w-20 rounded-lg" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 border rounded-xl overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-4 border-b md:border-b-0 md:border-r last:border-0"
              style={{ borderColor: BORDER }}
            >
              <SkeletonBlock className="h-3 w-20 mb-3" />
              <SkeletonBlock className="h-6 w-24" />
            </div>
          ))}
        </div>

        {/* Budget */}
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-2 w-full rounded-full" />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <SkeletonBlock className="h-4 w-40 mb-5" />
            <SkeletonBlock className="h-52 w-full" />
          </div>

          <div>
            <SkeletonBlock className="h-4 w-40 mb-5" />
            <SkeletonBlock className="h-52 w-full" />
          </div>
        </div>

        {/* Categories */}
        <div>
          <SkeletonBlock className="h-4 w-40 mb-5" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="h-3 w-24" />
                </div>
                <SkeletonBlock className="h-1.5 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div>
          <SkeletonBlock className="h-4 w-36 mb-5" />

          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="space-y-2">
                  <SkeletonBlock className="h-3 w-36" />
                  <SkeletonBlock className="h-2.5 w-24" />
                </div>

                <SkeletonBlock className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Custom Tooltip                                */
/* -------------------------------------------------------------------------- */

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value;

  return (
    <div
      className="px-3 py-2 rounded-lg text-xs shadow-xl"
      style={{
        backgroundColor: "#202023",
        border: `1px solid ${BORDER}`,
        color: TEXT_PRIMARY,
      }}
    >
      ₹{Number(value ?? 0).toLocaleString("en-IN")}
    </div>
  );
}

/*                              Main Dashboard                                */

export default function Dashboard({ refreshKey }: Props) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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

      setTotal(
        cats.reduce(
          (sum: number, category: CategoryData) => sum + category.total,
          0
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  /*                                Actions                                   */

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this transaction?")) return;

    await deleteExpense(id);
    fetchData();
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = async () => {
    setShowClearConfirm(false);

    await clearAll();
    fetchData();
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  /*                              Empty State                                 */

  if (total === 0) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center text-center px-8"
        style={{ backgroundColor: BACKGROUND }}
      >
        <div className="w-full max-w-sm">
          <UploadStatement fetchData={fetchData} />

          <h3
            className="text-lg font-semibold mt-5"
            style={{ color: TEXT_PRIMARY }}
          >
            No expenses yet
          </h3>

          <p
            className="text-sm mt-2 leading-6"
            style={{ color: TEXT_SECONDARY }}
          >
            Paste your expenses in the chat and your dashboard will update
            automatically.
          </p>
        </div>
      </div>
    );
  }

  /*                               Data                                       */

  const categoriesWithColor = categories.map((category, index) => ({
    ...category,
    fill: COLORS[index % COLORS.length],
  }));

  const topCategory = categories[0];

  /*                                Render                                    */

  return (
    <div
      className="h-full overflow-y-auto px-5 py-5"
      style={{
        backgroundColor: BACKGROUND,
        color: TEXT_PRIMARY,
      }}
    >
      <div className="max-w-5xl mx-auto space-y-8 pb-8">
        <header className="flex items-center justify-between">
          <div>
            <h2
              className="text-xl font-semibold tracking-tight"
              style={{ color: TEXT_PRIMARY }}
            >
              Dashboard
            </h2>

            <p className="text-xs mt-1" style={{ color: TEXT_SECONDARY }}>
              Total spending · ₹{total.toLocaleString("en-IN")}
            </p>
          </div>

          <button
            onClick={handleClearAll}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              color: TEXT_SECONDARY,
              border: `1px solid ${BORDER}`,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.borderColor = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = TEXT_SECONDARY;
              e.currentTarget.style.borderColor = BORDER;
            }}
          >
            Clear all
          </button>
        </header>

        <UploadStatement fetchData={fetchData} />

        <section
          className="grid grid-cols-2 md:grid-cols-4 rounded-xl overflow-hidden"
          style={{
            border: `1px solid ${BORDER}`,
            backgroundColor: SURFACE,
          }}
        >
          {[
            {
              label: "Total spend",
              value: `₹${total.toLocaleString("en-IN")}`,
            },
            {
              label: "Transactions",
              value: expenses.length,
            },
            {
              label: "Categories",
              value: categories.length,
            },
            {
              label: "Top category",
              value: topCategory?.category ?? "—",
              sub: topCategory?.total
                ? `₹${topCategory.total.toLocaleString("en-IN")}`
                : undefined,
            },
          ].map(({ label, value, sub }, index) => (
            <div
              key={label}
              className="px-4 py-4"
              style={{
                borderRight: index !== 3 ? `1px solid ${BORDER}` : undefined,
                borderBottom: index < 2 ? `1px solid ${BORDER}` : undefined,
              }}
            >
              <p className="text-xs" style={{ color: TEXT_MUTED }}>
                {label}
              </p>

              <p
                className="text-lg font-semibold mt-1 truncate"
                style={{ color: TEXT_PRIMARY }}
              >
                {value}
              </p>

              {sub && (
                <p className="text-xs mt-0.5" style={{ color: TEXT_SECONDARY }}>
                  {sub}
                </p>
              )}
            </div>
          ))}
        </section>

        <section>
          <BudgetPanel refreshKey={refreshKey} />
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          {/* Spending by category */}
          <div>
            <div className="mb-4">
              <h3
                className="text-sm font-medium"
                style={{ color: TEXT_PRIMARY }}
              >
                Spending by category
              </h3>

              <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>
                Where your money is going
              </p>
            </div>

            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriesWithColor}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {categoriesWithColor.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>

                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly spending */}
          {monthly.length > 0 && (
            <div>
              <div className="mb-4">
                <h3
                  className="text-sm font-medium"
                  style={{ color: TEXT_PRIMARY }}
                >
                  Monthly spending
                </h3>

                <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>
                  Spending over time
                </p>
              </div>

              <div className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthly}
                    margin={{
                      top: 10,
                      right: 0,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: TEXT_MUTED,
                        fontSize: 10,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: TEXT_MUTED,
                        fontSize: 10,
                      }}
                      tickFormatter={(value) =>
                        `₹${(value / 1000).toFixed(0)}k`
                      }
                    />

                    <Tooltip
                      cursor={{
                        fill: "rgba(255,255,255,0.03)",
                      }}
                      content={<ChartTooltip />}
                    />

                    <Bar
                      dataKey="total"
                      fill={ACCENT}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="mb-5">
            <h3 className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>
              Category breakdown
            </h3>

            <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>
              Spending by category
            </p>
          </div>

          <div className="space-y-5">
            {categories.map((category, index) => {
              const percentage = total > 0 ? (category.total / total) * 100 : 0;

              return (
                <div key={category.category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />

                      <span
                        className="text-xs font-medium"
                        style={{ color: TEXT_PRIMARY }}
                      >
                        {category.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        ₹{category.total.toLocaleString("en-IN")}
                      </span>

                      <span
                        className="text-[10px]"
                        style={{ color: TEXT_MUTED }}
                      >
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{
                      backgroundColor: "#303033",
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h3
                className="text-sm font-medium"
                style={{ color: TEXT_PRIMARY }}
              >
                Transactions
              </h3>

              <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>
                Your latest expenses
              </p>
            </div>

            <span className="text-xs" style={{ color: TEXT_MUTED }}>
              {expenses.length} total
            </span>
          </div>

          <div>
            {expenses.slice(0, 20).map((expense, index) => (
              <div
                key={expense.id}
                className="flex items-center justify-between py-3 group"
                style={{
                  borderBottom:
                    index !== Math.min(expenses.length, 20) - 1
                      ? `1px solid ${BORDER}`
                      : undefined,
                }}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: TEXT_PRIMARY }}
                  >
                    {expense.description}
                  </p>

                  <p className="text-[11px] mt-1" style={{ color: TEXT_MUTED }}>
                    {expense.category} · {expense.date}
                  </p>
                </div>

                <div className="flex items-center gap-4 ml-4">
                  <span
                    className="text-xs font-medium whitespace-nowrap"
                    style={{ color: TEXT_PRIMARY }}
                  >
                    ₹{expense.amount.toLocaleString("en-IN")}
                  </span>

                  <button
                    onClick={() => handleDelete(expense.id)}
                    aria-label={`Delete ${expense.description}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    style={{ color: "#71717a" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#71717a";
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {showClearConfirm && (
          <ConfirmDialog
            title="Clear all data?"
            message="This will permanently delete all expenses and conversation history. This cannot be undone."
            confirmLabel="Clear all"
            onConfirm={confirmClearAll}
            onCancel={() => setShowClearConfirm(false)}
          />
        )}
      </div>
    </div>
  );
}
