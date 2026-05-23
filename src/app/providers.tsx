"use client";

import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import { BookingModal } from "@/components/modals/BookingModal";
import { SignInModal } from "@/components/modals/SignInModal";
import { Toaster } from "@/components/ui/Toaster";
import { ThemeProvider } from "@/lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LazyMotion features={domAnimation}>
        <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 220, damping: 28 }}>
          {children}
          <BookingModal />
          <SignInModal />
          <Toaster />
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  );
}
