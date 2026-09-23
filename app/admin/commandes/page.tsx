"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShoppingBag, Eye } from "lucide-react";
import { ORDER_STATUS_CONFIG, ORDER_STATUSES } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = filter === "ALL" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Commandes</h1>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white border border-admin-border text-admin-text rounded-lg p-2 md:p-3 focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500 shadow-sm"
        >
          <option value="ALL">Toutes les commandes</option>
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>{ORDER_STATUS_CONFIG[s].label}</option>
          ))}
        </select>
      </header>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-admin-primary-500" size={32} />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center p-12 bg-admin-surface border border-admin-border rounded-xl">
          <ShoppingBag size={48} className="mx-auto text-admin-text-muted mb-4" />
          <p className="text-admin-text-muted">Aucune commande trouvée.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredOrders.map((order) => {
            const statusConf = ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG];
            
            return (
              <div key={order.id} className="bg-admin-surface border border-admin-border rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-admin-text">{order.customerEmail}</span>
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full border font-bold bg-white"
                      style={{ color: statusConf.color, borderColor: `${statusConf.color}40` }}
                    >
                      {statusConf.label}
                    </span>
                  </div>
                  <div className="text-sm text-admin-text-muted font-medium">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
                    })} • {order.items.length} article(s)
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-admin-border">
                  <span className="font-bold text-lg text-admin-text">{formatPrice(order.total)}</span>
                  <Link 
                    href={`/admin/commandes/${order.id}`}
                    className="p-2 bg-neutral-100 hover:bg-admin-primary-500 hover:text-white text-admin-text rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Eye size={18} />
                    <span className="text-sm font-medium md:hidden">Détails</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
