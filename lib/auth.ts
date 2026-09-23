// Auth helper — JWT maison avec jose + bcryptjs (BB-03 §4)
// ⚠️ JAMAIS bcrypt (binding C++ natif), toujours bcryptjs (pur JS)
// ⚠️ JWT_SECRET validé lazily (pas au top-level) pour éviter erreur next build

import { SignJWT, jwtVerify } from "jose";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";

const COOKIE_NAME = "jabba-admin-token";
const TOKEN_EXPIRY = "24h";

/** Lazy getter — évalue JWT_SECRET à la demande, jamais au chargement du module */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required. Set it in .dev.vars (local) or as a wrangler secret (production).");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

export async function signToken(payload: {
  adminId: string;
  email: string;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as { adminId: string; email: string };
  } catch {
    return null;
  }
}

// For use in Route Handlers (server-side)
export async function getAdminFromCookie(): Promise<{
  adminId: string;
  email: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// For use in middleware (uses request object, NOT cookies())
// ⚠️ BB-03 §4 : cookies() de next/headers casse en prod Workers
export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

export { COOKIE_NAME };
