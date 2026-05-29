import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatBubble } from "@/components/layout/ChatBubble";
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
  title: "Trip Sangam — Where the Sky Begins",
  description:
    "Curated journeys across Nepal's most sacred landscapes. Trekking, cultural & spiritual experiences led by local guides.",
  keywords: ["Nepal", "trekking", "Everest", "Annapurna", "Himalayan tours"],
  openGraph: {
    title: "Trip Sangam",
    description: "Curated journeys across Nepal's most sacred landscapes.",
    type: "website",
  },
};

// Default: LIGHT. Dark mode only activates when the user explicitly toggled it before.
const themeInitScript = `(function(){try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

// Google Translate widget bootstrap. The widget reads the googtrans cookie
// (set by LanguageSwitcher) and translates the page on load.
const translateInitScript = `function googleTranslateElementInit(){new google.translate.TranslateElement({pageLanguage:'en',includedLanguages:'en,ne,hi,bn,mr,ta,te,gu,pa,kn,ml,or',autoDisplay:false},'google_translate_element');}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
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
          <ChatBubble />
        </Providers>
      </body>
    </html>
  );
}
