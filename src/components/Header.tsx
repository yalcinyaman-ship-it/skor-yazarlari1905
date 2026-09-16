import React from "react";
import { RotateCw, ShieldCheck, Target, Trophy } from "lucide-react";

interface HeaderProps {
  onAdminClick?: () => void;
  onPredictionClick: () => void;
  activeSeasonName?: string;
  isAdmin: boolean;
  hasActiveWeek: boolean;
}

const BIG_THREE_CLUBS = [
  {
    id: "gs",
    name: "Galatasaray",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Galatasaray_Sports_Club_Logo.svg",
    color: "#A90432"
  },
  {
    id: "bjk",
    name: "Beşiktaş",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Logo_of_Be%C5%9Fikta%C5%9F_JK.svg",
    color: "#FFFFFF"
  },
  {
    id: "fb",
    name: "Fenerbahçe",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Fenerbah%C3%A7e_Spor_Kul%C3%BCb%C3%BC_%28logo%2C_1923%29.svg",
    color: "#002D72"
  }
];

const Header: React.FC<HeaderProps> = ({
  onAdminClick,
  onPredictionClick,
  activeSeasonName,
  isAdmin,
  hasActiveWeek
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 px-4 py-2.5 sm:py-3.5 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:px-6 relative overflow-hidden">
      {/* Üst Stadyum Işığı & Şampiyonluk Çizgisi */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_120%_at_50%_-20%,rgba(59,130,246,0.18),transparent_70%)]" />
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-blue-600 via-emerald-500 to-amber-500 opacity-80" />

      <div className="relative mx-auto flex max-w-[1440px] items-center justify-between gap-3 sm:gap-4">
        {/* Sol Alan: Metalik Rozet & Canlı Sezon Sinyali */}
        <div className="hidden w-28 sm:flex sm:w-44 items-center justify-start">
          <div className="group inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-200 shadow-inner backdrop-blur-md transition-all hover:border-slate-500">
            <div className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </div>
            <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate tracking-widest text-slate-200">Süper Lig Masası</span>
          </div>
        </div>

        {/* Orta Alan: Centered Broadcast Sports Masthead */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {/* Üç Büyüklerin Armaları: Koyu Cam Dairesel Çerçeveler */}
          <div className="mb-1.5 flex items-center justify-center gap-2.5 sm:gap-3 rounded-full border border-slate-700/60 bg-slate-900/90 px-3.5 py-1 shadow-[inset_0_1px_4px_rgba(255,255,255,0.05),0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all hover:border-slate-500">
            {BIG_THREE_CLUBS.map((club, idx) => (
              <React.Fragment key={club.id}>
                {idx > 0 && <div className="h-3.5 w-px bg-slate-700/70" />}
                <div
                  className="group/club relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-slate-950/80 p-1 border border-slate-800 transition-all duration-300 hover:scale-115 hover:border-slate-500 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                  title={club.name}
                >
                  <img
                    src={club.logo}
                    alt={club.name}
                    referrerPolicy="no-referrer"
                    className="h-5 w-5 sm:h-6 sm:w-6 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                    loading="eager"
                  />
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Mikro Sezon Etiketi */}
          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.26em] text-amber-400/90 drop-shadow-xs">
            <span className="h-px w-3 bg-gradient-to-r from-transparent to-amber-400/60" />
            <span className="font-sports">{activeSeasonName || "2026–2027 SÜPER LİG"}</span>
            <span className="h-px w-3 bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>

          {/* Editoryal Başlık */}
          <h1 className="mt-0.5 font-sports text-2xl sm:text-[30px] font-black uppercase tracking-wider text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Skor Yazarları
          </h1>

          {/* İtalik Slogan */}
          <p className="mt-0.5 max-w-xl text-xs sm:text-[13px] text-slate-300 tracking-normal leading-normal text-center font-medium">
            Farklı renklerin dostça mücadelesini birlikte yaşayalım
          </p>
        </div>

        {/* Sağ Alan: Enerjik CTA Buton & Koyu Cam Kontroller */}
        <div className="flex w-auto sm:w-44 items-center justify-end gap-1.5 sm:gap-2">
          {hasActiveWeek && (
            <button
              type="button"
              onClick={onPredictionClick}
              className="inline-flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-full border border-emerald-400/50 bg-gradient-to-r from-emerald-500 to-teal-600 px-3 sm:px-4 text-xs font-bold text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all duration-200 hover:from-emerald-400 hover:to-teal-500 hover:shadow-[0_0_22px_rgba(16,185,129,0.55)] active:scale-[0.98]"
              title="Haftalık Tahminlerini Yap"
              id="header-cta-prediction-btn"
            >
              <Target className="h-3.5 w-3.5 stroke-[2.5] text-slate-950" />
              <span className="font-extrabold uppercase tracking-wide">Tahmin</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/70 text-slate-300 shadow-sm backdrop-blur-md transition-all duration-150 hover:bg-slate-800 hover:text-white hover:border-slate-500 active:scale-[0.96]"
            title="Verileri ve Sayfayı Yenile"
            id="refresh-header-btn"
          >
            <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[1.75]" />
          </button>

          {onAdminClick && (
            <button
              type="button"
              onClick={onAdminClick}
              className={`hidden sm:inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border shadow-sm backdrop-blur-md transition-all duration-150 active:scale-[0.96] ${
                isAdmin
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                  : "border-slate-700/60 bg-slate-900/70 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-500"
              }`}
              title={isAdmin ? "Yönetici Paneli (Açık)" : "Yönetici Girişi"}
              id="header-admin-btn"
            >
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[1.75]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
