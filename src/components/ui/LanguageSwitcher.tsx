"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Wraps Google's old website-translator widget. The widget reads a cookie
 * called "googtrans" with the value "/en/<target>" and translates on load.
 * We hide the widget's own UI (see globals.css) and drive it from this dropdown.
 */

type Lang = { code: string; label: string; native: string };

const LANGS: Lang[] = [
  { code: "en", label: "English", native: "English" },
  { code: "ne", label: "Nepali",  native: "नेपाली" },
  { code: "hi", label: "Hindi",   native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil",   native: "தமிழ்" },
  { code: "te", label: "Telugu",  native: "తెలుగు" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "or", label: "Odia",    native: "ଓଡ଼ିଆ" },
];

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  // Set on path + apex domain so the widget picks it up regardless of subdomain
  document.cookie = `${name}=${value}; path=/; max-age=31536000`;
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length > 1) {
    const apex = parts.slice(-2).join(".");
    document.cookie = `${name}=${value}; path=/; domain=.${apex}; max-age=31536000`;
  }
}

function getCurrentLang(): string {
  const cookie = readCookie("googtrans");
  if (!cookie) return "en";
  // Cookie format: "/en/<target>"
  const parts = cookie.split("/");
  return parts[2] || "en";
}

function setLang(code: string) {
  if (code === "en") {
    // Clear the cookie so the widget shows source language
    writeCookie("googtrans", "");
    document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
  } else {
    writeCookie("googtrans", `/en/${code}`);
  }
  try {
    localStorage.setItem("lang", code);
  } catch {
    /* ignore */
  }
  window.location.reload();
}

export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("en");

  useEffect(() => {
    setCurrent(getCurrentLang());
  }, []);

  // First-visit auto-detect: if no localStorage 'lang' yet, infer from browser
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lang");
      if (stored !== null) return; // already chose
      const browser = (navigator.language || "en").split("-")[0].toLowerCase();
      const supported = LANGS.find((l) => l.code === browser);
      if (supported && supported.code !== "en" && supported.code !== current) {
        // Mark as inferred so we don't re-prompt, but DO translate
        localStorage.setItem("lang", supported.code);
        setLang(supported.code);
      } else {
        localStorage.setItem("lang", "en");
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = () => setOpen(false);
    window.addEventListener("click", onDoc);
    return () => window.removeEventListener("click", onDoc);
  }, [open]);

  const active = LANGS.find((l) => l.code === current) ?? LANGS[0];

  return (
    <div className="relative notranslate" translate="no">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        aria-label="Change language"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors",
          dark ? "text-white/85 hover:bg-white/10" : "text-ink/80 hover:bg-ink/5"
        )}
      >
        <Languages className="h-3.5 w-3.5" />
        <span className="hidden uppercase tracking-wide sm:inline">{active.code}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 max-h-[60vh] w-52 overflow-y-auto rounded-2xl border border-ink/8 bg-white p-1 shadow-lift"
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-sand",
                  l.code === current && "bg-sand"
                )}
              >
                <span className="flex flex-col leading-tight">
                  <span className="text-ink">{l.native}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted">{l.label}</span>
                </span>
                {l.code === current && <Check className="h-3.5 w-3.5 text-ink" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
