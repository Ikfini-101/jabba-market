"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, MapPin } from "lucide-react";
import { ORDER_STATUS_CONFIG, ORDER_STATUSES } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export default function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/orders/${id}`);
        if (!res.ok) throw new Error("Non trouvé");
        const data = await res.json();
        setOrder(data);
        setStatus(data.status);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  async function updateStatus() {
    setSaving(true);
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const res = await fetch(`/api/admin/orders/${id}`);
      setOrder(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-admin-primary-500" size={32} /></div>;
  if (!order) return <div className="text-center p-12 text-red-500">Commande introuvable.</div>;

  const currentStatusConf = ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG];

  return (
    <div className="space-y-6 pb-12">
      <Link href="/admin/commandes" className="text-admin-text-muted hover:text-admin-primary-500 flex items-center gap-2 text-sm w-fit font-medium">
        <ArrowLeft size={16} />
        Retour aux commandes
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-admin-border pb-4">
        <div>
          <h1 className="text-2xl font-bold">Commande</h1>
          <p className="text-sm text-admin-text-muted font-mono mt-1">{order.id}</p>
        </div>
        <div 
          className="text-sm px-3 py-1 rounded-full border bg-white font-bold w-fit shadow-sm"
          style={{ color: currentStatusConf.color, borderColor: `${currentStatusConf.color}40` }}
        >
          {currentStatusConf.label}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Update Status */}
        <div className="bg-admin-surface border border-admin-border rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-admin-primary-600">Mettre à jour le statut</h2>
          <div className="flex gap-3">
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="flex-1 bg-white border border-admin-border rounded-lg p-3 focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500"
            >
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{ORDER_STATUS_CONFIG[s].label}</option>)}
            </select>
            <button
              onClick={updateStatus}
              disabled={saving || status === order.status}
              className="bg-admin-primary-500 text-white hover:bg-admin-primary-600 transition duration-300 px-4 rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span className="hidden md:inline">Enregistrer</span>
            </button>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-admin-surface border border-admin-border rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-admin-primary-600">Client & Livraison</h2>
          <div className="text-sm space-y-2 font-medium">
            <p><span className="text-admin-text-muted">Email :</span> {order.customerEmail}</p>
            {order.customerName && <p><span className="text-admin-text-muted">Nom :</span> {order.customerName}</p>}
            
            <div className="flex gap-2 mt-4 pt-4 border-t border-admin-border">
              <MapPin size={18} className="text-admin-accent-500 shrink-0 mt-0.5" />
              <div>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.postalCode} {order.shippingAddress?.city}</p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-admin-surface border border-admin-border rounded-2xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-admin-primary-600 mb-4">Articles ({order.items.length})</h2>
        <div className="divide-y divide-admin-border">
          {order.items.map((item: any, i: number) => (
            <div key={i} className="py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="w-12 h-12 rounded object-cover border border-admin-border" />
                ) : (
                  <div className="w-12 h-12 rounded border border-admin-border bg-neutral-100 flex items-center justify-center text-xs text-admin-text-muted">Img</div>
                )}
                <div>
                  <p className="font-bold text-admin-text">{item.name}</p>
                  <p className="text-sm text-admin-text-muted font-medium">Qté: {item.quantity}</p>
                </div>
              </div>
              <div className="font-bold">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-admin-border">
          <span className="text-lg font-bold">Total payé</span>
          <span className="text-2xl font-black text-admin-primary-600">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
