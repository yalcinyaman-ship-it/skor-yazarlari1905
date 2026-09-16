import React from "react";
import { RotateCw, Settings, ShieldCheck, Target, Trophy } from "lucide-react";

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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#0B0F19]/98 px-4 py-2.5 sm:py-3 text-white shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-6">
      {/* İnce Şampiyonluk & Rekabet Üst Çizgisi */}
      <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-[#1E3A8A] via-[#D97706] to-[#059669] opacity-90" />

      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 sm:gap-4">
        {/* Sol Alan: Dengeleme & Küçük Rozet (Masaüstü) */}
        <div className="hidden w-24 sm:flex sm:w-36 items-center justify-start">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300 backdrop-blur-xs">
            <Trophy className="h-3 w-3 text-amber-400" />
            <span className="truncate">Süper Lig Masası</span>
          </div>
        </div>

        {/* Orta Alan: Centered Sports Editorial Masthead */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {/* Üç Büyüklerin Armaları: Prestijli Koyu Kaide */}
          <div className="mb-1 flex items-center justify-center gap-3 sm:gap-4 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1 shadow-[0_2px_12px_rgba(0,0,0,0.4)] backdrop-blur-xs transition-all hover:border-white/25">
            {BIG_THREE_CLUBS.map((club, idx) => (
              <React.Fragment key={club.id}>
                {idx > 0 && <div className="h-4 w-px bg-white/15" />}
                <div
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center transition-transform duration-200 hover:scale-110"
                  title={club.name}
                >
                  <img
                    src={club.logo}
                    alt={club.name}
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                    loading="eager"
                  />
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Mikro Sezon Etiketi (Championship Season Ribbon) */}
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.24em] text-amber-400">
            <span className="h-px w-3 bg-amber-400/40" />
            <span>{activeSeasonName || "2026–2027 SÜPER LİG"}</span>
            <span className="h-px w-3 bg-amber-400/40" />
          </div>

          {/* Editoryal Başlık */}
          <h1 className="mt-0.5 font-serif text-2xl sm:text-[29px] font-bold tracking-tight text-white leading-tight">
            Skor Yazarları
          </h1>

          {/* İtalik Slogan (Sportif Editoryal Metin) */}
          <p className="mt-0.5 max-w-xl italic text-xs sm:text-[13px] text-slate-300 tracking-normal leading-normal text-center font-serif">
            Farklı renklerin dostça mücadelesini birlikte yaşayalım
          </p>
        </div>

        {/* Sağ Alan: Yarı Şeffaf, Dengeli İkon Butonlar */}
        <div className="flex w-auto sm:w-36 items-center justify-end gap-1.5 sm:gap-2">
          {hasActiveWeek && (
            <button
              type="button"
              onClick={onPredictionClick}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-blue-400/40 bg-gradient-to-r from-[#1E3A8A] to-[#1D4ED8] px-3.5 text-xs font-bold text-white shadow-[0_2px_10px_rgba(30,58,138,0.4)] backdrop-blur-xs transition-all duration-150 hover:from-[#1D4ED8] hover:to-[#2563EB] active:scale-[0.98]"
              title="Haftalık Tahminlerini Yap"
            >
              <Target className="h-3.5 w-3.5 stroke-[2] text-amber-300" />
              <span className="hidden md:inline">Tahmin</span>
            </button>
          )}

          {onAdminClick && (
            <button
              type="button"
              onClick={onAdminClick}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-slate-300 shadow-xs backdrop-blur-xs transition-all duration-150 hover:bg-white/20 hover:text-white hover:border-white/30 active:scale-[0.98]"
              title="Yönetim ve Ayarlar"
            >
              <Settings className="h-3.5 w-3.5 stroke-[1.5]" />
            </button>
          )}

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-slate-300 shadow-xs backdrop-blur-xs transition-all duration-150 hover:bg-white/20 hover:text-white hover:border-white/30 active:scale-[0.98]"
            title="Verileri ve Sayfayı Yenile"
            id="refresh-header-btn"
          >
            <RotateCw className="h-3.5 w-3.5 stroke-[1.5]" />
          </button>

          <div
            className="hidden h-8 w-8 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400 shadow-xs backdrop-blur-xs lg:flex"
            title="VIP Skor Ligi Masası"
          >
            <ShieldCheck className="h-3.5 w-3.5 stroke-[1.75]" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
