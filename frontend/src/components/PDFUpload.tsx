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

  // ── IDLE / ERROR ──────────────────────────────
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
          className="flex flex-col items-center justify-center py-8 px-4 text-center cursor-pointer transition-all rounded-xl"
          style={{
            border: `2px dashed ${isDragging ? "#0a21c0" : "#3d3d3d"}`,
            backgroundColor: isDragging
              ? "rgba(10,33,192,0.06)"
              : "transparent",
          }}
        >
          <div
            className="w-12 h-12 flex items-center justify-center mb-3 rounded-xl"
            style={{ backgroundColor: "#2d2d2d", border: "1px solid #3d3d3d" }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0a21c0"
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
          <p className="text-sm font-medium mb-1" style={{ color: "#ececec" }}>
            Drop your bank statement here
          </p>
          <p className="text-xs mb-3" style={{ color: "#8e8ea0" }}>
            PDF format · max 10MB
          </p>
          <div
            className="text-xs px-4 py-2 font-medium text-white rounded-lg"
            style={{ backgroundColor: "#0a21c0" }}
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

  // ── UPLOADING ─────────────────────────────────
  if (state === "uploading")
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "#0a21c0", borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: "#8e8ea0" }}>
          Extracting transactions...
        </p>
      </div>
    );

  // ── DONE ──────────────────────────────────────
  if (state === "done")
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-2">
        <div
          className="w-10 h-10 flex items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(52,211,153,0.15)" }}
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
        <p className="text-sm font-medium" style={{ color: "#ececec" }}>
          {expenses.length} expenses saved!
        </p>
      </div>
    );

  // ── PREVIEW TABLE ─────────────────────────────
  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#212121" }}
    >
      <div
        className="px-4 py-3 shrink-0 flex items-center justify-between"
        style={{ borderBottom: "1px solid #3d3d3d" }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: "#ececec" }}>
            Review {expenses.length} transactions
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#8e8ea0" }}>
            {pageCount} page PDF · ₹{total.toLocaleString("en-IN")} total · Edit
            or remove before saving
          </p>
        </div>
        <button
          onClick={() => {
            setState("idle");
            setExpenses([]);
          }}
          className="text-xs px-2 py-1 transition-colors cursor-pointer"
          style={{ color: "#8e8ea0" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#ececec")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#8e8ea0")
          }
        >
          ✕ Cancel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ color: "#8e8ea0", borderBottom: "1px solid #3d3d3d" }}>
              <th className="text-left py-2 font-medium">Description</th>
              <th className="text-left py-2 font-medium">Category</th>
              <th className="text-right py-2 font-medium">Amount</th>
              <th className="text-right py-2 font-medium">Date</th>
              <th className="py-2 w-6" />
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, i) => (
              <tr
                key={i}
                style={{ borderBottom: "1px solid rgba(61,61,61,0.5)" }}
              >
                <td className="py-2 pr-2">
                  <input
                    value={exp.description}
                    onChange={(e) =>
                      updateExpense(i, "description", e.target.value)
                    }
                    className="w-full px-2 py-1 text-xs outline-none rounded-md"
                    style={{
                      backgroundColor: "#2d2d2d",
                      color: "#ececec",
                      border: "1px solid transparent",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#0a21c0")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "transparent")
                    }
                  />
                </td>
                <td className="py-2 pr-2">
                  <select
                    value={exp.category}
                    onChange={(e) =>
                      updateExpense(i, "category", e.target.value)
                    }
                    className="w-full px-2 py-1 text-xs outline-none cursor-pointer rounded-md"
                    style={{
                      backgroundColor: "#2d2d2d",
                      color: "#ececec",
                      border: "1px solid transparent",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#0a21c0")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "transparent")
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
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
                    className="w-full px-2 py-1 text-xs outline-none text-right rounded-md"
                    style={{
                      backgroundColor: "#2d2d2d",
                      color: "#ececec",
                      border: "1px solid transparent",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#0a21c0")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "transparent")
                    }
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="date"
                    value={exp.date}
                    onChange={(e) => updateExpense(i, "date", e.target.value)}
                    className="w-full px-2 py-1 text-xs outline-none rounded-md"
                    style={{
                      backgroundColor: "#2d2d2d",
                      color: "#ececec",
                      border: "1px solid transparent",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#0a21c0")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "transparent")
                    }
                  />
                </td>
                <td className="py-2 text-center">
                  <button
                    onClick={() => removeExpense(i)}
                    className="transition-colors cursor-pointer"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="px-4 py-3 shrink-0 flex items-center justify-between"
        style={{ borderTop: "1px solid #3d3d3d" }}
      >
        <div>
          <p className="text-xs" style={{ color: "#8e8ea0" }}>
            {expenses.length} transactions
          </p>
          <p
            className="text-sm font-semibold mt-0.5"
            style={{ color: "#ececec" }}
          >
            ₹{total.toLocaleString("en-IN")} total
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={state === "saving" || expenses.length === 0}
          className="px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-80"
          style={{ backgroundColor: "#0a21c0" }}
        >
          {state === "saving"
            ? "Saving..."
            : `Save ${expenses.length} expenses`}
        </button>
      </div>
    </div>
  );
}
