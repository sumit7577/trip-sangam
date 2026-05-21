"use client";

import Link from "next/link";
import { Mountain, Instagram, Facebook, Youtube, Twitter, ShieldCheck, Award } from "lucide-react";
import { toast } from "@/lib/toast";

const cols = [
  {
    title: "Journeys",
    links: ["Trekking", "Cultural", "Adventure", "Spiritual", "Wildlife", "Family"],
  },
  {
    title: "Company",
    links: ["About us", "Our guides", "Sustainability", "Careers", "Press", "Contact"],
  },
  {
    title: "Resources",
    links: ["Travel guide", "Visa info", "Packing list", "Travel insurance", "FAQs", "Blog"],
  },
];

const socials: { Icon: typeof Instagram; href: string; label: string }[] = [
  { Icon: Instagram, href: "https://instagram.com/sangamtrails", label: "Instagram" },
  { Icon: Facebook, href: "https://facebook.com/sangamtrails", label: "Facebook" },
  { Icon: Youtube, href: "https://youtube.com/@sangamtrails", label: "YouTube" },
  { Icon: Twitter, href: "https://twitter.com/sangamtrails", label: "Twitter / X" },
];

function scrollOrToast(target: string, label: string) {
  // Journey categories: scroll to packages on homepage
  if (target === "Journeys") {
    const el = document.getElementById("packages");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      toast(`Filter to "${label}" using the pills above`, "default");
    } else {
      window.location.href = "/#packages";
    }
    return;
  }
  toast(`"${label}" — prototype, link not wired`, "default");
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/8 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-14 md:grid-cols-12 md:gap-12 md:px-8 md:py-16">
        <div className="min-w-0 md:col-span-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink">
              <Mountain className="h-5 w-5 text-white" />
            </span>
            <span className="font-serif text-xl">Sangam Trails</span>
          </Link>
          <p className="pretty mt-4 max-w-sm text-sm leading-relaxed text-muted">
            A small team of Nepali guides and itinerary designers building considered journeys across the
            Himalayan belt since 2018.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-xl border border-ink/10 text-ink/60 transition-all hover:border-crimson hover:text-crimson"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {cols.map((col) => (
          <div key={col.title} className="min-w-0 md:col-span-2">
            <h4 className="text-xs font-medium uppercase tracking-[0.18em] text-ink">{col.title}</h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l}>
                  <button
                    onClick={() => scrollOrToast(col.title, l)}
                    className="text-left text-sm text-muted transition-colors hover:text-ink"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="min-w-0 md:col-span-2">
          <h4 className="text-xs font-medium uppercase tracking-[0.18em] text-ink">Trust</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-jade" /> Secure payments</li>
            <li className="flex items-center gap-2"><Award className="h-4 w-4 text-gold" /> TripAdvisor 4.9★</li>
            <li className="text-xs">Govt. Reg. #98214 · ATTA Member</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-5 py-6 text-xs text-muted md:flex-row md:items-center md:px-8">
          <p>© {new Date().getFullYear()} Sangam Trails Pvt. Ltd. · Kathmandu, Nepal</p>
          <div className="flex items-center gap-4">
            <button onClick={() => toast("Privacy policy — prototype", "default")} className="hover:text-ink">Privacy</button>
            <button onClick={() => toast("Terms of service — prototype", "default")} className="hover:text-ink">Terms</button>
            <button onClick={() => toast("Cookie preferences — prototype", "default")} className="hover:text-ink">Cookies</button>
            <span className="font-mono">VISA · MC · AMEX · UPI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
