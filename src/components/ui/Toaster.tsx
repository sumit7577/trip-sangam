"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToast, type ToastTone } from "@/lib/toast";
import { cn } from "@/lib/utils";

const icon: Record<ToastTone, React.ReactNode> = {
  default: <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4 text-jade" />,
  error: <AlertCircle className="h-4 w-4 text-crimson" />,
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+92px)] z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line/70 bg-white px-4 py-3 text-sm shadow-lift",
            )}
          >
            <span className="shrink-0 text-ink">{icon[t.tone]}</span>
            <span className="min-w-0 flex-1 text-ink">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 rounded-full p-1 text-muted hover:bg-ink/5 hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
