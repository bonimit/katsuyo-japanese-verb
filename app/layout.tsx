import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bonimit.github.io/katsuyo-japanese-verb/"),
  title: "Katsuyō — Japanese Practice",
  description:
    "Practice Japanese verb conjugation and reading with adaptive levels, everyday examples, and Katsu, your capybara coach.",
  openGraph: {
    title: "Katsuyō — Japanese Practice",
    description: "Choose verb conjugation or reading practice and learn with Katsu, your adaptive capybara coach.",
    images: [{ url: "og.png", width: 1200, height: 630, alt: "Katsuyō and Katsu the blue capybara wizard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Katsuyō — Japanese Practice",
    description: "Choose verb conjugation or reading practice and learn with Katsu, your adaptive capybara coach.",
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
