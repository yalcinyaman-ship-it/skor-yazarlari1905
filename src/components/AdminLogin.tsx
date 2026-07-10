import React, { useState } from "react";
import { X, Lock, LogIn, AlertCircle } from "lucide-react";

interface AdminLoginProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ADMIN_PASSWORD = "1905";

const AdminLogin: React.FC<AdminLoginProps> = ({ isVisible, onClose, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setPassword("");
      setError(null);
      onSuccess();
      onClose();
      return;
    }

    setError("Şifre hatalı.");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-7">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Lock className="h-7 w-7" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
              placeholder="Admin şifresi"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center">
            <LogIn className="h-5 w-5" />
            Giriş yap
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;