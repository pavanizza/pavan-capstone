import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriAgent",
  description: "Log what you ate. The AI tracks it and tells you what to eat next.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
