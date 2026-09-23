"use client";

import { useEffect, useState, use } from "react";
import { Header, Footer } from "@/components/storefront/Layout";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { RARITY_CONFIG } from "@/lib/constants";
import { formatPrice, effectivePrice, discountPercent, formatUnit } from "@/lib/format";
import { useRouter } from "next/navigation";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const router = useRouter();
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />
      <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-bb-gold" size={48} /></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />
      <div className="flex-1 flex justify-center items-center flex-col gap-4">
        <p className="text-xl text-gray-800 font-bold">Produit introuvable</p>
        <Link href="/catalogue" className="text-bb-gold font-bold hover:underline">Retour au catalogue</Link>
      </div>
    </div>
  );

  const rarityConf = RARITY_CONFIG[product.rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.IN_STOCK;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: effectivePrice(product),
      quantity,
      image: product.images?.[0],
      isNegotiable: product.isNegotiable ?? false,
    });
    router.push('/panier');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/catalogue" className="text-gray-500 hover:text-bb-gold font-bold flex items-center gap-2 text-sm w-fit mb-8 transition-colors">
          <ArrowLeft size={16} /> Retour au catalogue
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="aspect-[4/3] w-full glass-sm border border-white/60 rounded-2xl overflow-hidden relative shadow-md">
              {product.images?.[activeImage] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={product.images[activeImage]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">Sans image</div>
              )}
            </div>
            
            {product.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-bb-gold shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col admin-glass-panel border-0">
            <div className="mb-6 space-y-4 border-b border-white/60 pb-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-bb-gold glass-gold px-3 py-1 rounded-full">{product.category}</span>
                {product.country && <span className="text-sm font-bold text-gray-800 border border-white/60 glass-sm px-3 py-1 rounded-full">{product.country}</span>}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight">{product.name}</h1>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-baseline gap-2">
                  {product.promoPrice != null && product.promoPrice < product.priceMin ? (
                    <>
                      <span className="text-3xl font-black text-admin-accent-500">
                        {formatPrice(product.promoPrice)}
                      </span>
                      <span className="text-xl font-semibold text-gray-400 line-through">
                        {formatPrice(product.priceMin)}
                      </span>
                      <span className="bg-admin-accent-100 text-admin-accent-700 text-sm font-bold px-2 py-0.5 rounded-full">
                        -{discountPercent(product)} %
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-black text-[var(--color-brand)]">
                      {formatPrice(product.priceMin)}
                    </span>
                  )}
                  {product.unit && (
                    <span className="text-base text-gray-500 font-medium">{formatUnit(product.unit)}</span>
                  )}
                </div>
                <span
                  className="px-3 py-1 text-sm font-bold rounded-lg border glass-sm shadow-md"
                  style={{ color: rarityConf.color, borderColor: `${rarityConf.color}40` }}
                >
                  {rarityConf.label}
                </span>
              </div>
            </div>

            <div className="prose prose-admin mb-8 text-gray-500 font-medium">
              <p className="whitespace-pre-wrap leading-relaxed">{product.description || "Aucune description disponible pour ce produit."}</p>
            </div>

            {/* Action Box */}
            <div className="mt-auto glass-sm border border-white/60 rounded-2xl p-6 shadow-md">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-800">Quantité</span>
                  <div className="flex items-center bg-transparent border border-white/60 rounded-xl">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-neutral-200 transition-colors font-bold text-gray-800 rounded-l-xl">-</button>
                    <span className="w-12 text-center font-bold text-gray-800">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-neutral-200 transition-colors font-bold text-gray-800 rounded-r-xl">+</button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.rarity === "OUT_OF_STOCK"}
                  className="w-full glass-brand text-gray-800 font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <ShoppingBag size={24} />
                  {product.rarity === "OUT_OF_STOCK"
                    ? "Rupture de stock"
                    : `Ajouter au panier • ${formatPrice(effectivePrice(product) * quantity)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
