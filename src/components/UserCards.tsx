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
      note: "Taht onda",
      icon: <Crown className="h-4 w-4" />,
      medalIcon: <Trophy className="h-16 w-16" />,
      cardClass:
        "border-amber-200 bg-gradient-to-br from-amber-500/[0.07] via-amber-50/[0.02] to-white shadow-[0_15px_45px_rgba(245,158,11,0.06)]",
      badgeClass: "border-amber-200 bg-amber-50 text-amber-800",
      numberClass: "bg-amber-500 text-white",
      glowClass: "bg-amber-200/30",
      nameClass: "text-slate-800"
    };
  }

  if (index === 1) {
    return {
      title: "Takipçi",
      note: "Nefesi ensede",
      icon: <Medal className="h-4 w-4" />,
      medalIcon: <Medal className="h-14 w-14" />,
      cardClass:
        "border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.03)]",
      badgeClass: "border-slate-200 bg-slate-100 text-slate-700",
      numberClass: "bg-slate-400 text-white",
      glowClass: "bg-slate-100/35",
      nameClass: "text-slate-800"
    };
  }

  if (index === 2) {
    return {
      title: "Podyum",
      note: "Oyunun içinde",
      icon: <Medal className="h-4 w-4" />,
      medalIcon: <Medal className="h-14 w-14" />,
      cardClass:
        "border-orange-200 bg-white shadow-[0_10px_35px_rgba(234,88,12,0.03)]",
      badgeClass: "border-orange-200 bg-orange-50 text-orange-800",
      numberClass: "bg-orange-600 text-white",
      glowClass: "bg-orange-100/25",
      nameClass: "text-slate-800"
    };
  }

  return {
    title: `${index + 1}. Sıra`,
    note: "Yarışta",
    icon: <UserIcon className="h-4 w-4" />,
    medalIcon: null,
    cardClass:
      "border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.02)]",
    badgeClass: "border-slate-100 bg-slate-50 text-slate-500",
    numberClass: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    glowClass: "bg-orange-50/15",
    nameClass: "text-slate-800"
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
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
          <Trophy className="h-7 w-7" />
        </div>

        <h3 className="text-lg font-black text-slate-800">
          Henüz yazar yok
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-500">
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
            className={`group relative min-h-[228px] overflow-hidden rounded-[1.75rem] border p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_20px_50px_rgba(15,23,42,0.06)] active:translate-y-0 ${rank.cardClass} ${
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
              <div className="absolute right-5 top-5 text-amber-500 opacity-[0.15]">
                {rank.medalIcon}
              </div>
            )}

            <div className="relative flex h-full flex-col justify-between gap-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`relative flex shrink-0 items-center justify-center rounded-[1.25rem] bg-slate-50 shadow-sm ring-1 ring-slate-200 ${
                      isLeader ? "h-18 w-18" : "h-15 w-15"
                    }`}
                  >
                    <UserFlag
                      flagEmoji={user.flagEmoji}
                      className={isLeader ? "h-12 w-12 text-4xl" : "h-10 w-10 text-3xl"}
                    />

                    <div
                      className={`absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black shadow-sm ring-4 ring-white ${rank.numberClass}`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3
                      className={`font-display truncate tracking-[-0.01em] font-black ${nameSizeClass(user.name)} ${rank.nameClass} ${
                        isLeader ? "sm:text-2xl" : ""
                      }`}
                    >
                      {user.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${rank.badgeClass}`}
                      >
                        {rank.icon}
                        {rank.title}
                      </span>

                      <span className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        {rank.note}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                      Toplam Puan
                    </div>

                    <div
                      className={`stat-number mt-1 font-black leading-none text-slate-800 ${
                        isLeader ? "text-6xl" : "text-5xl"
                      }`}
                    >
                      {user.totalPoints}
                    </div>
                  </div>

                  {weekPoints > 0 ? (
                    <div className="inline-flex items-center gap-1.5 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-black text-orange-700">
                      <TrendingUp className="h-4 w-4" />
                      +{weekPoints}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-500">
                      <Shield className="h-4 w-4" />
                      Stabil
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
                      <Target className="h-3.5 w-3.5 text-orange-600" />
                      Tam
                    </div>

                    <div className="mt-1 text-xl font-black text-slate-800">
                      {exacts}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
                      <Sparkles className="h-3.5 w-3.5 text-orange-600" />
                      Sonuç
                    </div>

                    <div className="mt-1 text-xl font-black text-slate-800">
                      {results}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
                      <Trophy className="h-3.5 w-3.5 text-orange-600" />
                      İsabet
                    </div>

                    <div className="mt-1 text-xl font-black text-slate-800">
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
