"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Keep it",
  busy = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, busy, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/55 px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-4 backdrop-blur-sm sm:items-center"
          onClick={() => !busy && onClose()}
        >
          <motion.div
            initial={{ y: 32, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 text-center shadow-lift dark:bg-[#1A1A18]"
          >
            <div className="pointer-events-none absolute -top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-red-500/10 blur-2xl" />

            <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <AlertTriangle className="h-7 w-7" strokeWidth={1.8} />
            </span>

            <h2 className="relative mt-4 font-serif text-2xl tracking-tight text-ink dark:text-white">{title}</h2>
            <p className="relative mt-2 text-sm leading-relaxed text-muted">{message}</p>

            <div className="relative mt-6 flex flex-col-reverse gap-2.5 sm:flex-row">
              <button
                onClick={onClose}
                disabled={busy}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-line bg-white text-sm font-semibold text-ink transition-colors hover:bg-sand disabled:opacity-50 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={busy}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {busy ? "Working…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
