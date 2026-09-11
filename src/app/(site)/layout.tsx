import { CartProvider } from "@/components/site/CartContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="site-theme flex min-h-screen flex-col">
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
