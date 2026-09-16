import React, { useState } from "react";
import { X, Lock, LogIn, AlertCircle, Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const ADMIN_EMAIL = "admin@skoryazarlari.app";

interface AdminLoginProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ isVisible, onClose, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
      setPassword("");
      setError(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Admin login error:", err);
      const code = err?.code as string | undefined;
      setError(
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
          ? "Şifre hatalı. Lütfen yetkili şifrenizi kontrol edin."
          : "Giriş şu anda tamamlanamadı. Lütfen tekrar dene."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Dark Ambient Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Cyber / Stadium Dark Glass Modal */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/95 p-7 text-white shadow-2xl backdrop-blur-2xl ring-1 ring-slate-800">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white cursor-pointer"
          type="button"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative mb-6">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-300 font-mono mb-2">
            <KeyRound className="h-3 w-3 text-emerald-400" />
            Güvenli Yönetim Girişi
          </div>

          <h2 className="font-sports text-2xl font-bold uppercase tracking-tight text-white">
            Admin Paneli
          </h2>

          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400">
            Haftalık maç ve tahmin yönetimi için yetkili admin şifresini girin.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Yönetici Şifresi
            </label>

            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 pl-10 text-sm font-semibold text-white placeholder-slate-500 shadow-inner outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                placeholder="••••••••••••"
              />
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs font-semibold text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/30 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
            ) : (
              <LogIn className="h-4 w-4 text-slate-950" />
            )}
            {loading ? "Doğrulanıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

