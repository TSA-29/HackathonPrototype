import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Interactive Session",
  description: "Interactive AI learning sessions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
