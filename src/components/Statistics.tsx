import React from "react";
import {
  Activity,
  Award,
  BarChart3,
  ChevronRight,
  Crosshair,
  Crown,
  Flame,
  Medal,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap
} from "lucide-react";
import { User } from "../types";
import UserFlag from "./UserFlag";
import { flagUrlForEmoji } from "../flags";

interface StatsProps {
  users: (User & {
    exacts?: number;
    results?: number;
    totalPoints?: number;
    avgPoints?: number;
    weekPoints?: number;
  })[];
  onUserClick?: (user: User) => void;
}

const StatMetric: React.FC<{
  label: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
  accentColor?: "amber" | "emerald" | "blue" | "purple";
}> = ({ label, value, helper, icon, accentColor = "blue" }) => {
  const colorStyles = {
    amber: {
      border: "border-amber-500/30",
      bg: "bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-950/90",
      iconBg: "bg-amber-500/20 text-amber-300 border-amber-400/40",
      valueColor: "text-amber-400",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.12)]"
    },
    emerald: {
      border: "border-emerald-500/30",
      bg: "bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-slate-950/90",
      iconBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
      valueColor: "text-emerald-400",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.12)]"
    },
    blue: {
      border: "border-blue-500/30",
      bg: "bg-gradient-to-br from-blue-500/10 via-slate-900/80 to-slate-950/90",
      iconBg: "bg-blue-500/20 text-blue-300 border-blue-400/40",
      valueColor: "text-blue-400",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.12)]"
    },
    purple: {
      border: "border-purple-500/30",
      bg: "bg-gradient-to-br from-purple-500/10 via-slate-900/80 to-slate-950/90",
      iconBg: "bg-purple-500/20 text-purple-300 border-purple-400/40",
      valueColor: "text-purple-300",
      glow: "shadow-[0_0_20px_rgba(168,85,247,0.12)]"
    }
  }[accentColor];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${colorStyles.border} ${colorStyles.bg} ${colorStyles.glow}`}
    >
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400 font-mono">
          {label}
        </span>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl border shadow-inner ${colorStyles.iconBg}`}
        >
          {icon}
        </div>
      </div>

      <div
        className={`font-mono text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${colorStyles.valueColor}`}
      >
        {value}
      </div>

      <p className="mt-1.5 text-xs font-medium text-slate-400 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-500/60" />
        {helper}
      </p>
    </div>
  );
};

