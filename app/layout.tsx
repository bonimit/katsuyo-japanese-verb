import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Katsuyō — Japanese Verb Practice",
  description:
    "Master Japanese verb conjugations with adaptive clues, real-life examples, translations, and group reference tables.",
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
