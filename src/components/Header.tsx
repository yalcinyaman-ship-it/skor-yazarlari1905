import React from "react";
import { Lock, ShieldCheck, Target, Trophy, Unlock, RotateCw } from "lucide-react";

interface HeaderProps {
  onAdminClick: () => void;
  onPredictionClick: () => void;
  activeSeasonName?: string;
  isAdmin: boolean;
  hasActiveWeek: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onAdminClick,
  onPredictionClick,
  activeSeasonName,
  isAdmin,
  hasActiveWeek
}) => {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 px-3 py-3 shadow-[0_4px_20px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:px-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <button
          type="button"
          className="group flex min-w-0 items-center gap-3 text-left"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Sayfanın başına dön"
        >
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-[0_12px_28px_rgba(234,88,12,0.35)] transition duration-200 group-hover:-translate-y-0.5 group-hover:bg-orange-500">
            <Trophy className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display truncate text-lg font-black uppercase tracking-[-0.02em] text-slate-800 sm:text-xl">
                Skor Yazarları
              </h1>

              <span className="hidden items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>

            <p className="hidden truncate text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 sm:block">
              {activeSeasonName || "Tahmin ligi"}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {hasActiveWeek && (
            <button
              type="button"
              onClick={onPredictionClick}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_12px_28px_rgba(234,88,12,0.3)] transition duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-[0_16px_36px_rgba(234,88,12,0.35)] active:translate-y-0 sm:px-5"
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Tahmin Yap</span>
              <span className="sm:hidden">Tahmin</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAdminClick}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-black uppercase tracking-wider transition duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
              isAdmin
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 shadow-sm hover:border-emerald-500/30 hover:bg-emerald-500/15"
                : "border-slate-200 bg-slate-50 text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800"
            }`}
            title={isAdmin ? "Admin panelini aç" : "Admin girişi"}
            id="admin-header-btn"
          >
            {isAdmin ? (
              <>
                <Unlock className="h-4 w-4" />
                <span className="hidden md:inline">Yönetim Açık</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span className="hidden md:inline">Yönetim</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 transition duration-200 hover:-translate-y-0.5 active:translate-y-0"
            title="Verileri ve Sayfayı Yenile"
            id="refresh-header-btn"
          >
            <RotateCw className="h-4 w-4 transition duration-500 hover:rotate-180" />
          </button>

          <div className="hidden h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs font-black uppercase tracking-wider text-slate-500 lg:flex">
            <ShieldCheck className="h-4 w-4 text-orange-600" />
            Özel Lig
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
