import React, { useState } from "react";
import { X, Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";
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
          ? "Şifre hatalı."
          : "Giriş şu anda tamamlanamadı. Lütfen tekrar dene."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-[#EAE6DF] bg-white p-7 text-[#1A1A1A] shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#D96B43]/10 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-[#EAE6DF] bg-[#FAF8F5] p-2 text-[#6B6760] transition hover:bg-[#EAE6DF] hover:text-[#1A1A1A]"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative mb-7">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F3DCD2] bg-[#FDF4F0] text-[#D96B43] shadow-sm">
            <Lock className="h-7 w-7" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
            Admin girişi
          </h2>

          <p className="mt-1 text-sm font-semibold leading-relaxed text-[#6B6760]">
            Yönetim paneline girmek için admin şifresini yaz.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-[#6B6760]">
              Şifre
            </label>

            <input
              type="password"
              required
              autoFocus
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full !border-[#EAE6DF] !bg-[#FAF8F5] !text-[#1A1A1A] placeholder:!text-[#6B6760]/60 focus:!border-[#D96B43] disabled:opacity-50"
              placeholder="Admin şifresi"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center text-white disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <LogIn className="h-5 w-5 text-white" />
            )}
            {loading ? "Doğrulanıyor..." : "Giriş yap"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
