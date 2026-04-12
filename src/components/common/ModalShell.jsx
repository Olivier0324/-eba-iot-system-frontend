import React, { useEffect } from "react";
import { modalPanelClass } from "./modalStyles";

/**
 * Shared modal overlay + panel shell for dashboard dialogs.
 * Backdrop click and Escape close when onClose is provided.
 * Children are wrapped in a consistent card (remove duplicate outer panels).
 */
function ModalShell({
  open,
  onClose,
  children,
  maxWidthClass = "max-w-md",
  className = "",
  /** Set false only if you render your own full-width panel inside. */
  wrapPanel = true,
}) {
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`w-full ${maxWidthClass} my-8 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {wrapPanel ? (
          <div className={modalPanelClass}>{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default ModalShell;
