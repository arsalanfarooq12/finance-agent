import { useState } from "react";
import PDFUpload from "./PDFUpload";
interface UploadStatementProps {
  fetchData: () => Promise<void>;
}
export default function UploadStatement({ fetchData }: UploadStatementProps) {
  const [showUpload, setShowUpload] = useState(false);
  return (
    <>
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid rgba(179,180,189,0.1)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <button
          onClick={() => setShowUpload((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
          style={{ color: "var(--white)" }}
        >
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <span className="text-sm font-medium">
              Upload bank statement (PDF)
            </span>
          </div>
          <span style={{ color: "var(--muted)" }} className="text-xs">
            {showUpload ? "▲ collapse" : "▼ expand"}
          </span>
        </button>

        {showUpload && (
          <PDFUpload
            onSaved={() => {
              setShowUpload(false);

              fetchData();
            }}
          />
        )}
      </div>
    </>
  );
}
