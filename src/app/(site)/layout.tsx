import { CartProvider } from "@/components/site/CartContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { DEFAULT_SITE_THEME, isValidSiteTheme } from "@/lib/themes";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const stored = await getSetting(SETTING_KEYS.siteTheme, DEFAULT_SITE_THEME);
  const theme = stored && isValidSiteTheme(stored) ? stored : DEFAULT_SITE_THEME;

  return (
    <CartProvider>
      <div className="site-theme flex min-h-screen flex-col" data-site-theme={theme}>
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
