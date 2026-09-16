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
        "border-[#D96B43]/30 bg-gradient-to-br from-[#FFF8F5] via-[#FFF3EE] to-[#FDF0EB] text-[#1A1A1A] shadow-sm",
      badgeClass: "border-[#F3DCD2] bg-[#FDF4F0] text-[#D96B43]",
      numberClass: "bg-[#D96B43] text-white",
      glowClass: "bg-[#D96B43]/10",
      nameClass: "text-[#1A1A1A]"
    };
  }

  if (index === 1) {
    return {
      title: "Takipçi",
      note: "Nefesi ensede",
      icon: <Medal className="h-4 w-4" />,
      medalIcon: <Medal className="h-14 w-14" />,
      cardClass:
        "border-[#EAE6DF] bg-white shadow-sm",
      badgeClass: "border-[#EAE6DF] bg-[#FAF8F5] text-[#6B6760]",
      numberClass: "bg-[#6B6760] text-white",
      glowClass: "bg-[#FAF8F5]",
      nameClass: "text-[#1A1A1A]"
    };
  }

  if (index === 2) {
    return {
      title: "Podyum",
      note: "Oyunun içinde",
      icon: <Medal className="h-4 w-4" />,
      medalIcon: <Medal className="h-14 w-14" />,
      cardClass:
        "border-[#EAE6DF] bg-white shadow-sm",
      badgeClass: "border-[#F3DCD2] bg-[#FDF4F0] text-[#D96B43]",
      numberClass: "bg-[#D96B43] text-white",
      glowClass: "bg-[#FAF8F5]",
      nameClass: "text-[#1A1A1A]"
    };
  }

  return {
    title: `${index + 1}. Sıra`,
    note: "Yarışta",
    icon: <UserIcon className="h-4 w-4" />,
    medalIcon: null,
    cardClass:
      "border-[#EAE6DF] bg-white shadow-sm",
    badgeClass: "border-[#EAE6DF] bg-[#FAF8F5] text-[#6B6760]",
    numberClass: "bg-[#FAF8F5] text-[#6B6760] ring-1 ring-[#EAE6DF]",
    glowClass: "bg-[#FAF8F5]",
    nameClass: "text-[#1A1A1A]"
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

            <div className="relative flex h-full flex-col justify-between gap-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`relative flex shrink-0 items-center justify-center rounded-[1.15rem] shadow-sm ring-1 ${
                      isLeader ? "bg-white ring-[#F3DCD2]" : "bg-[#FAF8F5] ring-[#EAE6DF]"
                    } ${
                      isLeader ? "h-18 w-18" : "h-15 w-15"
                    }`}
                  >
                    <UserFlag
                      flagEmoji={user.flagEmoji}
                      className={isLeader ? "h-12 w-12 text-4xl" : "h-10 w-10 text-3xl"}
                    />

                    <div
                      className={`absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-sm ring-2 ring-white ${rank.numberClass}`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3
                      className={`font-display truncate tracking-[-0.01em] font-bold ${nameSizeClass(user.name)} ${rank.nameClass} ${
                        isLeader ? "sm:text-2xl" : ""
                      }`}
                    >
                      {user.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${rank.badgeClass}`}
                      >
                        {rank.icon}
                        {rank.title}
                      </span>

                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isLeader ? "border-[#F3DCD2] bg-white text-[#D96B43]" : "border-[#EAE6DF] bg-[#FAF8F5] text-[#6B6760]"}`}>
                        {rank.note}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6B6760]">
                      Toplam Puan
                    </div>

                    <div
                      className={`stat-number mt-1 font-black leading-none ${isLeader ? "text-[#D96B43]" : "text-[#1A1A1A]"} ${
                        isLeader ? "text-6xl" : "text-5xl"
                      }`}
                    >
                      {user.totalPoints}
                    </div>
                  </div>

                  {weekPoints > 0 ? (
                    <div className="inline-flex items-center gap-1.5 rounded-2xl border border-[#F3DCD2] bg-[#FDF4F0] px-3 py-2 text-xs font-bold text-[#D96B43]">
                      <TrendingUp className="h-4 w-4" />
                      +{weekPoints}
                    </div>
                  ) : (
                    <div className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold ${isLeader ? "border-[#F3DCD2] bg-white text-[#6B6760]" : "border-[#EAE6DF] bg-[#FAF8F5] text-[#6B6760]"}`}>
                      <Shield className="h-4 w-4" />
                      Stabil
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className={`rounded-xl border p-3 ${isLeader ? "border-[#F3DCD2] bg-white" : "border-[#EAE6DF] bg-[#FAF8F5]"}`}>
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#6B6760]">
                      <Target className="h-3.5 w-3.5 text-[#D96B43]" />
                      Tam
                    </div>

                    <div className="mt-1 text-xl font-black text-[#1A1A1A]">
                      {exacts}
                    </div>
                  </div>

                  <div className={`rounded-xl border p-3 ${isLeader ? "border-[#F3DCD2] bg-white" : "border-[#EAE6DF] bg-[#FAF8F5]"}`}>
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#6B6760]">
                      <Sparkles className="h-3.5 w-3.5 text-[#D96B43]" />
                      Sonuç
                    </div>

                    <div className="mt-1 text-xl font-black text-[#1A1A1A]">
                      {results}
                    </div>
                  </div>

                  <div className={`rounded-xl border p-3 ${isLeader ? "border-[#F3DCD2] bg-white" : "border-[#EAE6DF] bg-[#FAF8F5]"}`}>
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#6B6760]">
                      <Trophy className="h-3.5 w-3.5 text-[#D96B43]" />
                      İsabet
                    </div>

                    <div className="mt-1 text-xl font-black text-[#1A1A1A]">
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
