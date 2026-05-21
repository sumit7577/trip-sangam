"use client";

import { create } from "zustand";

export type ToastTone = "default" | "success" | "error";
export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, tone = "default") => {
    const id = ++counter;
    set({ toasts: [...get().toasts, { id, message, tone }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, 3200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

// Imperative helper so non-React code can fire toasts.
export const toast = (message: string, tone?: ToastTone) =>
  useToast.getState().push(message, tone);
