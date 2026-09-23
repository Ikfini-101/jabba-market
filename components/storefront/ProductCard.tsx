import Link from "next/link";
import { RARITY_CONFIG } from "@/lib/constants";
import { effectivePrice, formatPrice, formatUnit, discountPercent } from "@/lib/format";

export default function ProductCard({ product }: { product: any }) {
  const rarityConf = RARITY_CONFIG[product.rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.IN_STOCK;
  const isPromo = product.promoPrice != null && product.promoPrice < product.priceMin;
  const price = effectivePrice({ price: product.priceMin, promoPrice: product.promoPrice });
  const discount = discountPercent({ price: product.priceMin, promoPrice: product.promoPrice });

  return (
    <Link href={`/produit/${product.id}`} className="group glass-sm flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative">
      {/* Badge Rareté */}
      <div className="absolute top-3 right-3 z-10 px-3 py-1 text-xs font-bold glass-xs" style={{ color: rarityConf.color }}>
        {rarityConf.label}
      </div>

      {/* Badge Promo */}
      {isPromo && (
        <div className="absolute top-3 left-3 z-10 px-3 py-1 text-xs font-bold text-white bg-red-500 rounded-full shadow-md">
          -{discount}%
        </div>
      )}

      {/* Image */}
      <div className="aspect-[4/3] bg-gray-200/50 relative overflow-hidden rounded-t-xl">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">Sans image</div>
        )}
      </div>

      {/* Infos */}
      <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800 truncate group-hover:text-bb-gold transition-colors">{product.name}</h3>
          <p className="text-xs text-gray-500 truncate mt-0.5">{product.category}</p>
        </div>
        
        {/* Prix */}
        <div className="mt-auto pt-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-gray-800">
              {formatPrice(price)}{formatUnit(product.unit)}
            </span>
            {isPromo && (
              <span className="text-xs font-medium text-gray-400 line-through">
                {formatPrice(product.priceMin)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
