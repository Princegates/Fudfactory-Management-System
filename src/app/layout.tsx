import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fudfactory.gh"),
  title: {
    default: "FudFactory | Your Favorite Chef, Delivered",
    template: "%s | FudFactory",
  },
  description:
    "FudFactory — Ghana's favorite chef, bringing you cakes, pastries, meals and catering. Order online for pickup or delivery, tracked in real time.",
  openGraph: {
    title: "FudFactory | Your Favorite Chef, Delivered",
    description:
      "Order cakes, pastries, snacks and meals online for pickup or delivery from FudFactory.",
    siteName: "FudFactory",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1c130c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
