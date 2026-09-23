#!/usr/bin/env python3
r"""
Phase 5 - Catalogue import: Jabba Produits_E-commerce G2.xls -> D1 local
Usage: python scripts/import-catalog.py
Run from: c:/Users/PC/Documents/JABBA/Jabba/site/
"""

import subprocess
import sys
import re
import os

# Force UTF-8 output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─── Config ───────────────────────────────────────────────────────────────────
EXCEL_PATH = r"C:\Users\PC\Documents\JABBA\Jabba Produits_E-commerce G2.xls"
DB_NAME = "jabba-db"
CATEGORY_MAP = {
    "Charcuterie": "Charcuterie",
    "Confitures": "Confitures",
    "Epices": "Épices",
    "Épices": "Épices",
    "Fruits": "Fruits",
    "Légumes & Aromates": "Légumes & Aromates",
    "Legumes & Aromates": "Légumes & Aromates",
    "Produits halieutiques Frais": "Produits halieutiques frais",
    "Produits halieutiques frais": "Produits halieutiques frais",
    "Produits halieutiques Transformés": "Produits halieutiques transformés",
    "Produits halieutiques transformés": "Produits halieutiques transformés",
    "Produits halieutiques Transformes": "Produits halieutiques transformés",
    "Produits végétaux transformés": "Produits végétaux transformés",
    "Produits végétaux Transformés": "Produits végétaux transformés",
    "Céréales": "Céréales",
    "cereales": "Céréales",
}
DUPLICATE_SKUS = {"PROD-041", "PROD-128"}  # force inactive (duplicates per prompt audit)

# ─── Install deps if needed ────────────────────────────────────────────────────
try:
    import xlrd
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "xlrd", "--quiet"])
    import xlrd

# ─── Helpers ──────────────────────────────────────────────────────────────────

def parse_price(raw) -> int | None:
    """Extract integer price from e.g. '2300 Fcfa ' or 2300.0"""
    if raw is None or raw == "":
        return None
    s = str(raw).strip()
    if not s:
        return None
    # Remove any currency label (Fcfa, FCFA, XOF, F, etc.)
    s = re.sub(r"[fF][cC][fF][aA]|FCFA|fcfa|XOF|xof|F\b", "", s, flags=re.IGNORECASE)
    s = s.replace(" ", "").replace(",", "").replace(".", "").strip()
    if not s:
        return None
    try:
        return int(float(s))
    except Exception:
        return None

def parse_stock(raw) -> int | None:
    if raw is None or raw == "":
        return None
    s = str(raw).strip()
    # e.g. "100 kg", "200", "50 pcs"
    m = re.match(r"^(\d+(?:\.\d+)?)", s)
    if m:
        return int(float(m.group(1)))
    return None

def esc(s: str) -> str:
    """Escape single quotes for SQL."""
    return s.replace("'", "''")

def map_rarity(statut_inventaire: str) -> str:
    s = str(statut_inventaire).strip().lower()
    if "rupture" in s or "out" in s:
        return "OUT_OF_STOCK"
    if "rare" in s or "limit" in s:
        return "RARE"
    return "IN_STOCK"

def map_active(statut: str) -> int:
    s = str(statut).strip().lower()
    if s in ("vrai", "true", "oui", "actif", "1", "yes"):
        return 1
    return 0

def image_key(filename: str, category: str) -> str | None:
    """Build R2 image key: category/filename — used later for upload."""
    if not filename or not filename.strip():
        return None
    fn = filename.strip()
    # Map category name → folder name (matching jabba-data folder names)
    folder_map = {
        "Charcuterie": "Charcuterie",
        "Confitures": "Confitures",
        "Épices": "Epices",
        "Fruits": "Fruits",
        "Légumes & Aromates": "Légumes & Aromates",
        "Produits halieutiques frais": "Produits halieutiques Frais",
        "Produits halieutiques transformés": "Produits halieutiques Transformés",
        "Produits végétaux transformés": "Produits végétaux transformés",
        "Céréales": "céréales",
    }
    folder = folder_map.get(category, category)
    return f"{folder}/{fn}"

# ─── Read Excel ───────────────────────────────────────────────────────────────
print(f"📖 Reading: {EXCEL_PATH}")
wb = xlrd.open_workbook(EXCEL_PATH)
ws = wb.sheet_by_index(0)
headers = [ws.cell_value(0, c) for c in range(ws.ncols)]
print(f"   Columns ({ws.ncols}): {headers}")
print(f"   Data rows: {ws.nrows - 1}")

rows = []
for r in range(1, ws.nrows):
    row = {headers[c]: ws.cell_value(r, c) for c in range(ws.ncols)}
    rows.append(row)

# ─── Build SQL statements ──────────────────────────────────────────────────────
insert_stmts = []
skipped = []
errors = []

