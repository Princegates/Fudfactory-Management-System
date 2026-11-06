import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import { getBusinessProfile } from "@/lib/business";
import { getSiteUrl } from "@/lib/site";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const business = await getBusinessProfile();
  const title = `${business.businessName} | ${business.tagline}`;
  const description = `${business.businessName} — ${business.tagline}. Order online for pickup or delivery, tracked in real time.`;
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: title,
      template: `%s | ${business.businessName}`,
    },
    description,
    openGraph: {
      title,
      description,
      siteName: business.businessName,
      type: "website",
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1c130c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
