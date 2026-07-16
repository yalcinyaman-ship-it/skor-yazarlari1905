import React, { useState } from "react";
import { X, Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

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
      const adminDocRef = doc(db, "settings", "admin");
      const adminDoc = await getDoc(adminDocRef);
      
      let correctPassword = "6171622";
      if (!adminDoc.exists()) {
        // If settings/admin doesn't exist in Firestore, initialize it with the requested 6171622
        await setDoc(adminDocRef, { password: "6171622" });
      } else {
        correctPassword = adminDoc.data()?.password || "6171622";
      }

      if (password === correctPassword) {
        setPassword("");
        setError(null);
        onSuccess();
        onClose();
        return;
      }

      setError("Şifre hatalı.");
    } catch (err: any) {
      console.error("Admin login error:", err);
      setError("Bağlantı hatası: " + (err?.message || "Bilinmeyen bir hata oluştu"));
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-7">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-850 border border-slate-200">
            <Lock className="h-7 w-7" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-850">
            Admin girişi
          </h2>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Yönetim paneline girmek için admin şifresini yaz.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
              Şifre
            </label>

            <input
              type="password"
              required
              autoFocus
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full text-slate-800 bg-white border border-slate-200 focus:border-orange-500 disabled:opacity-50"
              placeholder="Admin şifresi"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
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
