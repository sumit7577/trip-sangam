"use client";

import { create } from "zustand";
import type { Package, PackageDetail } from "@/types";

type BookingContext = {
  pkg: Package | PackageDetail;
  initialDate?: string;
  initialTravelers?: number;
};

interface ModalState {
  booking: BookingContext | null;
  signin: boolean;
  openBooking: (ctx: BookingContext) => void;
  closeBooking: () => void;
  openSignin: () => void;
  closeSignin: () => void;
}

export const useModal = create<ModalState>((set) => ({
  booking: null,
  signin: false,
  openBooking: (ctx) => set({ booking: ctx }),
  closeBooking: () => set({ booking: null }),
  openSignin: () => set({ signin: true }),
  closeSignin: () => set({ signin: false }),
}));
