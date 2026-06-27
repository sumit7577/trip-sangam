"use client";

import { motion } from "framer-motion";
import { Instagram, Facebook, MessageCircle, Phone, ShieldCheck, Lock } from "lucide-react";
import { BUSINESS } from "@/lib/seo";
import { cn } from "@/lib/utils";

const socials = [
  { Icon: Instagram, href: BUSINESS.instagram, label: "Instagram" },
  { Icon: Facebook, href: BUSINESS.facebook, label: "Facebook" },
  { Icon: MessageCircle, href: `https://wa.me/${BUSINESS.whatsapp}`, label: "WhatsApp" },
  { Icon: Phone, href: `tel:${BUSINESS.phone}`, label: "Call" },
];

/** Animated footer band: follow-us socials + accepted payments + secure-payment trust. */
export function FooterBadges() {
  return (
    <div className="border-t border-ink/8 dark:border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-7 px-5 py-8 md:flex-row md:px-8">
        {/* Follow us */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Follow us</span>
          <div className="flex items-center gap-2">
            {socials.map(({ Icon, href, label }, i) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                whileHover={{ y: -3, scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                animate={{ y: [0, -2.5, 0] }}
                transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 } }}
                className="grid h-10 w-10 place-items-center rounded-xl border border-ink/10 text-ink/60 transition-colors hover:border-crimson hover:text-crimson dark:border-white/10 dark:text-white/70"
              >
                <Icon className="h-4 w-4" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Payments + trust */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
          <div className="flex items-center gap-2.5">
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-muted sm:inline">
              Secure payments
            </span>
            <div className="flex items-center gap-1.5">
              {[VisaMark, MastercardMark, RupayMark, UpiMark].map((Mark, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.45 }}
                  whileHover={{ y: -2 }}
                >
                  <Mark />
                </motion.span>
              ))}
            </div>
          </div>

          <span className="hidden h-6 w-px bg-ink/10 dark:bg-white/10 sm:block" />

          <motion.div
            animate={{ boxShadow: ["0 0 0 0 rgba(45,154,107,0.0)", "0 0 0 4px rgba(45,154,107,0.08)", "0 0 0 0 rgba(45,154,107,0.0)"] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center gap-1.5 rounded-full border border-jade/30 bg-jade/8 px-3 py-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-jade" />
            <span className="text-[11px] font-medium text-ink/75 dark:text-white/80">Secured by PhonePe</span>
            <Lock className="h-3 w-3 text-jade" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ---- Lightweight payment marks (no external/trademarked image files) ---- */

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-[42px] items-center justify-center rounded-md border border-ink/10 bg-white px-2 text-[11px] font-bold leading-none shadow-sm dark:border-white/10",
        className
      )}
    >
      {children}
    </span>
  );
}

function VisaMark() {
  return <Chip className="italic tracking-tight text-[#1A1F71]">VISA</Chip>;
}

function MastercardMark() {
  return (
    <Chip>
      <span className="relative inline-flex h-3.5 w-6 items-center" aria-label="Mastercard">
        <span className="absolute left-0 h-3.5 w-3.5 rounded-full bg-[#EB001B]" />
        <span className="absolute left-2.5 h-3.5 w-3.5 rounded-full bg-[#F79E1B] mix-blend-multiply" />
      </span>
    </Chip>
  );
}

function RupayMark() {
  return (
    <Chip className="tracking-tight">
      <span className="text-[#097DC6]">Ru</span>
      <span className="text-[#F58220]">Pay</span>
    </Chip>
  );
}

function UpiMark() {
  return (
    <Chip className="tracking-tight">
      <span className="text-[#0B7D3E]">U</span>
      <span className="text-[#E97A28]">P</span>
      <span className="text-[#0B7D3E]">I</span>
    </Chip>
  );
}
