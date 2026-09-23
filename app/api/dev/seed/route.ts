// B8 FIX: Route de seed supprimée pour raisons de sécurité.
// Ne pas exposer de route de seed publique en production.
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
