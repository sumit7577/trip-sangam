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
  title: "Sangam Travels — Where the Sky Begins",
  description:
    "Curated journeys across Nepal's most sacred landscapes. Trekking, cultural & spiritual experiences led by local guides.",
  keywords: ["Nepal", "trekking", "Everest", "Annapurna", "Himalayan tours"],
  openGraph: {
    title: "Sangam Travels",
    description: "Curated journeys across Nepal's most sacred landscapes.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans bg-sand text-ink antialiased">
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
