import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Phone, MapPin, ShieldCheck } from "lucide-react";
import { BUSINESS } from "@/lib/seo";
import { FooterBadges } from "@/components/layout/FooterBadges";

const cols = [
  {
    title: "Tours from Raxaul",
    links: [
      { label: "Nepal tour packages", href: "/nepal-tour-packages/" },
      { label: "Nepal tour from Raxaul", href: "/nepal-tour-package-from-raxaul/" },
      { label: "Raxaul to Kathmandu", href: "/raxaul-to-kathmandu-travel/" },
      { label: "Pokhara from Raxaul", href: "/pokhara-tour-package-from-raxaul/" },
      { label: "Muktinath from Raxaul", href: "/muktinath-tour-package-from-raxaul/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about/" },
      { label: "Contact", href: "/contact/" },
      { label: "Browse all trips", href: "/packages/" },
      { label: "Blog", href: "/blog/" },
    ],
  },
  {
    title: "Travel guides",
    links: [
      { label: "Nepal guide for Indians", href: "/guides/nepal-travel-guide-for-indians/" },
      { label: "Raxaul–Birgunj border", href: "/guides/raxaul-birgunj-border-guide/" },
      { label: "Best time to visit", href: "/guides/best-time-to-visit-nepal/" },
      { label: "All guides", href: "/guides/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/8 bg-white dark:border-white/10 dark:bg-[#0E0E0D]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-14 md:grid-cols-12 md:gap-12 md:px-8 md:py-16">
        <div className="min-w-0 md:col-span-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#fff] shadow-soft ring-1 ring-ink/5">
              <Image
                src="/tripsangam-logo.jpg"
                alt="TripSangam Travels logo"
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-serif text-xl font-semibold text-ink notranslate dark:text-white" translate="no">
                Trip<span className="bg-gradient-to-r from-gold via-crimson to-gold bg-clip-text text-transparent">Sangam</span> Travels
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted">Nepal tours from Raxaul</span>
            </span>
          </Link>
          <p className="pretty mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Nepal tour packages that start from Raxaul — Kathmandu, Pokhara, Muktinath and Chitwan, with
            Raxaul–Birgunj border assistance for families, groups and pilgrims.
          </p>
        </div>

        {cols.map((col) => (
          <div key={col.title} className="min-w-0 md:col-span-2">
            <h4 className="text-xs font-medium uppercase tracking-[0.18em] text-ink dark:text-white">{col.title}</h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-muted transition-colors hover:text-ink dark:hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="min-w-0 md:col-span-2">
          <h4 className="text-xs font-medium uppercase tracking-[0.18em] text-ink dark:text-white">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Raxaul, East Champaran, Bihar – 845305, India</li>
            <li><a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-2 hover:text-ink dark:hover:text-white"><Phone className="h-4 w-4" /> {BUSINESS.phoneDisplay}</a></li>
            <li><a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-ink dark:hover:text-white"><MessageCircle className="h-4 w-4" /> WhatsApp us</a></li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-jade" /> Border pickup &amp; assistance</li>
          </ul>
        </div>
      </div>

      <FooterBadges />

      <div className="border-t border-ink/8 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-5 py-6 text-xs text-muted md:flex-row md:items-center md:px-8">
          <p>© {new Date().getFullYear()} TripSangam Travels · Raxaul, Bihar, India</p>
          <div className="flex items-center gap-4">
            <Link href="/contact/" className="hover:text-ink dark:hover:text-white">Contact</Link>
            <Link href="/about/" className="hover:text-ink dark:hover:text-white">About</Link>
            <span className="font-mono">UPI · Cards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
