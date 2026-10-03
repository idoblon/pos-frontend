import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * POS-styled confirmation dialog (replaces window.confirm).
 *
 * Props:
 * - open: boolean
 * - title: string
 * - message: string
 * - confirmText: string (default "Confirm")
 * - cancelText: string (default "Cancel")
 * - danger: boolean — red confirm button when true, dark otherwise
 * - onConfirm / onCancel: callbacks
 */
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'DM Sans','Inter',sans-serif",
      }}
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 12,
          width: "100%",
          maxWidth: 400,
          padding: 24,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: danger ? "#fef2f2" : "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <AlertTriangle size={18} color={danger ? "#dc2626" : "#1a1d23"} />
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1d23" }}>
            {title}
          </h3>
        </div>
        {message && (
          <p style={{ margin: "0 0 20px 48px", fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
            {message}
          </p>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: message ? 0 : 20 }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 16px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "white",
              color: "#1a1d23",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: 8,
              background: danger ? "#dc2626" : "#1a1d23",
              color: "white",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
