import { useEffect, useState } from "react";
import { getBudgets, setBudget, deleteBudget, type BudgetStatus } from "../api";
import ConfirmDialog from "./ConfirmDialog";
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

function BudgetRowSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <div
          className="h-3 w-20 rounded animate-pulse"
          style={{ backgroundColor: "#3d3d3d" }}
        />
        <div
          className="h-3 w-28 rounded animate-pulse"
          style={{ backgroundColor: "#3d3d3d" }}
        />
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: "#3d3d3d" }}
      >
        <div
          className="h-full rounded-full animate-pulse"
          style={{ width: "55%", backgroundColor: "#4d4d4d" }}
        />
      </div>
    </div>
  );
}

export default function BudgetPanel({ refreshKey }: Props) {
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("Overall");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
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

  const handleDelete = (cat: string) => {
    setConfirmDelete(cat);
  };

  const confirmDeleteBudget = async () => {
    if (!confirmDelete) return;
    await deleteBudget(confirmDelete);
    setConfirmDelete(null);
    fetchBudgets();
  };

  const overBudgetCount = budgets.filter((b) => b.status === "over").length;
  const warningCount = budgets.filter((b) => b.status === "warning").length;

  return (
    <div
      className="p-4 rounded-xl"
      style={{ backgroundColor: "#2d2d2d", border: "1px solid #3d3d3d" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: "#ececec" }}>
            Budgets
          </h3>
          {overBudgetCount > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: "rgba(248,113,113,0.15)",
                color: "#f87171",
              }}
            >
              {overBudgetCount} over
            </span>
          )}
          {warningCount > 0 && overBudgetCount === 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: "rgba(251,191,36,0.15)",
                color: "#fbbf24",
              }}
            >
              {warningCount} near limit
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="text-xs font-medium cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: "#0a21c0" }}
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
            className="text-xs px-2 py-2 outline-none cursor-pointer flex-1 rounded-lg"
            style={{
              backgroundColor: "#212121",
              color: "#ececec",
              border: "1px solid #3d3d3d",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#0a21c0")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#3d3d3d")}
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
            className="text-xs px-3 py-2 outline-none w-24 rounded-lg"
            style={{
              backgroundColor: "#212121",
              color: "#ececec",
              border: "1px solid #3d3d3d",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#0a21c0")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#3d3d3d")}
          />
          <button
            onClick={handleSave}
            className="text-xs px-3 py-2 font-medium cursor-pointer text-white rounded-lg transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#0a21c0" }}
          >
            Save
          </button>
        </div>
      )}

      {/* Budget list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <BudgetRowSkeleton key={i} />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <p className="text-xs" style={{ color: "#8e8ea0" }}>
          No budgets set yet. Add one or tell the agent in chat — e.g. "Set my
          food budget to ₹8000"
        </p>
      ) : (
        <div className="space-y-3">
          {budgets.map((b) => (
            <div key={b.category}>
              <div className="flex justify-between items-center mb-1.5">
                <span
                  className="text-xs font-medium"
                  style={{ color: "#ececec" }}
                >
                  {b.category}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium"
                    style={{ color: STATUS_COLORS[b.status] }}
                  >
                    ₹{b.spent.toLocaleString("en-IN")} / ₹
                    {b.limit.toLocaleString("en-IN")}
                  </span>
                  <button
                    onClick={() => handleDelete(b.category)}
                    className="text-xs transition-colors cursor-pointer"
                    style={{ color: "#3d3d3d" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.color =
                        "#f87171")
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
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: "#3d3d3d" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(b.percentUsed, 100)}%`,
                    backgroundColor: STATUS_COLORS[b.status],
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              {b.status === "over" && (
                <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                  Over by ₹{(b.spent - b.limit).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {confirmDelete && (
        <ConfirmDialog
          title={`Delete ${confirmDelete} budget?`}
          message={`The budget limit for "${confirmDelete}" will be removed. Your expenses won't be affected.`}
          confirmLabel="Delete budget"
          onConfirm={confirmDeleteBudget}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
