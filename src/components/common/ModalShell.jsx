import React, { useEffect } from "react";

/**
 * Shared modal overlay + panel shell for dashboard dialogs.
 * Backdrop click and Escape close when onClose is provided.
 */
function ModalShell({
  open,
  onClose,
  children,
  maxWidthClass = "max-w-md",
  className = "",
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
        className={`w-full ${maxWidthClass} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default ModalShell;
