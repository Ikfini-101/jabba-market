import { Header, Footer } from "@/components/storefront/Layout";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import ProductCard from "@/components/storefront/ProductCard";
import HeroCarousel from "@/components/storefront/HeroCarousel";
import { Drumstick, CookingPot, Flame, Apple, Carrot, Fish, Shell, Leaf, Wheat } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Charcuterie": Drumstick,
  "Confitures": CookingPot,
  "Épices": Flame,
  "Fruits": Apple,
  "Légumes & Aromates": Carrot,
  "Produits halieutiques frais": Fish,
  "Produits halieutiques transformés": Shell,
  "Produits végétaux transformés": Leaf,
  "Céréales": Wheat,
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = await getDb();
  const recentProducts = await db.select().from(products).where(eq(products.active, true)).orderBy(desc(products.createdAt)).limit(12);
  
  const allActiveProducts = await db.select().from(products).where(eq(products.active, true));
  const featuredProductsMap = new Map();
  for (const product of allActiveProducts) {
    if (!featuredProductsMap.has(product.category) && featuredProductsMap.size < 8) {
      featuredProductsMap.set(product.category, product);
    }
  }
  const featuredProducts = Array.from(featuredProductsMap.values());

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroCarousel products={featuredProducts} />

        {/* HERO */}
        <section className="relative py-16 md:py-24 flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-gray-300/60 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gray-200/60 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-accent/10 blur-3xl"></div>
          </div>

          <div className="relative z-10 glass-lg text-center max-w-4xl mx-auto p-10 md:p-16 space-y-8">
            <h1 className="text-5xl md:text-7xl font-black text-gray-800 tracking-tight leading-tight">
              {siteConfig.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
              {siteConfig.heroSubtitle}
            </p>
            <Link href="/catalogue" className="inline-block glass-brand text-gray-900 font-bold text-lg py-4 px-10 rounded-2xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              Voir le catalogue →
            </Link>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <h2 className="text-3xl font-black mb-10 text-center text-gray-700 tracking-tight">Nos Rayons</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/catalogue?category=${encodeURIComponent(category)}`}
                className="glass-sm p-6 text-center hover:border-brand-accent/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group flex flex-col items-center justify-center gap-4 aspect-square"
              >
                {(() => {
                  const Icon = CATEGORY_ICONS[category];
                  return Icon ? (
                    <Icon
                      size={36}
                      strokeWidth={1.75}
                      className="text-gray-700 group-hover:text-brand-accent transition-colors duration-300"
                    />
                  ) : null;
                })()}
                <span className="font-bold text-sm text-gray-800 group-hover:text-gray-900 transition-colors leading-tight">
                  {category}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* NOS PRODUITS */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <h2 className="text-3xl font-black text-gray-700 tracking-tight">Nos produits</h2>
            <Link href="/catalogue" className="text-brand-accent hover:text-brand-accent/80 font-bold flex items-center gap-1 group">
              Voir tout <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
      {siteConfig.contact.whatsapp && <WhatsAppButton />}
    </div>
  );
}
