"use client";

import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import { BookingModal } from "@/components/modals/BookingModal";
import { SignInModal } from "@/components/modals/SignInModal";
import { Toaster } from "@/components/ui/Toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 220, damping: 28 }}>
        {children}
        <BookingModal />
        <SignInModal />
        <Toaster />
      </MotionConfig>
    </LazyMotion>
  );
}
