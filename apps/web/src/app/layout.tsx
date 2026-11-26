import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillForge",
  description: "Daily practice for the Top 1% software engineering syllabus.",
};

// Wraps every page. Next.js requires a default export for layouts and pages.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
