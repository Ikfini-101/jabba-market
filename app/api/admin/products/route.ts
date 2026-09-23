// POST /api/admin/products — Créer produit (PRD §7.10)
// PATCH handled via /api/admin/products/[id]

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation PRD §7.10
    const { name, description, category, country, priceMin, priceMax, isNegotiable, rarity, images, active } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Nom et catégorie requis" },
        { status: 400 }
      );
    }

    if (!priceMin || priceMin <= 0) {
      return NextResponse.json(
        { error: "Prix doit être supérieur à 0" },
        { status: 400 }
      );
    }

    if (isNegotiable && (!priceMax || priceMax <= priceMin)) {
      return NextResponse.json(
        { error: "Prix max requis et doit être supérieur au prix min pour un produit négociable" },
        { status: 400 }
      );
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Au moins 1 photo requise" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const db = await getDb();

    await db.insert(products).values({
      id,
      name,
      description: description || null,
      category,
      country: country || null,
      priceMin,
      priceMax: isNegotiable ? priceMax : null,
      isNegotiable: !!isNegotiable,
      rarity: rarity || "AVAILABLE",
      images,
      active: active !== false,
    });


    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    console.error("[Create Product Error]", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// GET /api/admin/products — Liste admin (tous les produits, même inactifs)
export async function GET() {
  try {
    const db = await getDb();
    const items = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));

    return NextResponse.json({ products: items });
  } catch (error) {
    console.error("[Admin Products List Error]", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
