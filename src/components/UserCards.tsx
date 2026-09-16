import React from "react";
import {
  Crown,
  Medal,
  Shield,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  User as UserIcon
} from "lucide-react";
import { User } from "../types";
import UserFlag from "./UserFlag";

interface UserCardsProps {
  users: (User & {
    totalPoints: number;
    weekPoints?: number;
    exacts?: number;
    results?: number;
  })[];
  onUserClick?: (user: User) => void;
}

const getRankMeta = (index: number) => {
  if (index === 0) {
    return {
      title: "Lider",
      note: "Zirvede",
      icon: <Crown className="h-3.5 w-3.5" />,
      medalIcon: <Trophy className="h-16 w-16" />,
      cardClass:
        "border-amber-200/80 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 text-[#0F172A] shadow-[0_4px_20px_rgba(217,119,6,0.06)] ring-1 ring-amber-400/30",
      badgeClass: "border-amber-300 bg-amber-100/90 text-amber-900",
      numberClass: "bg-amber-500 text-white ring-2 ring-white shadow-xs",
      glowClass: "bg-amber-100/30",
      nameClass: "text-[#0F172A]"
    };
  }

  if (index === 1) {
    return {
      title: "Takipçi",
      note: "Nefesi ensede",
      icon: <Medal className="h-3.5 w-3.5" />,
      medalIcon: <Medal className="h-14 w-14" />,
      cardClass:
        "border-[#E2E8F0] bg-white shadow-xs hover:border-slate-300",
      badgeClass: "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
      numberClass: "bg-slate-600 text-white ring-2 ring-white shadow-xs",
      glowClass: "bg-[#F8FAFC]",
      nameClass: "text-[#0F172A]"
    };
  }

  if (index === 2) {
    return {
      title: "Podyum",
      note: "Oyunun içinde",
      icon: <Medal className="h-3.5 w-3.5" />,
      medalIcon: <Medal className="h-14 w-14" />,
      cardClass:
        "border-[#E2E8F0] bg-white shadow-xs hover:border-amber-300",
      badgeClass: "border-amber-200 bg-amber-50 text-amber-800",
      numberClass: "bg-amber-700 text-white ring-2 ring-white shadow-xs",
      glowClass: "bg-[#F8FAFC]",
      nameClass: "text-[#0F172A]"
    };
  }

  return {
    title: `${index + 1}. Sıra`,
    note: "Yarışta",
    icon: <UserIcon className="h-3.5 w-3.5" />,
    medalIcon: null,
    cardClass:
      "border-[#E2E8F0] bg-white shadow-xs hover:border-slate-300",
    badgeClass: "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]",
    numberClass: "bg-[#F8FAFC] text-[#475569] ring-1 ring-[#E2E8F0]",
    glowClass: "bg-[#F8FAFC]",
    nameClass: "text-[#0F172A]"
  };
};

const nameSizeClass = (name: string) => {
  if (name.length > 18) return "text-base";
  if (name.length > 14) return "text-lg";
  return "text-xl";
};

