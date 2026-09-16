import React from 'react';
import { Award, ChevronRight, Crown, Medal, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import { User } from '../types';
import UserFlag from './UserFlag';
import { flagUrlForEmoji } from '../flags';

interface StandingsProps {
  users: (User & {
    totalPoints: number;
    weekPoints?: number;
    avgPoints?: number;
    exacts?: number;
    results?: number;
  })[];
  onUserClick?: (user: User) => void;
}

const Standings: React.FC<StandingsProps> = ({ users, onUserClick }) => {
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

  return (
    <div className="space-y-8">
      {/* 1. TOP 3 PODIUM */}
      {users.length >= 3 && (
        <section className="relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-56 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end">
            {/* 2. SIRA (GÜMÜŞ) */}
            {top2 && (
              <button
                type="button"
                onClick={() => onUserClick?.(top2)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-400/40 bg-gradient-to-b from-slate-400/15 via-slate-900/85 to-slate-950/95 p-5 sm:p-6 text-left shadow-[0_0_25px_rgba(148,163,184,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 cursor-pointer order-2 md:order-1 min-h-[280px]"
              >
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
                <div className="relative flex items-center justify-between gap-2 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/50 bg-slate-400/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-200">
                    <Medal className="h-3.5 w-3.5 text-slate-300" />
                    2. Sıra · Gümüş
                  </span>
                  {(top2.weekPoints ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      +{top2.weekPoints}
                    </span>
                  )}
                </div>

                <div className="relative my-4 flex flex-col items-center text-center z-10">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-slate-400/60 bg-slate-800/90 p-1.5 shadow-[0_0_20px_rgba(148,163,184,0.3)] ring-2 ring-slate-400/30">
                    {top2.clubLogo || flagUrlForEmoji(top2.flagEmoji, 80) ? (
                      <img
                        src={top2.clubLogo || flagUrlForEmoji(top2.flagEmoji, 80)!}
                        alt={top2.name}
                        referrerPolicy="no-referrer"
                        className="h-12 w-12 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <UserFlag flagEmoji={top2.flagEmoji} className="h-12 w-12 text-3xl" />
                    )}
                    <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-400 text-xs font-black text-slate-950 font-mono">
                      2
                    </span>
                  </div>

                  <h3 className="mt-3 font-sports text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
                    {top2.name}
                  </h3>
                  <div className="mt-3 font-mono text-3xl sm:text-4xl font-black text-slate-200 tabular-nums">
                    {top2.totalPoints ?? 0}
                    <span className="ml-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
                      Puan
                    </span>
                  </div>
                </div>

                <div className="relative grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-center z-10">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                    <div className="text-[9px] font-bold uppercase text-emerald-400">Tam</div>
                    <div className="font-mono text-sm font-black text-white">{top2.exacts ?? 0}</div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                    <div className="text-[9px] font-bold uppercase text-blue-400">Sonuç</div>
                    <div className="font-mono text-sm font-black text-white">{top2.results ?? 0}</div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                    <div className="text-[9px] font-bold uppercase text-slate-400">İsabet</div>
                    <div className="font-mono text-sm font-black text-white">{(top2.exacts ?? 0) + (top2.results ?? 0)}</div>
                  </div>
                </div>
              </button>
            )}

            {/* 1. SIRA (ALTIN) */}
            {top1 && (
              <button
                type="button"
                onClick={() => onUserClick?.(top1)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-400/70 bg-gradient-to-b from-amber-500/20 via-slate-900/90 to-slate-950/95 p-6 sm:p-7 text-left shadow-[0_0_40px_rgba(245,158,11,0.25)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-amber-300 cursor-pointer order-1 md:order-2 md:-translate-y-3 min-h-[320px] ring-1 ring-amber-400/40"
              >
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
                <div className="relative flex items-center justify-between gap-2 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-500/30 to-amber-600/30 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <Crown className="h-4 w-4 text-amber-300 fill-amber-300" />
                    1. Sıra · Şampiyonluk Lideri
                  </span>
                  {(top1.weekPoints ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-300">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +{top1.weekPoints}
                    </span>
                  )}
                </div>

                <div className="relative my-4 flex flex-col items-center text-center z-10">
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-amber-400 bg-slate-950 p-2 shadow-[0_0_30px_rgba(245,158,11,0.45)] ring-4 ring-amber-400/30">
                    {top1.clubLogo || flagUrlForEmoji(top1.flagEmoji, 80) ? (
                      <img
                        src={top1.clubLogo || flagUrlForEmoji(top1.flagEmoji, 80)!}
                        alt={top1.name}
                        referrerPolicy="no-referrer"
                        className="h-14 w-14 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <UserFlag flagEmoji={top1.flagEmoji} className="h-14 w-14 text-4xl" />
                    )}
                    <span className="absolute -bottom-2.5 -right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-sm font-black text-slate-950 font-mono ring-2 ring-slate-950">
                      ★ 1
                    </span>
                  </div>

                  <h3 className="mt-3.5 font-sports text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                    {top1.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-amber-400">
                    <Sparkles className="h-3 w-3" />
                    Zirvede Tek Başına
                  </div>

                  <div className="mt-3 font-mono text-4xl sm:text-5xl font-black text-amber-400 tracking-tight tabular-nums">
                    {top1.totalPoints ?? 0}
                    <span className="ml-2 text-xs font-bold uppercase tracking-wider text-amber-300/80 font-sans">
                      Puan
                    </span>
                  </div>
                </div>

                <div className="relative grid grid-cols-3 gap-2.5 border-t border-amber-500/30 pt-3.5 text-center z-10">
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
                    <div className="text-[10px] font-bold uppercase text-amber-300">Tam</div>
                    <div className="font-mono text-base font-black text-white">{top1.exacts ?? 0}</div>
                  </div>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
                    <div className="text-[10px] font-bold uppercase text-blue-300">Sonuç</div>
                    <div className="font-mono text-base font-black text-white">{top1.results ?? 0}</div>
                  </div>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
                    <div className="text-[10px] font-bold uppercase text-amber-400">İsabet</div>
                    <div className="font-mono text-base font-black text-white">{(top1.exacts ?? 0) + (top1.results ?? 0)}</div>
                  </div>
                </div>
              </button>
            )}

            {/* 3. SIRA (BRONZ) */}
            {top3 && (
              <button
                type="button"
                onClick={() => onUserClick?.(top3)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-700/40 bg-gradient-to-b from-amber-700/15 via-slate-900/85 to-slate-950/95 p-5 sm:p-6 text-left shadow-[0_0_25px_rgba(180,83,9,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-600 cursor-pointer order-3 md:order-3 min-h-[280px]"
              >
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
                <div className="relative flex items-center justify-between gap-2 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-700/50 bg-amber-700/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-300">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    3. Sıra · Bronz
                  </span>
                  {(top3.weekPoints ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      +{top3.weekPoints}
                    </span>
                  )}
                </div>

                <div className="relative my-4 flex flex-col items-center text-center z-10">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-amber-700/60 bg-slate-800/90 p-1.5 shadow-[0_0_20px_rgba(180,83,9,0.3)] ring-2 ring-amber-700/30">
                    {top3.clubLogo || flagUrlForEmoji(top3.flagEmoji, 80) ? (
                      <img
                        src={top3.clubLogo || flagUrlForEmoji(top3.flagEmoji, 80)!}
                        alt={top3.name}
                        referrerPolicy="no-referrer"
                        className="h-12 w-12 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <UserFlag flagEmoji={top3.flagEmoji} className="h-12 w-12 text-3xl" />
                    )}
                    <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-xs font-black text-white font-mono">
                      3
                    </span>
                  </div>

                  <h3 className="mt-3 font-sports text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
                    {top3.name}
                  </h3>
                  <div className="mt-3 font-mono text-3xl sm:text-4xl font-black text-amber-200/90 tabular-nums">
                    {top3.totalPoints ?? 0}
                    <span className="ml-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
                      Puan
                    </span>
                  </div>
                </div>

                <div className="relative grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-center z-10">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                    <div className="text-[9px] font-bold uppercase text-emerald-400">Tam</div>
                    <div className="font-mono text-sm font-black text-white">{top3.exacts ?? 0}</div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                    <div className="text-[9px] font-bold uppercase text-blue-400">Sonuç</div>
                    <div className="font-mono text-sm font-black text-white">{top3.results ?? 0}</div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                    <div className="text-[9px] font-bold uppercase text-slate-400">İsabet</div>
                    <div className="font-mono text-sm font-black text-white">{(top3.exacts ?? 0) + (top3.results ?? 0)}</div>
                  </div>
                </div>
              </button>
            )}
          </div>
        </section>
      )}

      {/* 2. RACER LANES FULL TABLE */}
      <section className="overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/85 shadow-2xl backdrop-blur-xl">
        <div className="relative border-b border-slate-800 bg-slate-950/70 p-5 sm:p-6 text-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="font-sports text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
                Genel Lig Sıralaması
              </h3>
            </div>
            <span className="rounded-full border border-slate-800 bg-slate-900 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-300">
              {users.length} Yazar
            </span>
          </div>
        </div>

        <div className="hidden sm:grid grid-cols-[56px_1fr_100px_100px_100px_120px_40px] items-center gap-3 px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span className="text-center font-mono">SIRA</span>
          <span>YAZAR & KULÜP</span>
          <span className="text-center">TAM SKOR</span>
          <span className="text-center">DOĞRU SONUÇ</span>
          <span className="text-center">İSABET</span>
          <span className="text-right font-mono">TOPLAM PUAN</span>
          <span />
        </div>

        <div className="p-3 sm:p-5 space-y-2.5 bg-slate-950/40">
          {users.map((user, index) => {
            const exacts = user.exacts ?? 0;
            const results = user.results ?? 0;
            const totalHits = exacts + results;
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
                    ? "border-amber-400/50 bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-slate-900/95"
                    : isTop2
                      ? "border-slate-400/40 bg-gradient-to-r from-slate-400/10 via-slate-900/85 to-slate-900/95"
                      : isTop3
                        ? "border-amber-700/35 bg-gradient-to-r from-amber-700/10 via-slate-900/85 to-slate-900/95"
                        : "border-slate-850 bg-slate-900/70 hover:border-slate-700"
                }`}
              >
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

                <div className="hidden sm:grid grid-cols-[56px_1fr_100px_100px_100px_120px_40px] items-center gap-3">
                  <div className="flex items-center justify-center">
                    <span className="font-mono text-sm font-bold text-slate-400">
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/90 p-1">
                      {user.clubLogo || flagUrlForEmoji(user.flagEmoji, 80) ? (
                        <img
                          src={user.clubLogo || flagUrlForEmoji(user.flagEmoji, 80)!}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="h-7 w-7 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <UserFlag flagEmoji={user.flagEmoji} className="h-7 w-7 text-xl" />
                      )}
                    </div>
                    <span className="truncate font-sports text-sm sm:text-base font-bold uppercase text-white group-hover:text-amber-300">
                      {user.name}
                    </span>
                  </div>

                  <div className="flex justify-center">
                    <span className="inline-flex items-center justify-center min-w-[54px] rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 font-mono text-xs font-black text-emerald-400">
                      {exacts}
                    </span>
                  </div>

                  <div className="flex justify-center">
                    <span className="inline-flex items-center justify-center min-w-[54px] rounded-xl border border-blue-500/30 bg-blue-500/15 px-2.5 py-1 font-mono text-xs font-black text-blue-400">
                      {results}
                    </span>
                  </div>

                  <div className="flex justify-center">
                    <span className="inline-flex items-center justify-center min-w-[54px] rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1 font-mono text-xs font-black text-slate-300">
                      {totalHits}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xl sm:text-2xl font-black text-white tabular-nums">
                      {user.totalPoints ?? 0}
                    </span>
                  </div>

                  <div className="flex justify-end text-slate-500 group-hover:text-slate-300">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:hidden">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {index + 1}
                    </span>
                    <div className="truncate font-sports text-sm font-bold uppercase text-white">
                      {user.name}
                    </div>
                  </div>
                  <div className="font-mono text-xl font-black text-white">
                    {user.totalPoints ?? 0}
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

export default Standings;
