"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, X, AlertTriangle } from "lucide-react";
import { CATEGORIES, RARITY } from "@/lib/constants";

export default function ProductForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    shortDescription: initialData?.shortDescription || "",
    description: initialData?.description || "",
    category: initialData?.category || CATEGORIES[0],
    price: initialData?.price || "",
    promoPrice: initialData?.promoPrice || "",
    unit: initialData?.unit || "",
    stockQuantity: initialData?.stockQuantity || "",
    stockUnit: initialData?.stockUnit || "",
    rarity: initialData?.rarity || "IN_STOCK",
    active: initialData?.active ?? true,
    images: initialData?.images || [] as string[],
  });

  const [uploadingImages, setUploadingImages] = useState(false);

  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > height) { if (width > 1600) { height *= 1600 / width; width = 1600; } }
          else { if (height > 1600) { width *= 1600 / height; height = 1600; } }
          canvas.width = width; canvas.height = height;
          canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Compression failed")), "image/jpeg", 0.8);
        };
      };
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (formData.images.length + files.length > 5) { setError("Maximum 5 photos"); return; }

    setUploadingImages(true); setError("");
    try {
      const newImages = [...formData.images];
      for (let i = 0; i < files.length; i++) {
        const compressedBlob = await compressImage(files[i]);
        const uploadData = new FormData();
        uploadData.append("file", compressedBlob, "image.jpg");
        if (initialData?.id) uploadData.append("productId", initialData.id);

        const res = await fetch("/api/admin/upload", { method: "POST", body: uploadData });
        if (!res.ok) throw new Error("Erreur upload");
        newImages.push((await res.json()).url);
      }
      setFormData({ ...formData, images: newImages });
    } catch (err: any) { setError(err.message); }
    finally { setUploadingImages(false); }
  }

  function removeImage(index: number) {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (formData.images.length === 0) { setError("Il faut au moins 1 photo."); window.scrollTo({ top: 0, behavior: "smooth" }); return; }

    const price = parseInt(String(formData.price), 10);
    const promoPrice = formData.promoPrice !== "" ? parseInt(String(formData.promoPrice), 10) : null;

    if (!price || price <= 0) { setError("Prix de vente invalide."); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (promoPrice !== null && (promoPrice <= 0 || promoPrice >= price)) {
      setError("Le prix promotionnel doit être inférieur au prix de vente.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price,
        promoPrice,
        stockQuantity: formData.stockQuantity !== "" ? parseInt(String(formData.stockQuantity), 10) : null,
        isNegotiable: false,
        priceMin: price,
        priceMax: null,
      };
      const url = initialData ? `/api/admin/products/${initialData.id}` : "/api/admin/products";
      const res = await fetch(url, { method: initialData ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).error || "Erreur sauvegarde");
      router.push("/admin/produits"); router.refresh();
    } catch (err: any) { setError(err.message); window.scrollTo({ top: 0, behavior: "smooth" }); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-3xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {initialData ? "Modifier le produit" : "Nouveau produit"}
        </h1>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Actif</label>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, active: !formData.active })}
            className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 ${formData.active ? "bg-admin-primary-500" : "bg-gray-300"}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${formData.active ? "translate-x-7" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* PHOTOS */}
      <div className="bg-admin-surface border border-admin-border rounded-xl p-4 md:p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-admin-primary-600">Photos (1 à 5)</h2>
        <div className="flex flex-wrap gap-4">
          {formData.images.map((url, i) => (
            <div key={i} className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border border-admin-border group shadow-sm">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-white/90 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X size={14} className="stroke-2" />
              </button>
            </div>
          ))}
          {formData.images.length < 5 && (
            <label className="w-24 h-24 md:w-32 md:h-32 border-2 border-dashed border-admin-border hover:border-admin-primary-500 rounded-lg flex flex-col items-center justify-center cursor-pointer text-admin-text-muted hover:text-admin-primary-500 transition-colors bg-admin-bg/50">
              {uploadingImages ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Camera size={24} className="mb-2" />
                  <span className="text-xs font-medium">Ajouter</span>
                </>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" capture="environment" multiple className="hidden" onChange={handleImageUpload} disabled={uploadingImages} />
            </label>
          )}
        </div>
      </div>

      {/* INFORMATIONS */}
      <div className="bg-admin-surface border border-admin-border rounded-xl p-4 md:p-6 space-y-5 shadow-sm">
        <h2 className="text-lg font-bold text-admin-primary-600">Informations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Référence (SKU) *</label>
            <input
              required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })}
              className="w-full bg-white border border-admin-border rounded-lg p-3 focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500 font-mono"
              placeholder="Ex: PROD-133"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Catégorie *</label>
            <select
              value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-white border border-admin-border rounded-lg p-3 focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nom du produit *</label>
          <input
            required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white border border-admin-border rounded-lg p-3 focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500"
            placeholder="Ex: Mangue Kent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description courte</label>
          <input
            value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
            className="w-full bg-white border border-admin-border rounded-lg p-3 focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500"
            placeholder="Résumé en une phrase"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description détaillée</label>
          <textarea
            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-white border border-admin-border rounded-lg p-3 min-h-[120px] focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500"
            placeholder="Description complète du produit"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Disponibilité</label>
          <select
            value={formData.rarity} onChange={e => setFormData({ ...formData, rarity: e.target.value })}
            className="w-full bg-white border border-admin-border rounded-lg p-3 focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500"
          >
            {RARITY.map(r => <option key={r} value={r}>{r === "IN_STOCK" ? "En stock" : "Rupture de stock"}</option>)}
          </select>
        </div>
      </div>

      {/* PRIX */}
      <div className="bg-admin-surface border border-admin-border rounded-xl p-4 md:p-6 space-y-5 shadow-sm">
        <h2 className="text-lg font-bold text-admin-primary-600">Prix</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prix de vente * (FCFA)</label>
            <input
              type="number" step="1" min="1" required
              value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-white border border-admin-border rounded-lg p-3 focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500"
              placeholder="2 500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Prix promo (FCFA)</label>
            <input
              type="number" step="1" min="1"
              value={formData.promoPrice} onChange={e => setFormData({ ...formData, promoPrice: e.target.value })}
              className="w-full bg-white border border-admin-border rounded-lg p-3 focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500"
              placeholder="Optionnel"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Unité</label>
            <input
              value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}
              list="units-list"
              className="w-full bg-white border border-admin-border rounded-lg p-3 focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500"
              placeholder="kg, pièce, sac..."
            />
            <datalist id="units-list">
              <option value="kg" />
              <option value="pièce" />
              <option value="sac de 25 kg" />
              <option value="sac de 50 kg" />
              <option value="sac de 5 kg" />
              <option value="sachet de 500 g" />
              <option value="boîte" />
              <option value="bocal de 250 g" />
              <option value="pot de 800 g" />
              <option value="paquet" />
              <option value="douzaine" />
            </datalist>
          </div>
        </div>
      </div>

      {/* STOCK */}
      <div className="bg-admin-surface border border-admin-border rounded-xl p-4 md:p-6 space-y-5 shadow-sm">
        <h2 className="text-lg font-bold text-admin-primary-600">Stock (usage interne)</h2>
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantité</label>
            <input
              type="number" step="1" min="0"
              value={formData.stockQuantity} onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
              className="w-full bg-white border border-admin-border rounded-lg p-3 focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500"
              placeholder="100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Unité de stock</label>
            <input
              value={formData.stockUnit} onChange={e => setFormData({ ...formData, stockUnit: e.target.value })}
              className="w-full bg-white border border-admin-border rounded-lg p-3 focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500"
              placeholder="kg"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || uploadingImages}
        className="w-full bg-admin-primary-500 hover:bg-admin-primary-600 text-white font-bold rounded-lg px-4 py-4 transition duration-300 flex justify-center items-center gap-2 disabled:opacity-50 shadow-sm"
      >
        {loading ? <Loader2 className="animate-spin" size={24} /> : (initialData ? "Enregistrer les modifications" : "Publier le produit")}
      </button>
    </form>
  );
}