const TopPerformerCard: React.FC<{
  title: string;
  subtitle: string;
  tagline: string;
  icon: React.ReactNode;
  users: StatsProps["users"];
  valueKey: "exacts" | "results" | "totalPoints";
  valueLabel: string;
  theme: "emerald" | "blue";
  onUserClick?: (user: User) => void;
}> = ({
  title,
  subtitle,
  tagline,
  icon,
  users,
  valueKey,
  valueLabel,
  theme,
  onUserClick
}) => {
  const leader = users[0];
  const isEmerald = theme === "emerald";

  const themeClasses = isEmerald
    ? {
        border: "border-emerald-500/40",
        badge: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
        glow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
        leaderBorder: "border-emerald-400/60 bg-gradient-to-r from-emerald-500/15 via-slate-900/90 to-slate-950/95",
        leaderValue: "text-emerald-400",
        barBg: "bg-emerald-500"
      }
    : {
        border: "border-blue-500/40",
        badge: "border-blue-500/40 bg-blue-500/15 text-blue-300",
        glow: "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
        leaderBorder: "border-blue-400/60 bg-gradient-to-r from-blue-500/15 via-slate-900/90 to-slate-950/95",
        leaderValue: "text-blue-400",
        barBg: "bg-blue-500"
      };

  return (
    <div
      className={`overflow-hidden rounded-3xl border bg-slate-900/85 backdrop-blur-xl transition-all duration-300 ${themeClasses.border} ${themeClasses.glow}`}
    >
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${themeClasses.badge}`}
              >
                {subtitle}
              </span>
              <span className="text-[11px] font-bold text-slate-400">{tagline}</span>
            </div>

            <h3 className="font-sports mt-1 text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
              {title}
            </h3>
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-inner ${themeClasses.badge}`}
          >
            {icon}
          </div>
        </div>
      </div>

      {leader ? (
        <div className="p-4 sm:p-6 space-y-3">
          {/* #1 Leader Showcase Card */}
          <button
            type="button"
            onClick={() => onUserClick?.(leader)}
            className={`group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-2xl border p-4 text-left shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer ${themeClasses.leaderBorder}`}
          >
            {/* Team Left Border Stripe */}
            {leader.colors && leader.colors.length > 0 && (
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{
                  background:
                    leader.colors.length > 1
                      ? `linear-gradient(to bottom, ${leader.colors.join(", ")})`
                      : leader.colors[0]
                }}
              />
            )}

            <div className="flex min-w-0 items-center gap-3.5">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-850 p-1 shadow-inner ring-2 ring-slate-800">
                {leader.clubLogo || flagUrlForEmoji(leader.flagEmoji, 80) ? (
                  <img
                    src={leader.clubLogo || flagUrlForEmoji(leader.flagEmoji, 80)!}
                    alt={leader.name}
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 object-contain drop-shadow-md"
                    loading="lazy"
                  />
                ) : (
                  <UserFlag flagEmoji={leader.flagEmoji} className="h-9 w-9 text-2xl" />
                )}

                <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 font-mono text-[10px] font-black text-slate-950 ring-2 ring-slate-950 shadow-sm">
                  ★ 1
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    Kategori Lideri
                  </span>
                  <Sparkles className="h-3 w-3 text-amber-400" />
                </div>

                <div className="font-sports mt-0.5 truncate text-lg sm:text-xl font-bold uppercase text-white group-hover:text-amber-300 transition-colors">
                  {leader.name}
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  Toplam {leader.totalPoints || 0} puan
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div
                className={`font-mono text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${themeClasses.leaderValue}`}
              >
                {leader[valueKey] || 0}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
                {valueLabel}
              </div>
            </div>
          </button>

          {/* Runners-up List (#2 - #5) */}
          <div className="space-y-1.5 pt-1">
            {users.slice(1, 5).map((user, index) => {
              const rank = index + 2;
              const maxVal = leader[valueKey] || 1;
              const currentVal = user[valueKey] || 0;
              const barPercent = Math.min(100, Math.round((currentVal / maxVal) * 100));

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onUserClick?.(user)}
                  className="group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/60 px-3.5 py-2.5 text-left transition-all hover:border-slate-700 hover:bg-slate-900/80 cursor-pointer"
                >
                  {/* Subtle Background Progress Bar */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 opacity-[0.06] transition-all group-hover:opacity-[0.12] ${themeClasses.barBg}`}
                    style={{ width: `${barPercent}%` }}
                  />

                  <div className="relative flex min-w-0 items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-900 font-mono text-xs font-black text-slate-400 border border-slate-800">
                      {rank}
                    </span>

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800/90 p-0.5 border border-slate-700">
                      {user.clubLogo || flagUrlForEmoji(user.flagEmoji, 80) ? (
                        <img
                          src={user.clubLogo || flagUrlForEmoji(user.flagEmoji, 80)!}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="h-5 w-5 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <UserFlag flagEmoji={user.flagEmoji} className="h-5 w-5 text-base" />
                      )}
                    </div>

                    <span className="truncate font-sports text-sm font-bold uppercase text-slate-200 group-hover:text-white transition-colors">
                      {user.name}
                    </span>
                  </div>

                  <div className="relative shrink-0 text-right flex items-center gap-2">
                    <span className="font-mono text-base font-black text-white tabular-nums">
                      {currentVal}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {valueLabel}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8">
            <p className="text-xs font-medium text-slate-400">
              Bu istatistik kategorisi için henüz veri kaydedilmedi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const MiniTable: React.FC<{
  users: StatsProps["users"];
  onUserClick?: (user: User) => void;
}> = ({ users, onUserClick }) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/85 shadow-2xl backdrop-blur-xl">
      <div className="border-b border-slate-800 bg-slate-950/80 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-sports text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
                Detaylı Performans Telemetrisi
              </h3>
              <p className="text-xs text-slate-400">
                Tüm yazarların maç skorları, doğru tahminleri ve ligdeki puan dökümü
              </p>
            </div>
          </div>

          <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            {users.length} YAZAR
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3.5 text-center font-mono w-14">#</th>
              <th className="px-5 py-3.5 font-bold">YAZAR & KULÜP</th>
              <th className="px-5 py-3.5 text-center font-bold">TAM SKOR</th>
              <th className="px-5 py-3.5 text-center font-bold">DOĞRU SONUÇ</th>
              <th className="px-5 py-3.5 text-center font-bold">TOPLAM İSABET</th>
              <th className="px-5 py-3.5 text-right font-mono font-bold">TOPLAM PUAN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {users.map((user, index) => {
              const exacts = user.exacts || 0;
              const results = user.results || 0;
              const totalHits = exacts + results;
              const isFirst = index === 0;

              return (
                <tr
                  key={user.id}
                  onClick={() => onUserClick?.(user)}
                  className="group hover:bg-slate-850/60 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 text-center">
                    {isFirst ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400 font-mono text-xs font-black text-slate-950 shadow-sm">
                        1
                      </span>
                    ) : (
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {index + 1}
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/90 p-0.5">
                        {user.clubLogo || flagUrlForEmoji(user.flagEmoji, 80) ? (
                          <img
                            src={user.clubLogo || flagUrlForEmoji(user.flagEmoji, 80)!}
                            alt={user.name}
                            referrerPolicy="no-referrer"
                            className="h-6 w-6 object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <UserFlag flagEmoji={user.flagEmoji} className="h-6 w-6 text-base" />
                        )}
                      </div>

                      <span className="font-sports text-sm font-bold uppercase text-slate-200 group-hover:text-amber-300 transition-colors">
                        {user.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex min-w-[36px] justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
                      {exacts}
                    </span>
                  </td>

                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex min-w-[36px] justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 font-mono text-xs font-bold text-blue-400">
                      {results}
                    </span>
                  </td>

                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex min-w-[36px] justify-center rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-0.5 font-mono text-xs font-bold text-slate-300">
                      {totalHits}
                    </span>
                  </td>

                  <td className="px-5 py-3 text-right">
                    <span
                      className={`font-mono text-base font-black tabular-nums ${
                        isFirst ? "text-amber-400" : "text-white"
                      }`}
                    >
                      {user.totalPoints || 0}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Statistics: React.FC<StatsProps> = ({ users, onUserClick }) => {
  const sortedByPoints = [...users].sort((a, b) => {
    if ((b.totalPoints || 0) !== (a.totalPoints || 0))
      return (b.totalPoints || 0) - (a.totalPoints || 0);
    if ((b.exacts || 0) !== (a.exacts || 0)) return (b.exacts || 0) - (a.exacts || 0);
    return (b.results || 0) - (a.results || 0);
  });

  const topExacts = [...users]
    .filter((user) => (user.exacts || 0) > 0)
    .sort((a, b) => {
      if ((b.exacts || 0) !== (a.exacts || 0)) return (b.exacts || 0) - (a.exacts || 0);
      return (b.totalPoints || 0) - (a.totalPoints || 0);
    })
    .slice(0, 5);

  const topResults = [...users]
    .filter((user) => (user.results || 0) > 0)
    .sort((a, b) => {
      if ((b.results || 0) !== (a.results || 0)) return (b.results || 0) - (a.results || 0);
      return (b.totalPoints || 0) - (a.totalPoints || 0);
    })
    .slice(0, 5);

  const totalPoints = users.reduce((sum, user) => sum + (user.totalPoints || 0), 0);
  const totalExacts = users.reduce((sum, user) => sum + (user.exacts || 0), 0);
  const totalResults = users.reduce((sum, user) => sum + (user.results || 0), 0);
  const bestUser = sortedByPoints[0];

  const avgPoints =
    users.length > 0 ? Math.round((totalPoints / users.length) * 10) / 10 : 0;

  return (
    <section className="space-y-6">
      {/* 4'lü Üst KPI Kartları (Lig Telemetrisi) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatMetric
          label="LİDER"
          value={bestUser?.name || "Yok"}
          helper={bestUser ? `${bestUser.totalPoints || 0} puanla zirvede` : "Veri bekleniyor"}
          icon={<Crown className="h-5 w-5" />}
          accentColor="amber"
        />

        <StatMetric
          label="TOPLAM LİG PUANI"
          value={totalPoints}
          helper="Sezonda toplanan kümülatif puan"
          icon={<Zap className="h-5 w-5" />}
          accentColor="blue"
        />

        <StatMetric
          label="TOPLAM TAM SKOR"
          value={totalExacts}
          helper="Ligteki toplam 90+ tam isabet"
          icon={<Crosshair className="h-5 w-5" />}
          accentColor="emerald"
        />

        <StatMetric
          label="LİG ORTALAMASI"
          value={avgPoints}
          helper="Yazar başına düşen ortalama puan"
          icon={<Activity className="h-5 w-5" />}
          accentColor="purple"
        />
      </div>

      {/* İkili Liderlik Alanı (Tam Skor Ustaları & Sonuç Avcıları) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TopPerformerCard
          title="Tam Skor Ustaları"
          subtitle="KESKİN NİŞANCILAR"
          tagline="90 Dakika Skorunu Bilenler"
          icon={<Target className="h-6 w-6 text-emerald-400" />}
          users={topExacts}
          valueKey="exacts"
          valueLabel="Tam Skor"
          theme="emerald"
          onUserClick={onUserClick}
        />

        <TopPerformerCard
          title="Sonuç Avcıları"
          subtitle="İSABET ORANI"
          tagline="Kazanan Tarafı Doğru Bulanlar"
          icon={<Award className="h-6 w-6 text-blue-400" />}
          users={topResults}
          valueKey="results"
          valueLabel="Doğru Sonuç"
          theme="blue"
          onUserClick={onUserClick}
        />
      </div>

      {/* Detaylı Performans Telemetrisi */}
      <MiniTable users={sortedByPoints} onUserClick={onUserClick} />
    </section>
  );
};

export default Statistics;

