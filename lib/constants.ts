// Règles métier transverses Jabba

export const CATEGORIES = [
  "Charcuterie",
  "Confitures",
  "Épices",
  "Fruits",
  "Légumes & Aromates",
  "Produits halieutiques frais",
  "Produits halieutiques transformés",
  "Produits végétaux transformés",
  "Céréales",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ICONS: Record<Category, string> = {
  "Charcuterie": "🥩",
  "Confitures": "🍯",
  "Épices": "🌶️",
  "Fruits": "🍎",
  "Légumes & Aromates": "🥕",
  "Produits halieutiques frais": "🐟",
  "Produits halieutiques transformés": "🥫",
  "Produits végétaux transformés": "🥗",
  "Céréales": "🌾",
};

export const COUNTRIES = [] as const;
export type CountryName = string;

export const RARITY = ["IN_STOCK", "OUT_OF_STOCK"] as const;
export type Rarity = (typeof RARITY)[number];

export const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bgColor: string }> = {
  IN_STOCK: { label: "En stock", color: "#38A169", bgColor: "#38A16920" },
  OUT_OF_STOCK: { label: "Rupture", color: "#E53E3E", bgColor: "#E53E3E20" },
};

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "#ECC94B" },
  CONFIRMED: { label: "Confirmée", color: "#4299E1" },
  SHIPPED: { label: "Expédiée", color: "#9F7AEA" },
  DELIVERED: { label: "Livrée", color: "#38A169" },
  CANCELLED: { label: "Annulée", color: "#E53E3E" },
};
