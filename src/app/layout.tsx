import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fudfactory.gh"),
  title: {
    default: "FudFactory | Fresh Bakes, Pastries & Catering",
    template: "%s | FudFactory",
  },
  description:
    "FudFactory is a food, pastry and catering business — order cakes, pastries, snacks and meals online for pickup or delivery.",
  openGraph: {
    title: "FudFactory | Fresh Bakes, Pastries & Catering",
    description:
      "Order cakes, pastries, snacks and meals online for pickup or delivery from FudFactory.",
    siteName: "FudFactory",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#cc6a1f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
