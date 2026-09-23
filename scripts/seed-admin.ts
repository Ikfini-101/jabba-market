// Seed admin script — run once to create initial admin
// Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/seed-admin.ts
// Or just use the .dev.vars values: npx tsx scripts/seed-admin.ts

import { hashPassword } from "../lib/auth";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .dev.vars or as env vars");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();

  // Output SQL for manual insertion via wrangler d1 execute
  const sql = `INSERT INTO admins (id, email, password_hash) VALUES ('${id}', '${email}', '${passwordHash}');`;

  console.log("\n=== SEED ADMIN ===");
  console.log(`Email: ${email}`);
  console.log(`ID: ${id}`);
  console.log("\nRun this command to seed the admin (local):");
  console.log(`npx wrangler d1 execute jabba-db --local --command="${sql}"`);
  console.log(`\nFor production:`);
  console.log(`npx wrangler d1 execute jabba-db --remote --command="${sql}"`);
  console.log("\n==================\n");
}

main().catch(console.error);

