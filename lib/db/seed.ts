// B9 FIX: Les credentials admin ne sont PLUS hardcodés ici.
// Utiliser scripts/seed-admin.ts avec les valeurs de .dev.vars
// Ce fichier est conservé pour compatibilité mais ne doit PAS être appelé.

export async function forceSeedAdmin() {
  throw new Error(
    "forceSeedAdmin() est désactivé (B9 fix). " +
    "Utiliser: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/seed-admin.ts"
  );
}
