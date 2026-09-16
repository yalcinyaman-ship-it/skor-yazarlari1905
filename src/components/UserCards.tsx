import React from "react";
import {
  Award,
  ChevronRight,
  Crown,
  Flame,
  Medal,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  User as UserIcon,
  Zap
} from "lucide-react";
import { User } from "../types";
import UserFlag from "./UserFlag";
import { flagUrlForEmoji } from "../flags";

interface UserCardsProps {
  users: (User & {
    totalPoints: number;
    weekPoints?: number;
    exacts?: number;
    results?: number;
    avgPoints?: number;
  })[];
  onUserClick?: (user: User) => void;
}

const UserCards: React.FC<UserCardsProps> = ({ users, onUserClick }) => {
  if (!users.length) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-xl backdrop-blur-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-800 text-amber-400 border border-slate-700 shadow-inner">
          <Trophy className="h-8 w-8 text-amber-400" />
        </div>

        <h3 className="text-xl font-bold text-white font-sports">
          Henüz Puan Kaydı Bulunmuyor
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm font-medium text-slate-400">
          Liderlik tablosu haftalık maç sonuçları girildikçe otomatik olarak güncellenecektir.
        </p>
      </div>
    );
  }

  const top1 = users[0];
  const top2 = users[1];
  const top3 = users[2];
  const restUsers = users.slice(3);

  return (
    <div className="space-y-8">
      {/* ============================================================ */}
      {/* 1. TOP 3 CHAMPIONSHIP PODIUM (FORMULA 1 & PREMIER LEAGUE)     */}
      {/* ============================================================ */}
      {users.length >= 3 && (
        <section className="relative">
          {/* Subtle Ambient Glow Behind Podium */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-56 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end">
            {/* ---------------- 2. SIRA (GÜMÜŞ / TAKİPÇİ) ---------------- */}
            {top2 && (
              <button
                type="button"
                onClick={() => onUserClick?.(top2)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-400/40 bg-gradient-to-b from-slate-400/15 via-slate-900/85 to-slate-950/95 p-5 sm:p-6 text-left shadow-[0_0_25px_rgba(148,163,184,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_0_35px_rgba(148,163,184,0.22)] cursor-pointer order-2 md:order-1 min-h-[280px]"
              >
                {/* Team Color Top Stripe */}
                {top2.colors && top2.colors.length > 0 && (
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5 w-full"
                    style={{
                      background:
                        top2.colors.length > 1
                          ? `linear-gradient(to right, ${top2.colors.join(", ")})`
                          : top2.colors[0]
                    }}
                  />
                )}

                {/* Silver Background Watermark */}
                <div className="absolute -right-4 -top-4 opacity-[0.06] text-slate-300 pointer-events-none">
                  <Medal className="h-36 w-36" />
                </div>

                {/* Header: Rank Badge & Status */}
                <div className="relative flex items-center justify-between gap-2 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/50 bg-slate-400/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-200 shadow-sm backdrop-blur-md">
                    <Medal className="h-3.5 w-3.5 text-slate-300" />
                    2. Sıra · Gümüş
                  </span>

                  {(top2.weekPoints ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 shadow-xs">
                      <TrendingUp className="h-3 w-3" />
                      +{top2.weekPoints}
                    </span>
                  )}
                </div>

                {/* Center: Avatar & Author Name */}
                <div className="relative my-4 flex flex-col items-center text-center z-10">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-slate-400/60 bg-slate-800/90 p-1.5 shadow-[0_0_20px_rgba(148,163,184,0.3)] ring-2 ring-slate-400/30 transition-transform duration-300 group-hover:scale-105">
                    {top2.clubLogo || flagUrlForEmoji(top2.flagEmoji, 80) ? (
                      <img
                        src={top2.clubLogo || flagUrlForEmoji(top2.flagEmoji, 80)!}
                        alt={top2.name}
                        referrerPolicy="no-referrer"
                        className="h-12 w-12 object-contain drop-shadow-md"
                        loading="lazy"
                      />
                    ) : (
                      <UserFlag flagEmoji={top2.flagEmoji} className="h-12 w-12 text-3xl" />
                    )}

                    <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-400 text-xs font-black text-slate-950 ring-2 ring-slate-900 shadow-md font-mono">
                      2
                    </span>
                  </div>

                  <h3 className="mt-3 font-sports text-lg sm:text-xl font-bold uppercase tracking-tight text-white group-hover:text-slate-200 transition-colors">
                    {top2.name}
                  </h3>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Takipçi
                  </p>

                  <div className="mt-3 font-mono text-3xl sm:text-4xl font-black text-slate-200 tracking-tight tabular-nums">
                    {top2.totalPoints ?? 0}
                    <span className="ml-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
                      Puan
                    </span>
                  </div>
                </div>

                {/* Bottom: Stat Chips */}
                <div className="relative grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-center z-10">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 shadow-inner">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                      Tam
                    </div>
                    <div className="font-mono text-sm font-black text-white tabular-nums">
                      {top2.exacts ?? 0}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 shadow-inner">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-blue-400">
                      Sonuç
                    </div>
                    <div className="font-mono text-sm font-black text-white tabular-nums">
                      {top2.results ?? 0}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 shadow-inner">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      İsabet
                    </div>
                    <div className="font-mono text-sm font-black text-white tabular-nums">
                      {(top2.exacts ?? 0) + (top2.results ?? 0)}
                    </div>
                  </div>
                </div>
              </button>
            )}

            {/* ---------------- 1. SIRA (ALTIN / LİDER / ŞAMPİYON) ---------------- */}
            {top1 && (
              <button
                type="button"
                onClick={() => onUserClick?.(top1)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-400/70 bg-gradient-to-b from-amber-500/20 via-slate-900/90 to-slate-950/95 p-6 sm:p-7 text-left shadow-[0_0_40px_rgba(245,158,11,0.25)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-amber-300 hover:shadow-[0_0_50px_rgba(245,158,11,0.38)] cursor-pointer order-1 md:order-2 md:-translate-y-3 min-h-[320px] ring-1 ring-amber-400/40"
              >
                {/* Team Color Top Stripe */}
                {top1.colors && top1.colors.length > 0 && (
                  <div
                    className="absolute top-0 left-0 right-0 h-2 w-full"
                    style={{
                      background:
                        top1.colors.length > 1
                          ? `linear-gradient(to right, ${top1.colors.join(", ")})`
                          : top1.colors[0]
                    }}
                  />
                )}

                {/* Gold Radial Flare */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-400/20 blur-2xl rounded-full pointer-events-none" />

                {/* Trophy Watermark */}
                <div className="absolute -right-4 -top-4 opacity-[0.08] text-amber-400 pointer-events-none">
                  <Trophy className="h-44 w-44" />
                </div>

                {/* Header: Championship Crown Badge */}
                <div className="relative flex items-center justify-between gap-2 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-500/30 to-amber-600/30 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-md">
                    <Crown className="h-4 w-4 text-amber-300 fill-amber-300 animate-pulse" />
                    1. Sıra · Şampiyonluk Lideri
                  </span>

                  {(top1.weekPoints ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +{top1.weekPoints}
                    </span>
                  )}
                </div>

                {/* Center: Champion Avatar & Big Score */}
                <div className="relative my-4 flex flex-col items-center text-center z-10">
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-amber-400 bg-slate-950 p-2 shadow-[0_0_30px_rgba(245,158,11,0.45)] ring-4 ring-amber-400/30 transition-transform duration-300 group-hover:scale-105">
                    {top1.clubLogo || flagUrlForEmoji(top1.flagEmoji, 80) ? (
                      <img
                        src={top1.clubLogo || flagUrlForEmoji(top1.flagEmoji, 80)!}
                        alt={top1.name}
                        referrerPolicy="no-referrer"
                        className="h-14 w-14 object-contain drop-shadow-lg"
                        loading="lazy"
                      />
                    ) : (
                      <UserFlag flagEmoji={top1.flagEmoji} className="h-14 w-14 text-4xl" />
                    )}

                    <span className="absolute -bottom-2.5 -right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-sm font-black text-slate-950 ring-2 ring-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] font-mono">
                      ★ 1
                    </span>
                  </div>

                  <h3 className="mt-3.5 font-sports text-xl sm:text-2xl font-black uppercase tracking-tight text-white group-hover:text-amber-300 transition-colors">
                    {top1.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
                    <Sparkles className="h-3 w-3" />
                    Zirvede Tek Başına
                  </div>

                  <div className="mt-3 font-mono text-4xl sm:text-5xl font-black text-amber-400 tracking-tight tabular-nums drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    {top1.totalPoints ?? 0}
                    <span className="ml-2 text-xs font-bold uppercase tracking-wider text-amber-300/80 font-sans">
                      Puan
                    </span>
                  </div>
                </div>

                {/* Bottom: Stat Chips */}
                <div className="relative grid grid-cols-3 gap-2.5 border-t border-amber-500/30 pt-3.5 text-center z-10">
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 shadow-inner">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Tam İsabet
                    </div>
                    <div className="font-mono text-base font-black text-white tabular-nums">
                      {top1.exacts ?? 0}
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 shadow-inner">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                      Doğru Sonuç
                    </div>
                    <div className="font-mono text-base font-black text-white tabular-nums">
                      {top1.results ?? 0}
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 shadow-inner">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Toplam İsabet
                    </div>
                    <div className="font-mono text-base font-black text-white tabular-nums">
                      {(top1.exacts ?? 0) + (top1.results ?? 0)}
                    </div>
                  </div>
                </div>
              </button>
            )}

            {/* ---------------- 3. SIRA (BRONZ / PODYUM) ---------------- */}
            {top3 && (
              <button
                type="button"
                onClick={() => onUserClick?.(top3)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-700/40 bg-gradient-to-b from-amber-700/15 via-slate-900/85 to-slate-950/95 p-5 sm:p-6 text-left shadow-[0_0_25px_rgba(180,83,9,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-600 hover:shadow-[0_0_35px_rgba(180,83,9,0.22)] cursor-pointer order-3 md:order-3 min-h-[280px]"
              >
                {/* Team Color Top Stripe */}
                {top3.colors && top3.colors.length > 0 && (
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5 w-full"
                    style={{
                      background:
                        top3.colors.length > 1
                          ? `linear-gradient(to right, ${top3.colors.join(", ")})`
                          : top3.colors[0]
                    }}
                  />
                )}

                {/* Bronze Background Watermark */}
                <div className="absolute -right-4 -top-4 opacity-[0.06] text-amber-600 pointer-events-none">
                  <Award className="h-36 w-36" />
                </div>

                {/* Header: Rank Badge & Status */}
                <div className="relative flex items-center justify-between gap-2 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-700/50 bg-amber-700/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-300 shadow-sm backdrop-blur-md">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    3. Sıra · Bronz
                  </span>

                  {(top3.weekPoints ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 shadow-xs">
                      <TrendingUp className="h-3 w-3" />
                      +{top3.weekPoints}
                    </span>
                  )}
                </div>

                {/* Center: Avatar & Author Name */}
                <div className="relative my-4 flex flex-col items-center text-center z-10">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-amber-700/60 bg-slate-800/90 p-1.5 shadow-[0_0_20px_rgba(180,83,9,0.3)] ring-2 ring-amber-700/30 transition-transform duration-300 group-hover:scale-105">
                    {top3.clubLogo || flagUrlForEmoji(top3.flagEmoji, 80) ? (
                      <img
                        src={top3.clubLogo || flagUrlForEmoji(top3.flagEmoji, 80)!}
                        alt={top3.name}
                        referrerPolicy="no-referrer"
                        className="h-12 w-12 object-contain drop-shadow-md"
                        loading="lazy"
                      />
                    ) : (
                      <UserFlag flagEmoji={top3.flagEmoji} className="h-12 w-12 text-3xl" />
                    )}

                    <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-xs font-black text-white ring-2 ring-slate-900 shadow-md font-mono">
                      3
                    </span>
                  </div>

                  <h3 className="mt-3 font-sports text-lg sm:text-xl font-bold uppercase tracking-tight text-white group-hover:text-amber-200 transition-colors">
                    {top3.name}
                  </h3>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Podyumda
                  </p>

                  <div className="mt-3 font-mono text-3xl sm:text-4xl font-black text-amber-200/90 tracking-tight tabular-nums">
                    {top3.totalPoints ?? 0}
                    <span className="ml-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
                      Puan
                    </span>
                  </div>
                </div>

                {/* Bottom: Stat Chips */}
                <div className="relative grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-center z-10">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 shadow-inner">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                      Tam
                    </div>
                    <div className="font-mono text-sm font-black text-white tabular-nums">
                      {top3.exacts ?? 0}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 shadow-inner">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-blue-400">
                      Sonuç
                    </div>
                    <div className="font-mono text-sm font-black text-white tabular-nums">
                      {top3.results ?? 0}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 shadow-inner">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      İsabet
                    </div>
                    <div className="font-mono text-sm font-black text-white tabular-nums">
                      {(top3.exacts ?? 0) + (top3.results ?? 0)}
                    </div>
                  </div>
                </div>
              </button>
            )}
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 2. FULL STANDINGS TABLE (RACER LANES / YARIŞÇI ŞERİTLERİ)     */}
      {/* ============================================================ */}
      <section className="overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/85 shadow-2xl backdrop-blur-xl">
        {/* Section Header */}
        <div className="relative border-b border-slate-800 bg-slate-950/70 p-5 sm:p-6 text-slate-100">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-3/4 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 shadow-inner">
                <Trophy className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-sports text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
                  Genel Lig Sıralaması
                </h3>
                <p className="text-xs text-slate-400">
                  Tüm yazarların tam skor, doğru sonuç ve toplam puan tablosu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-slate-800 bg-slate-900 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-300">
                {users.length} Yazar
              </span>
            </div>
          </div>
        </div>

        {/* Table Column Headers (Visible on sm screens and up) */}
        <div className="hidden sm:grid grid-cols-[56px_1fr_100px_100px_100px_120px_40px] items-center gap-3 px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span className="text-center font-mono">SIRA</span>
          <span>YAZAR & KULÜP</span>
          <span className="text-center">TAM SKOR</span>
          <span className="text-center">DOĞRU SONUÇ</span>
          <span className="text-center">İSABET</span>
          <span className="text-right font-mono">TOPLAM PUAN</span>
          <span />
        </div>

        {/* Racer Rows Container */}
        <div className="p-3 sm:p-5 space-y-2.5 bg-slate-950/40">
          {users.map((user, index) => {
            const exacts = user.exacts ?? 0;
            const results = user.results ?? 0;
            const totalHits = exacts + results;
            const weekPoints = user.weekPoints ?? 0;
            const isTop1 = index === 0;
            const isTop2 = index === 1;
            const isTop3 = index === 2;

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => onUserClick?.(user)}
                className={`group relative w-full overflow-hidden rounded-2xl border p-3 sm:p-4 text-left backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer ${
                  isTop1
                    ? "border-amber-400/50 bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-slate-900/95 hover:border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                    : isTop2
                      ? "border-slate-400/40 bg-gradient-to-r from-slate-400/10 via-slate-900/85 to-slate-900/95 hover:border-slate-300 shadow-sm"
                      : isTop3
                        ? "border-amber-700/35 bg-gradient-to-r from-amber-700/10 via-slate-900/85 to-slate-900/95 hover:border-amber-600 shadow-sm"
                        : "border-slate-850 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-850/90 shadow-md"
                }`}
              >
                {/* Team Accent Left Stripe */}
                {user.colors && user.colors.length > 0 && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{
                      background:
                        user.colors.length > 1
                          ? `linear-gradient(to bottom, ${user.colors.join(", ")})`
                          : user.colors[0]
                    }}
                  />
                )}

                {/* Desktop Grid Layout */}
                <div className="hidden sm:grid grid-cols-[56px_1fr_100px_100px_100px_120px_40px] items-center gap-3">
                  {/* Rank Column */}
                  <div className="flex items-center justify-center">
                    {isTop1 ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 font-mono text-xs font-black text-slate-950 shadow-md ring-1 ring-amber-300">
                        1
                      </span>
                    ) : isTop2 ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-400 font-mono text-xs font-black text-slate-950 shadow-sm">
                        2
                      </span>
                    ) : isTop3 ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-700 font-mono text-xs font-black text-white shadow-sm">
                        3
                      </span>
                    ) : (
                      <span className="font-mono text-sm font-bold text-slate-400">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Author & Club Column */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/90 p-1 shadow-inner">
                      {user.clubLogo || flagUrlForEmoji(user.flagEmoji, 80) ? (
                        <img
                          src={user.clubLogo || flagUrlForEmoji(user.flagEmoji, 80)!}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="h-7 w-7 object-contain drop-shadow-xs"
                          loading="lazy"
                        />
                      ) : (
                        <UserFlag flagEmoji={user.flagEmoji} className="h-7 w-7 text-xl" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-sports text-sm sm:text-base font-bold uppercase text-white group-hover:text-amber-300 transition-colors">
                          {user.name}
                        </span>

                        {isTop1 && (
                          <span className="rounded-full border border-amber-400/50 bg-amber-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
                            Lider
                          </span>
                        )}

                        {weekPoints > 0 && (
                          <span className="inline-flex items-center gap-0.5 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.2 text-[10px] font-mono font-bold text-emerald-400">
                            +{weekPoints}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tam Skor (Exacts) Column */}
                  <div className="flex justify-center">
                    <span className="inline-flex items-center justify-center min-w-[54px] rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 font-mono text-xs font-black text-emerald-400 shadow-inner">
                      {exacts}
                    </span>
                  </div>

                  {/* Doğru Sonuç (Results) Column */}
                  <div className="flex justify-center">
                    <span className="inline-flex items-center justify-center min-w-[54px] rounded-xl border border-blue-500/30 bg-blue-500/15 px-2.5 py-1 font-mono text-xs font-black text-blue-400 shadow-inner">
                      {results}
                    </span>
                  </div>

                  {/* Toplam İsabet Column */}
                  <div className="flex justify-center">
                    <span className="inline-flex items-center justify-center min-w-[54px] rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1 font-mono text-xs font-black text-slate-300 shadow-inner">
                      {totalHits}
                    </span>
                  </div>

                  {/* Toplam Puan Column */}
                  <div className="text-right">
                    <span
                      className={`font-mono text-xl sm:text-2xl font-black tabular-nums tracking-tight ${
                        isTop1 ? "text-amber-400" : isTop2 ? "text-slate-200" : "text-white"
                      }`}
                    >
                      {user.totalPoints ?? 0}
                    </span>
                  </div>

                  {/* Arrow Action */}
                  <div className="flex justify-end text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Mobile Responsive Layout */}
                <div className="flex flex-col gap-3 sm:hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      {/* Rank Tag */}
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-black ${
                          isTop1
                            ? "bg-amber-500 text-slate-950"
                            : isTop2
                              ? "bg-slate-400 text-slate-950"
                              : isTop3
                                ? "bg-amber-700 text-white"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {index + 1}
                      </span>

                      {/* Avatar */}
                      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-1">
                        {user.clubLogo || flagUrlForEmoji(user.flagEmoji, 80) ? (
                          <img
                            src={user.clubLogo || flagUrlForEmoji(user.flagEmoji, 80)!}
                            alt={user.name}
                            referrerPolicy="no-referrer"
                            className="h-6 w-6 object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <UserFlag flagEmoji={user.flagEmoji} className="h-6 w-6 text-lg" />
                        )}
                      </div>

                      {/* Name */}
                      <div className="min-w-0">
                        <div className="truncate font-sports text-sm font-bold uppercase text-white">
                          {user.name}
                        </div>
                        {isTop1 && (
                          <span className="text-[10px] font-black uppercase text-amber-400">
                            Lider
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Total Points */}
                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono text-xl font-black tabular-nums ${
                          isTop1 ? "text-amber-400" : "text-white"
                        }`}
                      >
                        {user.totalPoints ?? 0}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Puan
                      </div>
                    </div>
                  </div>

                  {/* Mobile Stat Badges Row */}
                  <div className="grid grid-cols-3 gap-1.5 border-t border-slate-800/80 pt-2 text-center text-xs">
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 py-1 px-2">
                      <span className="text-[9px] font-bold uppercase text-emerald-400 mr-1">
                        Tam:
                      </span>
                      <span className="font-mono font-bold text-white">{exacts}</span>
                    </div>

                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 py-1 px-2">
                      <span className="text-[9px] font-bold uppercase text-blue-400 mr-1">
                        Sonuç:
                      </span>
                      <span className="font-mono font-bold text-white">{results}</span>
                    </div>

                    <div className="rounded-lg bg-slate-800/80 border border-slate-700 py-1 px-2">
                      <span className="text-[9px] font-bold uppercase text-slate-400 mr-1">
                        İsabet:
                      </span>
                      <span className="font-mono font-bold text-white">{totalHits}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default UserCards;
