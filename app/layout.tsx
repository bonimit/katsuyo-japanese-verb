import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bonimit.github.io/katsuyo-japanese-verb/"),
  title: "Katsuyō — Japanese Verb Practice",
  description:
    "Master Japanese verb conjugations with adaptive clues, real-life examples, translations, and group reference tables.",
  openGraph: {
    title: "Katsuyō — Japanese Verb Practice",
    description: "Turn verbs into victories with Katsu, your capybara conjugation wizard.",
    images: [{ url: "og.png", width: 1200, height: 630, alt: "Katsuyō and Katsu the blue capybara wizard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Katsuyō — Japanese Verb Practice",
    description: "Turn verbs into victories with Katsu, your capybara conjugation wizard.",
    images: ["og.png"],
  },
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