for row in rows:
    sku = str(row.get("ID Produit", "")).strip()
    if not sku:
        skipped.append(f"[no SKU] {row}")
        continue

    name_raw = str(row.get("Nom du produit", "")).strip()
    if not name_raw:
        skipped.append(f"[no name] {sku}")
        continue

    cat_raw = str(row.get("Catégorie", "") or row.get("Cat\u00e9gorie", "")).strip()
    if not cat_raw:
        # Try alternate key (encoding issues)
        for k in row.keys():
            if "gor" in k.lower() or "cat" in k.lower():
                cat_raw = str(row[k]).strip()
                break
    category = CATEGORY_MAP.get(cat_raw, cat_raw)

    price_raw = row.get("Prix unitaire")
    promo_raw = row.get("Prix promotionnel")
    unit_raw = str(row.get("Unité de mesure", "") or row.get("Unit\u00e9 de mesure", "")).strip()
    stock_raw = row.get("Stock disponible")
    statut_inv = str(row.get("Statut de l'inventaire", "En stock")).strip()
    short_desc = str(row.get("Description courte", "") or "").strip()
    long_desc = str(row.get("Description détaillée", "") or row.get("Description d\u00e9taill\u00e9e", "") or "").strip()
    img_file = str(row.get("Nom du fichier image", "") or "").strip()
    statut = str(row.get("Statut (Actif/Inactif)", "Vrai")).strip()

    price_min = parse_price(price_raw)
    if price_min is None:
        errors.append(f"[no price] {sku}: {price_raw!r}")
        price_min = 0  # fallback, will be visible as 0 FCFA for admin to fix

    promo_price = parse_price(promo_raw)
    # Sanity: promo must be < price
    if promo_price is not None and promo_price >= price_min:
        promo_price = None  # invalid promo per prompt audit (PROD-100 case)

    stock_qty = parse_stock(stock_raw)
    rarity = map_rarity(statut_inv)
    active = map_active(statut)
    if sku in DUPLICATE_SKUS:
        active = 0

    img_key = image_key(img_file, category) if img_file else None
    # Store as JSON array for the images column
    images_json = f'["/api/images/{img_key.replace(chr(39), chr(39)+chr(39))}"]' if img_key else "null"

    # Product ID = sku for traceability
    prod_id = sku

    # Stock unit: extract unit part from stock string (e.g. "100 kg" → "kg")
    stock_unit = None
    if stock_raw:
        sm = re.search(r"\d+\s*(.*)", str(stock_raw).strip())
        if sm:
            su = sm.group(1).strip()
            if su:
                stock_unit = su

    stmt = f"""INSERT OR REPLACE INTO products 
  (id, sku, name, category, price_min, promo_price, unit, stock_quantity, stock_unit,
   short_description, description, images, rarity, active, is_negotiable, created_at)
VALUES (
  '{esc(prod_id)}',
  '{esc(sku)}',
  '{esc(name_raw)}',
  '{esc(category)}',
  {price_min},
  {promo_price if promo_price is not None else 'NULL'},
  {f"'{esc(unit_raw)}'" if unit_raw else 'NULL'},
  {stock_qty if stock_qty is not None else 'NULL'},
  {f"'{esc(stock_unit)}'" if stock_unit else 'NULL'},
  {f"'{esc(short_desc)}'" if short_desc else 'NULL'},
  {f"'{esc(long_desc)}'" if long_desc else 'NULL'},
  '{images_json}',
  '{rarity}',
  {active},
  0,
  unixepoch()
);"""
    insert_stmts.append(stmt)

# ─── Write SQL file ────────────────────────────────────────────────────────────
sql_path = os.path.join(os.path.dirname(__file__), "seed-catalog.sql")
full_sql = "-- Jabba catalog seed — auto-generated by import-catalog.py\n"
full_sql += "BEGIN TRANSACTION;\n\n"
full_sql += "\n".join(insert_stmts)
full_sql += "\n\nCOMMIT;\n"

with open(sql_path, "w", encoding="utf-8") as f:
    f.write(full_sql)

print(f"\n✅ SQL generated: {sql_path}")
print(f"   {len(insert_stmts)} INSERT statements")
if skipped:
    print(f"   ⚠️  Skipped {len(skipped)}: {skipped[:5]}")
if errors:
    print(f"   ❌ Errors {len(errors)}: {errors[:5]}")

# ─── Apply to D1 local ────────────────────────────────────────────────────────
print("\n🗄️  Applying to D1 local...")
result = subprocess.run(
    ["npx", "wrangler", "d1", "execute", DB_NAME, "--local", "--file", sql_path],
    capture_output=True, text=True
)
print(result.stdout)
if result.returncode != 0:
    print("STDERR:", result.stderr)
    sys.exit(1)

# ─── Verify ────────────────────────────────────────────────────────────────────
print("🔍 Verifying import...")
verify = subprocess.run(
    ["npx", "wrangler", "d1", "execute", DB_NAME, "--local", "--command",
     "SELECT COUNT(*) as total, SUM(active) as actifs, COUNT(promo_price) as promos FROM products"],
    capture_output=True, text=True
)
print(verify.stdout)

print("\n🎉 Done! Catalogue Jabba importé dans la base locale.")
print("   ➜  Lancez `npm run dev` dans site/ pour vérifier le catalogue.")
