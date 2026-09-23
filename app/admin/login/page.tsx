"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de connexion");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Uses BB-07 light theme values
  return (
    <div className="min-h-screen bg-admin-bg flex flex-col items-center justify-center p-4 font-sans text-admin-text">
      <div className="w-full max-w-md bg-admin-surface border border-admin-border rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-admin-primary-500 mb-2">Black Bazaar</h1>
          <p className="text-admin-text-muted">Espace Administration</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-admin-text">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-admin-text-muted">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-admin-border rounded-lg py-3 pl-10 pr-4 text-admin-text focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500 transition-shadow"
                placeholder="admin@jabba.local"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-admin-text">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-admin-text-muted">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-admin-border rounded-lg py-3 pl-10 pr-4 text-admin-text focus:outline-none focus:border-admin-primary-500 focus:ring-1 focus:ring-admin-primary-500 transition-shadow"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-admin-primary-500 hover:bg-admin-primary-600 text-white font-bold rounded-lg px-4 py-3 transition duration-300 flex justify-center items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
