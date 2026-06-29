import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatBubble } from "@/components/layout/ChatBubble";
import { BottomNav } from "@/components/layout/BottomNav";
import { SITE_URL, BUSINESS } from "@/lib/seo";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nepal Tour Packages from Raxaul | TripSangam Travels",
    template: "%s | TripSangam Travels",
  },
  description:
    "Book Nepal tour packages from Raxaul with TripSangam Travels. Explore Kathmandu, Pokhara, Muktinath, Chitwan and more, with pickup assistance from the Raxaul–Birgunj border.",
  keywords: [
    "Nepal tour package from Raxaul",
    "Raxaul to Kathmandu travel",
    "Raxaul Nepal travel agency",
    "Pokhara tour package from Raxaul",
    "Muktinath tour package",
    "Nepal pilgrimage tour from India",
  ],
  // Favicon + apple-touch-icon come from the SQUARE app/icon.png &
  // app/apple-icon.png (Next file convention). Google only uses square
  // favicons, so the old wide logo.jpg was rejected → generic globe.
  openGraph: {
    type: "website",
    siteName: BUSINESS.name,
    url: `${SITE_URL}/`,
    title: "Nepal Tour Packages from Raxaul | TripSangam Travels",
    description:
      "Book Nepal tour packages from Raxaul with TripSangam Travels. Kathmandu, Pokhara, Muktinath, Chitwan and more — with Raxaul–Birgunj border assistance.",
    images: [{ url: BUSINESS.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nepal Tour Packages from Raxaul | TripSangam Travels",
    description:
      "Nepal tours from Raxaul — Kathmandu, Pokhara, Muktinath, Chitwan. Border pickup assistance.",
    images: [BUSINESS.ogImage],
  },
  // Optional HTML-tag verification for a Search Console URL-prefix property.
  // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to the token to emit the tag.
  // (A Domain property — sc-domain:tripsangam.com — verifies via DNS instead.)
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

// Default: LIGHT. Dark mode only activates when the user explicitly toggled it before.
const themeInitScript = `(function(){try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

// Google Translate widget bootstrap. The widget reads the googtrans cookie
// (set by LanguageSwitcher) and translates the page on load.
const translateInitScript = `function googleTranslateElementInit(){new google.translate.TranslateElement({pageLanguage:'en',includedLanguages:'en,ne,hi,bn,mr,ta,te,gu,pa,kn,ml,or',autoDisplay:false},'google_translate_element');}`;

// Google Translate rewrites text nodes into <font> wrappers. When React later
// re-renders or the user navigates, it tries to remove/insert nodes that the
// translator moved and throws NotFoundError ("Failed to execute 'removeChild'"),
// white-screening the app. Make removeChild/insertBefore no-op safely when the
// node isn't actually a child, so React + Google Translate can coexist. Runs in
// <head> before hydration so it's in place before any reconciliation.
const translateGuardScript = `(function(){if(typeof Node!=='function'||!Node.prototype)return;var r=Node.prototype.removeChild;Node.prototype.removeChild=function(c){if(c&&c.parentNode!==this){return c;}return r.apply(this,arguments);};var i=Node.prototype.insertBefore;Node.prototype.insertBefore=function(n,ref){if(ref&&ref.parentNode!==this){return n;}return i.apply(this,arguments);};})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        {/* Speed up image loading from the CDNs we use most (perf / LCP). */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="preconnect" href="https://tripsangam.b-cdn.net" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script dangerouslySetInnerHTML={{ __html: translateGuardScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: translateInitScript }} />
        <script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async />
      </head>
      <body
        className="font-sans bg-sand text-ink antialiased dark:bg-[#0E0E0D] dark:text-sand"
        suppressHydrationWarning
      >
        <div id="google_translate_element" aria-hidden="true" suppressHydrationWarning />
        <Providers>
          <Header />
          <main className="w-full overflow-x-hidden">{children}</main>
          <Footer />
          {/* Spacer so the fixed mobile bottom bar never covers footer content. */}
          <div
            aria-hidden
            className="h-16 lg:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          />
          <ChatBubble />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
