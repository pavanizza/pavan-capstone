import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grub",
  description: "An agent that reads what you just ate and tells you exactly what to eat next.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-paper antialiased">{children}</body>
    </html>
  );
}
