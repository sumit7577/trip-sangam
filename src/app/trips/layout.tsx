import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Trips",
  robots: { index: false, follow: false },
};

export default function TripsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
