import { useEffect, useState } from "react";
import { getBudgets, setBudget, deleteBudget, type BudgetStatus } from "../api";

const CATEGORIES = [
  "Overall",
  "Housing",
  "Food",
  "Transport",
  "Entertainment",
  "Shopping",
  "Health",
  "Utilities",
  "Education",
  "Other",
];

const STATUS_COLORS = {
  safe: "#34d399",
  warning: "#fbbf24",
  over: "#f87171",
};

interface Props {
  refreshKey: number;
}

export default function BudgetPanel({ refreshKey }: Props) {
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("Overall");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const data = await getBudgets();
      setBudgets(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [refreshKey]);

  const handleSave = async () => {
    if (!limit || parseFloat(limit) <= 0) return;
    await setBudget(category, parseFloat(limit));
    setLimit("");
    setShowForm(false);
    fetchBudgets();
  };

  const handleDelete = async (cat: string) => {
    await deleteBudget(cat);
    fetchBudgets();
  };

  const overBudgetCount = budgets.filter((b) => b.status === "over").length;
  const warningCount = budgets.filter((b) => b.status === "warning").length;

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid rgba(179,180,189,0.1)",
        borderRadius: "12px",
      }}
      className="p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3
            style={{ color: "var(--white)" }}
            className="text-sm font-semibold"
          >
            Budgets
          </h3>
          {overBudgetCount > 0 && (
            <span
              style={{
                backgroundColor: "rgba(248,113,113,0.15)",
                color: "#f87171",
              }}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
            >
              {overBudgetCount} over
            </span>
          )}
          {warningCount > 0 && overBudgetCount === 0 && (
            <span
              style={{
                backgroundColor: "rgba(251,191,36,0.15)",
                color: "#fbbf24",
              }}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
            >
              {warningCount} near limit
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          style={{ color: "var(--accent)" }}
          className="text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
        >
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="flex gap-2 mb-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              backgroundColor: "var(--bg-base)",
              color: "var(--white)",
              border: "1px solid rgba(179,180,189,0.2)",
              borderRadius: "8px",
            }}
            className="text-xs px-2 py-2 outline-none cursor-pointer flex-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="₹ limit"
            style={{
              backgroundColor: "var(--bg-base)",
              color: "var(--white)",
              border: "1px solid rgba(179,180,189,0.2)",
              borderRadius: "8px",
            }}
            className="text-xs px-3 py-2 outline-none w-24"
          />
          <button
            onClick={handleSave}
            style={{
              backgroundColor: "var(--accent)",
              color: "white",
              borderRadius: "8px",
            }}
            className="text-xs px-3 py-2 font-medium cursor-pointer"
          >
            Save
          </button>
        </div>
      )}

      {/* Budget list */}
      {loading ? (
        <p style={{ color: "var(--muted)" }} className="text-xs">
          Loading...
        </p>
      ) : budgets.length === 0 ? (
        <p style={{ color: "var(--muted)" }} className="text-xs">
          No budgets set yet. Add one or tell the agent in chat — e.g. "Set my
          food budget to ₹8000"
        </p>
      ) : (
        <div className="space-y-3">
          {budgets.map((b) => (
            <div key={b.category}>
              <div className="flex justify-between items-center mb-1.5">
                <span
                  style={{ color: "var(--white)" }}
                  className="text-xs font-medium"
                >
                  {b.category}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    style={{ color: STATUS_COLORS[b.status] }}
                    className="text-xs font-medium"
                  >
                    ₹{b.spent.toLocaleString("en-IN")} / ₹
                    {b.limit.toLocaleString("en-IN")}
                  </span>
                  <button
                    onClick={() => handleDelete(b.category)}
                    style={{ color: "var(--muted)" }}
                    className="hover:text-red-400 transition-colors cursor-pointer text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "var(--bg-base)",
                  borderRadius: "99px",
                }}
                className="h-1.5 overflow-hidden"
              >
                <div
                  style={{
                    width: `${Math.min(b.percentUsed, 100)}%`,
                    backgroundColor: STATUS_COLORS[b.status],
                    borderRadius: "99px",
                    transition: "width 0.6s ease",
                  }}
                  className="h-full"
                />
              </div>
              {b.status === "over" && (
                <p style={{ color: "#f87171" }} className="text-xs mt-1">
                  Over by ₹{(b.spent - b.limit).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