const UserCards: React.FC<UserCardsProps> = ({ users, onUserClick }) => {
  if (!users.length) {
    return (
      <div className="card-base p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#FAF8F5] text-[#6B6760] ring-1 ring-[#EAE6DF]">
          <Trophy className="h-7 w-7 text-[#D96B43]" />
        </div>

        <h3 className="text-lg font-bold text-[#1A1A1A]">
          Henüz yazar yok
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-6 text-[#6B6760]">
          Liderlik tablosu için önce yönetim panelinden yazar eklenmeli.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {users.map((user, index) => {
        const rank = getRankMeta(index);
        const exacts = user.exacts ?? 0;
        const results = user.results ?? 0;
        const totalHits = exacts + results;
        const weekPoints = user.weekPoints ?? 0;
        const isLeader = index === 0;

        return (
          <button
            key={user.id}
            type="button"
            onClick={() => onUserClick?.(user)}
            title={user.name}
            className={`group relative min-h-[238px] overflow-hidden rounded-[1.5rem] border p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#D96B43]/40 hover:shadow-md active:translate-y-0 ${rank.cardClass} ${
              isLeader ? "sm:col-span-2 xl:col-span-2 xl:row-span-1" : ""
            }`}
          >
            {user.colors && user.colors.length > 0 && (
              <div
                className="absolute left-0 top-0 h-1.5 w-full"
                style={{
                  background:
                    user.colors.length > 1
                      ? `linear-gradient(to right, ${user.colors.join(", ")})`
                      : user.colors[0]
                }}
              />
            )}

            {index === 0 && (
              <div
                className={`absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl transition duration-300 group-hover:scale-125 ${rank.glowClass}`}
              />
            )}

            {rank.medalIcon && (
              <div className="absolute right-5 top-5 text-[#D96B43] opacity-[0.12]">
                {rank.medalIcon}
              </div>
            )}

            <div className="relative flex h-full flex-col justify-between gap-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3.5">
                  <div
                    className={`relative flex shrink-0 items-center justify-center rounded-2xl shadow-xs ring-1 ${
                      isLeader ? "bg-white ring-amber-200" : "bg-[#F8FAFC] ring-[#E2E8F0]"
                    } ${
                      isLeader ? "h-16 w-16" : "h-14 w-14"
                    }`}
                  >
                    <UserFlag
                      flagEmoji={user.flagEmoji}
                      className={isLeader ? "h-10 w-10 text-3xl" : "h-8 w-8 text-2xl"}
                    />

                    <div
                      className={`absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${rank.numberClass}`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3
                      className={`truncate tracking-tight font-bold ${nameSizeClass(user.name)} ${rank.nameClass} ${
                        isLeader ? "sm:text-2xl font-serif" : ""
                      }`}
                    >
                      {user.name}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${rank.badgeClass}`}
                      >
                        {rank.icon}
                        {rank.title}
                      </span>

                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide ${isLeader ? "border-amber-200 bg-white text-amber-900" : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"}`}>
                        {rank.note}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3.5 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#64748B]">
                      Toplam Puan
                    </div>

                    <div
                      className={`stat-number font-mono mt-0.5 font-black leading-none ${isLeader ? "text-[#1E3A8A]" : "text-[#0F172A]"} ${
                        isLeader ? "text-5xl" : "text-4xl"
                      }`}
                    >
                      {user.totalPoints}
                    </div>
                  </div>

                  {weekPoints > 0 ? (
                    <div className="inline-flex items-center gap-1 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1.5 text-xs font-bold text-[#047857]">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +{weekPoints}
                    </div>
                  ) : (
                    <div className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-medium ${isLeader ? "border-amber-200 bg-white text-[#64748B]" : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"}`}>
                      <Shield className="h-3.5 w-3.5" />
                      Stabil
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className={`rounded-xl border p-2.5 ${isLeader ? "border-amber-200/90 bg-white/80" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}>
                    <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#64748B]">
                      <Target className="h-3 w-3 text-[#1E3A8A]" />
                      Tam
                    </div>

                    <div className="mt-0.5 font-mono text-lg font-black text-[#0F172A]">
                      {exacts}
                    </div>
                  </div>

                  <div className={`rounded-xl border p-2.5 ${isLeader ? "border-amber-200/90 bg-white/80" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}>
                    <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#64748B]">
                      <Sparkles className="h-3 w-3 text-[#059669]" />
                      Sonuç
                    </div>

                    <div className="mt-0.5 font-mono text-lg font-black text-[#0F172A]">
                      {results}
                    </div>
                  </div>

                  <div className={`rounded-xl border p-2.5 ${isLeader ? "border-amber-200/90 bg-white/80" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}>
                    <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#64748B]">
                      <Trophy className="h-3 w-3 text-[#D97706]" />
                      İsabet
                    </div>

                    <div className="mt-0.5 font-mono text-lg font-black text-[#0F172A]">
                      {totalHits}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default UserCards;
