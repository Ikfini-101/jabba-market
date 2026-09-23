"use client";

import Image from "next/image";
import { ShoppingBag, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { cart } = useCart();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full glass-md rounded-none" style={{ borderRadius: 0, backdropFilter: "blur(24px) saturate(200%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <Link href="/" className="flex items-center">
            <Image src="/logo-transparent.png" alt="Jabba" width={200} height={64} className="h-16 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300" priority />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/" className={`text-sm font-bold transition-colors ${pathname === '/' ? 'text-bb-gold' : 'text-gray-600 hover:text-bb-gold'}`}>Accueil</Link>
            <Link href="/catalogue" className={`text-sm font-bold transition-colors ${pathname === '/catalogue' ? 'text-bb-gold' : 'text-gray-600 hover:text-bb-gold'}`}>Catalogue</Link>
            <Link href="/panier" className="relative text-gray-600 hover:text-bb-gold transition-colors">
              <ShoppingBag size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 glass-gold text-gray-900 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-4">
            <Link href="/panier" className="relative text-gray-600">
              <ShoppingBag size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 glass-gold text-gray-900 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2 hover:bg-white/50 rounded-xl transition-colors">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden glass-md absolute w-full left-0 top-16 rounded-none shadow-lg px-4 py-4 space-y-2">
          <Link href="/" onClick={() => setIsOpen(false)} className={`block px-4 py-3 rounded-xl text-base font-bold transition-colors ${pathname === '/' ? 'text-bb-gold bg-white/60' : 'text-gray-700 hover:bg-white/50'}`}>Accueil</Link>
          <Link href="/catalogue" onClick={() => setIsOpen(false)} className={`block px-4 py-3 rounded-xl text-base font-bold transition-colors ${pathname === '/catalogue' ? 'text-bb-gold bg-white/60' : 'text-gray-700 hover:bg-white/50'}`}>Catalogue</Link>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="glass-md mt-auto" style={{ borderRadius: 0 }}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <Link href="/">
            <Image src="/logo-transparent.png" alt="Black Bazaar" width={160} height={48} className="h-12 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300" />
          </Link>
          <p className="text-sm text-gray-500 mt-2 font-medium">Rare au pays disponible ici.</p>
        </div>
        <p className="text-sm text-gray-500 font-medium">© 2026 Black Bazaar. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
