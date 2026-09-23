// BB-03 §6 — Schéma D1 (Drizzle) MVP
// + PRD §9 : orders.status accepte CANCELLED

import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  country: text("country"),
  category: text("category").notNull(),
  priceMin: real("price_min").notNull(),
  priceMax: real("price_max"),
  isNegotiable: integer("is_negotiable", { mode: "boolean" }).default(false),
  rarity: text("rarity").default("AVAILABLE"), // RARE | AVAILABLE | IN_STOCK
  images: text("images", { mode: "json" }).$type<string[]>(),
  active: integer("active", { mode: "boolean" }).default(true),
  sku: text("sku").unique(),
  shortDescription: text("short_description"),
  promoPrice: real("promo_price"),
  unit: text("unit"),
  stockQuantity: integer("stock_quantity"),
  stockUnit: text("stock_unit"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  customerName: text("customer_name"),
  shippingAddress: text("shipping_address", { mode: "json" }).$type<{
    street: string;
    city: string;
    postalCode: string;
    country: string;
  }>(),
  status: text("status").default("PENDING"),
  // PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED
  items: text("items", { mode: "json" }).$type<
    Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      image?: string;
    }>
  >(),
  total: real("total").notNull(),
  stripeSessionId: text("stripe_session_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`),
});

export const admins = sqliteTable("admins", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});
