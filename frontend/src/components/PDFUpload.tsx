import { useState, useRef } from "react";
import { uploadPDF, saveBulkExpenses, type ExtractedExpense } from "../api";

const CATEGORIES = [
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

interface Props {
  onSaved: () => void;
}

type UploadState =
  | "idle"
  | "uploading"
  | "preview"
  | "saving"
  | "done"
  | "error";

export default function PDFUpload({ onSaved }: Props) {
  const [state, setState] = useState<UploadState>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [expenses, setExpenses] = useState<ExtractedExpense[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      setErrorMsg("Please upload a PDF file.");
      setState("error");
      return;
    }

    setState("uploading");
    setErrorMsg("");

    try {
      const result = await uploadPDF(file);

      if (result.expenses.length === 0) {
        setErrorMsg(result.message);
        setState("error");
        return;
      }

      setExpenses(result.expenses);
      setPageCount(result.pageCount);
      setState("preview");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error ?? "Failed to process PDF.");
      setState("error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const updateExpense = (
    index: number,
    field: keyof ExtractedExpense,
    value: string | number
  ) => {
    setExpenses((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp))
    );
  };

  const removeExpense = (index: number) => {
    setExpenses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    setState("saving");
    try {
      await saveBulkExpenses(expenses);
      setState("done");
      onSaved();
      // Reset after 2 seconds
      setTimeout(() => {
        setState("idle");
        setExpenses([]);
      }, 2000);
    } catch {
      setErrorMsg("Failed to save expenses.");
      setState("error");
    }
  };

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // ── IDLE / DRAG DROP ──────────────────────────
  if (state === "idle" || state === "error")
    return (
      <div className="p-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${
              isDragging ? "var(--accent)" : "rgba(179,180,189,0.25)"
            }`,
            backgroundColor: isDragging
              ? "rgba(10,33,192,0.08)"
              : "transparent",
            borderRadius: "12px",
            transition: "all 0.2s",
            cursor: "pointer",
          }}
          className="flex flex-col items-center justify-center py-8 px-4 text-center"
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid rgba(179,180,189,0.15)",
              borderRadius: "12px",
            }}
            className="w-12 h-12 flex items-center justify-center mb-3"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>

          <p
            style={{ color: "var(--white)" }}
            className="text-sm font-medium mb-1"
          >
            Drop your bank statement here
          </p>
          <p style={{ color: "var(--muted)" }} className="text-xs mb-3">
            PDF format · max 10MB
          </p>
          <div
            style={{
              backgroundColor: "var(--accent)",
              borderRadius: "8px",
              color: "white",
            }}
            className="text-xs px-4 py-2 font-medium"
          >
            Browse file
          </div>

          {state === "error" && (
            <p className="text-red-400 text-xs mt-3">{errorMsg}</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    );

  // ── UPLOADING ──────────────────────────────────
  if (state === "uploading")
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3">
        <div
          style={{
            borderColor: "var(--accent)",
            borderTopColor: "transparent",
          }}
          className="w-8 h-8 rounded-full border-2 animate-spin"
        />
        <p style={{ color: "var(--muted)" }} className="text-sm">
          Extracting transactions...
        </p>
      </div>
    );

  // ── DONE ──────────────────────────────────────
  if (state === "done")
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-2">
        <div
          style={{
            backgroundColor: "rgba(52,211,153,0.15)",
            borderRadius: "50%",
          }}
          className="w-10 h-10 flex items-center justify-center"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p style={{ color: "var(--white)" }} className="text-sm font-medium">
          {expenses.length} expenses saved!
        </p>
      </div>
    );

  // ── PREVIEW TABLE ─────────────────────────────
  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* Preview header */}
      <div
        className="px-4 py-3 shrink-0 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(179,180,189,0.15)" }}
      >
        <div>
          <p style={{ color: "var(--white)" }} className="text-sm font-medium">
            Review {expenses.length} transactions
          </p>
          <p style={{ color: "var(--muted)" }} className="text-xs mt-0.5">
            {pageCount} page PDF · ₹{total.toLocaleString("en-IN")} total · Edit
            or remove before saving
          </p>
        </div>
        <button
          onClick={() => {
            setState("idle");
            setExpenses([]);
          }}
          style={{ color: "var(--muted)" }}
          className="text-xs hover:text-white transition-colors cursor-pointer px-2 py-1"
        >
          ✕ Cancel
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <table className="w-full text-xs">
          <thead>
            <tr
              style={{
                color: "var(--muted)",
                borderBottom: "1px solid rgba(179,180,189,0.1)",
              }}
            >
              <th className="text-left py-2 font-medium">Description</th>
              <th className="text-left py-2 font-medium">Category</th>
              <th className="text-right py-2 font-medium">Amount</th>
              <th className="text-right py-2 font-medium">Date</th>
              <th className="py-2 w-6"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, i) => (
              <tr
                key={i}
                style={{ borderBottom: "1px solid rgba(179,180,189,0.06)" }}
              >
                {/* Description */}
                <td className="py-2 pr-2">
                  <input
                    value={exp.description}
                    onChange={(e) =>
                      updateExpense(i, "description", e.target.value)
                    }
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--white)",
                      border: "1px solid transparent",
                      borderRadius: "6px",
                    }}
                    className="w-full px-2 py-1 text-xs outline-none focus:border-blue-600"
                  />
                </td>

                {/* Category */}
                <td className="py-2 pr-2">
                  <select
                    value={exp.category}
                    onChange={(e) =>
                      updateExpense(i, "category", e.target.value)
                    }
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--white)",
                      border: "1px solid transparent",
                      borderRadius: "6px",
                    }}
                    className="w-full px-2 py-1 text-xs outline-none cursor-pointer focus:border-blue-600"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Amount */}
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    value={exp.amount}
                    onChange={(e) =>
                      updateExpense(
                        i,
                        "amount",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--white)",
                      border: "1px solid transparent",
                      borderRadius: "6px",
                    }}
                    className="w-full px-2 py-1 text-xs outline-none text-right focus:border-blue-600"
                  />
                </td>

                {/* Date */}
                <td className="py-2 pr-2">
                  <input
                    type="date"
                    value={exp.date}
                    onChange={(e) => updateExpense(i, "date", e.target.value)}
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--white)",
                      border: "1px solid transparent",
                      borderRadius: "6px",
                    }}
                    className="w-full px-2 py-1 text-xs outline-none focus:border-blue-600"
                  />
                </td>

                {/* Delete */}
                <td className="py-2 text-center">
                  <button
                    onClick={() => removeExpense(i)}
                    style={{ color: "var(--muted)" }}
                    className="hover:text-red-400 transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 shrink-0 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(179,180,189,0.15)" }}
      >
        <div>
          <p style={{ color: "var(--muted)" }} className="text-xs">
            {expenses.length} transactions
          </p>
          <p
            style={{ color: "var(--white)" }}
            className="text-sm font-semibold mt-0.5"
          >
            ₹{total.toLocaleString("en-IN")} total
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={state === "saving" || expenses.length === 0}
          style={{
            backgroundColor: "var(--accent)",
            color: "white",
            borderRadius: "10px",
            opacity: state === "saving" ? 0.6 : 1,
          }}
          className="px-5 py-2.5 text-sm font-medium transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          {state === "saving"
            ? "Saving..."
            : `Save ${expenses.length} expenses`}
        </button>
      </div>
    </div>
  );
}
