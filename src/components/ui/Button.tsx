"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface Props extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: "bg-sunset text-white shadow-soft hover:shadow-glow",
  secondary: "bg-ink text-white hover:bg-ink/85",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  outline: "border border-ink/15 bg-white text-ink hover:border-ink/40",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-xl",
  md: "h-11 px-6 text-[15px] rounded-xl",
  lg: "h-14 px-8 text-base rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", children, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-shadow",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
});
