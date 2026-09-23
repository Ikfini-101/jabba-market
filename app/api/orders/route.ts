import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { orders, products } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { effectivePrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, address, items } = body;

    if (!name || !phone || !email || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Données de commande invalides" }, { status: 400 });
    }

    // Validation phone Sénégal
    const phoneRegex = /^(\+221|00221)?\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Numéro de téléphone invalide" }, { status: 400 });
    }
    const cleanPhone = phone.replace(/\s/g, "");
    const normalizedPhone = cleanPhone.length === 9 ? `+221${cleanPhone}` : cleanPhone.replace("00221", "+221");

    // Valider les items
    const productIds = items.map((i: any) => i.productId);
    const db = await getDb();
    const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));

    let total = 0;
    const finalItems = [];

    for (const item of items) {
      const q = Math.floor(item.quantity);
      if (q < 1 || q > 999) {
        return NextResponse.json({ error: `Quantité invalide pour ${item.productId}` }, { status: 400 });
      }

      const p = dbProducts.find((p) => p.id === item.productId);
      if (!p || !p.active || p.rarity === "OUT_OF_STOCK") {
        return NextResponse.json({ error: `Produit indisponible: ${p?.name || item.productId}` }, { status: 400 });
      }

      const price = effectivePrice({ price: p.priceMin, promoPrice: p.promoPrice });
      total += price * q;

      finalItems.push({
        productId: p.id,
        name: p.name,
        price: price,
        quantity: q,
        image: p.images?.[0],
        sku: p.sku,
        unit: p.unit,
      });
    }

    const orderId = `JABBA-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    await db.insert(orders).values({
      id: orderId,
      customerEmail: email,
      customerName: name,
      customerPhone: normalizedPhone,
      shippingAddress: {
        street: address.street,
        city: address.city,
        postalCode: address.postalCode || "",
        country: "Sénégal"
      },
      status: "PENDING",
      items: finalItems,
      total,
    });

    return NextResponse.json({ orderId }, { status: 201 });
  } catch (error) {
    console.error("[Order Error]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
