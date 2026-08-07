import React from "react";
import { Lock, ShieldCheck, Target, Trophy, Unlock, RotateCw } from "lucide-react";

interface HeaderProps {
  onAdminClick?: () => void;
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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.08] bg-[#0b1210]/95 px-3 py-3 text-white shadow-[0_12px_45px_rgba(5,10,8,0.24)] backdrop-blur-2xl sm:px-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-80" />
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
        <button
          type="button"
          className="group flex min-w-0 items-center gap-3 text-left"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Sayfanın başına dön"
        >
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500 text-white shadow-[0_12px_30px_rgba(240,90,40,0.28)] transition duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-3deg] group-hover:bg-orange-400">
            <Trophy className="h-5 w-5" />
            <span className="live-pulse absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0b1210] bg-emerald-400" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display truncate text-lg font-black uppercase tracking-[-0.025em] text-white sm:text-xl">
                Skor Yazarları
              </h1>

              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>

            <p className="hidden truncate text-[10px] font-black uppercase tracking-[0.24em] text-white/40 sm:block">
              {activeSeasonName || "Tahmin ligi"}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {hasActiveWeek && (
            <button
              type="button"
              onClick={onPredictionClick}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_12px_28px_rgba(240,90,40,0.26)] transition duration-300 hover:-translate-y-0.5 hover:bg-orange-400 active:translate-y-0 sm:px-5"
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Tahmin Yap</span>
              <span className="sm:hidden">Tahmin</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60 hover:border-white/20 hover:bg-white/[0.09] hover:text-white transition duration-300 hover:-translate-y-0.5 active:translate-y-0"
            title="Verileri ve Sayfayı Yenile"
            id="refresh-header-btn"
          >
            <RotateCw className="h-4 w-4 transition duration-500 hover:rotate-180" />
          </button>

          <div className="hidden h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/50 lg:flex">
            <ShieldCheck className="h-4 w-4 text-orange-400" />
            Özel Lig
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
