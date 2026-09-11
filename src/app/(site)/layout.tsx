import { cookies } from "next/headers";
import { CartProvider } from "@/components/site/CartContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { DEFAULT_SITE_THEME, isValidSiteTheme } from "@/lib/themes";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [stored, cookieStore] = await Promise.all([getSetting(SETTING_KEYS.siteTheme, DEFAULT_SITE_THEME), cookies()]);
  const theme = stored && isValidSiteTheme(stored) ? stored : DEFAULT_SITE_THEME;
  const mode = cookieStore.get("ff_site_mode")?.value === "light" ? "light" : "dark";

  return (
    <CartProvider>
      <div className="site-theme flex min-h-screen flex-col" data-site-theme={theme} data-mode={mode}>
        <Header mode={mode} />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
