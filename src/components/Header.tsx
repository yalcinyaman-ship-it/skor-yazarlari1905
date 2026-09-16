import React from "react";
import { RotateCw, Settings, ShieldCheck, Target } from "lucide-react";

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
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Galatasaray_Sports_Club_Logo.svg"
  },
  {
    id: "bjk",
    name: "Beşiktaş",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Logo_of_Be%C5%9Fikta%C5%9F_JK.svg"
  },
  {
    id: "fb",
    name: "Fenerbahçe",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Fenerbah%C3%A7e_Spor_Kul%C3%BCb%C3%BC_%28logo%2C_1923%29.svg"
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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-stone-200/80 bg-[#FCFBF9]/95 px-4 py-2.5 sm:py-3 text-[#111827] shadow-[0_1px_4px_rgba(0,0,0,0.03)] backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 sm:gap-4">
        {/* Sol Alan: Ferahlatılmış Dengeleme Alanı */}
        <div className="hidden w-20 sm:block sm:w-36" aria-hidden="true" />

        {/* Orta Alan: Centered Editorial Masthead */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {/* Üç Büyüklerin Armaları Kaidesi (36x36px, aralarında ince bölücüler) */}
          <div className="mb-1.5 flex items-center justify-center gap-3.5 sm:gap-4 rounded-full border border-stone-200/70 bg-stone-100/60 px-4 py-1 shadow-xs backdrop-blur-xs">
            {BIG_THREE_CLUBS.map((club, idx) => (
              <React.Fragment key={club.id}>
                {idx > 0 && <div className="h-4 w-px bg-stone-300/70" />}
                <div
                  className="flex h-9 w-9 items-center justify-center transition-transform duration-200 hover:scale-110"
                  title={club.name}
                >
                  <img
                    src={club.logo}
                    alt={club.name}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 sm:h-9 sm:w-9 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
                    loading="eager"
                  />
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Mikro Sezon Etiketi */}
          <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-stone-500">
            {activeSeasonName || "2026–2027 SÜPER LİG"}
          </div>

          {/* Editoryal Gazete/Dergi Künyesi Ağırlığında Başlık */}
          <h1 className="mt-0.5 font-serif text-2xl sm:text-[28px] font-bold tracking-tight text-[#111827] leading-tight">
            Skor Yazarları
          </h1>

          {/* İtalik Manifest Slogan (Tırnaksız, Sıcak Antrasit Gri #4B5563) */}
          <p className="mt-1 max-w-xl italic text-sm text-[#4B5563] tracking-normal leading-normal text-center">
            Farklı renklerin dostça mücadelesini birlikte yaşayalım
          </p>
        </div>

        {/* Sağ Alan: Yarı Şeffaf, Dengeli İkon Butonlar */}
        <div className="flex w-auto sm:w-36 items-center justify-end gap-1.5 sm:gap-2">
          {hasActiveWeek && (
            <button
              type="button"
              onClick={onPredictionClick}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-stone-200/70 bg-white/80 px-3 text-xs font-semibold text-[#111827] shadow-xs backdrop-blur-xs transition-all duration-150 hover:bg-white hover:border-stone-300 active:scale-[0.98]"
              title="Haftalık Tahminlerini Yap"
            >
              <Target className="h-3.5 w-3.5 stroke-[1.5] text-[#D9532F]" />
              <span className="hidden md:inline">Tahmin</span>
            </button>
          )}

          {onAdminClick && (
            <button
              type="button"
              onClick={onAdminClick}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200/70 bg-white/80 text-stone-600 shadow-xs backdrop-blur-xs transition-all duration-150 hover:bg-white hover:text-[#111827] hover:border-stone-300 active:scale-[0.98]"
              title="Yönetim ve Ayarlar"
            >
              <Settings className="h-3.5 w-3.5 stroke-[1.5]" />
            </button>
          )}

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200/70 bg-white/80 text-stone-500 shadow-xs backdrop-blur-xs transition-all duration-150 hover:bg-white hover:text-[#111827] hover:border-stone-300 active:scale-[0.98]"
            title="Verileri ve Sayfayı Yenile"
            id="refresh-header-btn"
          >
            <RotateCw className="h-3.5 w-3.5 stroke-[1.5]" />
          </button>

          <div
            className="hidden h-8 w-8 items-center justify-center rounded-full border border-stone-200/70 bg-white/80 text-stone-500 shadow-xs backdrop-blur-xs lg:flex"
            title="VIP Skor Ligi Masası"
          >
            <ShieldCheck className="h-3.5 w-3.5 stroke-[1.5] text-stone-600" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
