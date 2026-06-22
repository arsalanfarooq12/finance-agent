interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: Props) {
  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onCancel}
    >
      {/* Dialog box — stop click propagating to backdrop */}
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-xl"
        style={{
          backgroundColor: "#2d2d2d",
          border: "1px solid #3d3d3d",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold mb-1" style={{ color: "#ececec" }}>
          {title}
        </h3>
        <p
          className="text-xs leading-relaxed mb-5"
          style={{ color: "#8e8ea0" }}
        >
          {message}
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
            style={{
              backgroundColor: "#3d3d3d",
              color: "#ececec",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#4d4d4d")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#3d3d3d")
            }
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer text-white"
            style={{ backgroundColor: "#dc2626" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#b91c1c")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#dc2626")
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
