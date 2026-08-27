import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pheet — See where the work fits",
  description: "An evidence-led capability-alignment workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
