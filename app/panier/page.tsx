"use client";

import { Header, Footer } from "@/components/storefront/Layout";
import { useCart } from "@/lib/cart";
import { Trash2, ArrowRight, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "Sénégal"
  });

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      const payload = {
        email: form.email,
        name: form.name,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country
        },
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erreur lors de la commande");
      
      const { orderId } = await res.json();
      clearCart();
      router.push(`/commande/confirmation?id=${orderId}`);
    } catch (err) {
      alert("Une erreur est survenue lors de la commande.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <h1 className="text-3xl md:text-4xl font-black mb-10 text-gray-800 tracking-tight glass-md inline-block px-6 py-3">
          Votre Panier
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-24 glass-sm border border-white/60 rounded-2xl shadow-md">
            <ShoppingBag size={64} className="mx-auto text-gray-500 mb-6" />
            <p className="text-2xl font-bold text-gray-800 mb-4">Votre panier est vide.</p>
            <Link 
              href="/catalogue" 
              className="inline-block glass-gold text-gray-800 font-bold py-4 px-8 rounded-xl hover:glass-gold transition-colors shadow-md"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Items List */}
            <div className="flex-1 space-y-6">
              {cart.map((item) => (
                <div key={item.productId} className="flex flex-col sm:flex-row gap-6 glass-sm border border-white/60 p-5 rounded-2xl shadow-md relative pr-12">
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="absolute top-5 right-5 text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={20} />
                  </button>

                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-transparent rounded-xl overflow-hidden shrink-0 border border-white/60">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-medium">Sans image</div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 pr-8">{item.name}</h3>
                      <p className="text-sm font-bold text-bb-gold glass-gold px-2 py-0.5 rounded inline-block mt-2">
                        {formatPrice(item.price)} l&apos;unité
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center bg-transparent border border-white/60 rounded-lg">
                        <button 
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="px-3 py-1 hover:bg-neutral-200 transition-colors font-bold text-gray-800"
                        >-</button>
                        <span className="w-10 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-neutral-200 transition-colors font-bold text-gray-800"
                        >+</button>
                      </div>
                      
                      <span className="font-black text-xl text-gray-800">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Panel */}
            <div className="w-full lg:w-[400px] shrink-0">
              <div className="glass-sm border border-white/60 rounded-2xl p-6 md:p-8 sticky top-24 shadow-md">
                <h2 className="text-2xl font-black mb-6 text-gray-800 border-b border-white/60 pb-4">Résumé</h2>
                
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gray-500 font-medium">Total ({cart.length} articles)</span>
                  <span className="text-3xl font-black text-bb-gold">{formatPrice(total)}</span>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <h3 className="font-bold text-lg mb-2 text-gray-800">Livraison</h3>
                  
                  <input
                    type="text" required placeholder="Nom complet *"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-transparent border border-white/60 text-gray-800 rounded-xl p-3.5 focus:outline-none focus:border-bb-gold focus:ring-1 focus:ring-bb-gold font-medium placeholder-admin-text-muted"
                  />
                  
                  <input
                    type="tel" required placeholder="Téléphone *"
                    value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full bg-transparent border border-white/60 text-gray-800 rounded-xl p-3.5 focus:outline-none focus:border-bb-gold focus:ring-1 focus:ring-bb-gold font-medium placeholder-admin-text-muted"
                  />
                  
                  <input
                    type="email" required placeholder="Email *"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full bg-transparent border border-white/60 text-gray-800 rounded-xl p-3.5 focus:outline-none focus:border-bb-gold focus:ring-1 focus:ring-bb-gold font-medium placeholder-admin-text-muted"
                  />
                  
                  <input
                    type="text" required placeholder="Quartier, rue, point de repère *"
                    value={form.street} onChange={e => setForm({...form, street: e.target.value})}
                    className="w-full bg-transparent border border-white/60 text-gray-800 rounded-xl p-3.5 focus:outline-none focus:border-bb-gold focus:ring-1 focus:ring-bb-gold font-medium placeholder-admin-text-muted"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text" required placeholder="Ville *"
                      value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                      className="w-full bg-transparent border border-white/60 text-gray-800 rounded-xl p-3.5 focus:outline-none focus:border-bb-gold focus:ring-1 focus:ring-bb-gold font-medium placeholder-admin-text-muted"
                    />
                    <input
                      type="text" placeholder="Code postal (facultatif)"
                      value={form.postalCode} onChange={e => setForm({...form, postalCode: e.target.value})}
                      className="w-full bg-transparent border border-white/60 text-gray-800 rounded-xl p-3.5 focus:outline-none focus:border-bb-gold focus:ring-1 focus:ring-bb-gold font-medium placeholder-admin-text-muted"
                    />
                  </div>
                  
                  <input
                    type="text" required disabled value="Sénégal"
                    className="w-full bg-transparent border border-white/60 text-gray-500 rounded-xl p-3.5 font-bold cursor-not-allowed"
                  />

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full glass-gold hover:glass-gold text-gray-800 font-bold text-lg py-4 rounded-xl mt-6 flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 shadow-lg shadow-bb-gold/30 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : (
                      <>Valider la commande <ArrowRight size={20} /></>
                    )}
                  </button>
                  <p className="text-xs text-center text-gray-500 font-medium mt-4">
                    Paiement à la livraison
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
