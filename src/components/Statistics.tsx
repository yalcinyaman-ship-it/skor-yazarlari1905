import React from "react";
import {
  Activity,
  Award,
  BarChart3,
  Medal,
  Target,
  Trophy,
  Zap
} from "lucide-react";
import { User } from "../types";
import UserFlag from "./UserFlag";

interface StatsProps {
  users: (User & {
    exacts?: number;
    results?: number;
    totalPoints?: number;
    avgPoints?: number;
  })[];
  onUserClick?: (user: User) => void;
}

const getRankLabel = (index: number) => {
  if (index === 0) return "Lider";
  if (index === 1) return "İkinci";
  if (index === 2) return "Üçüncü";
  return `${index + 1}. sıra`;
};

const getRankIcon = (index: number) => {
  if (index === 0) return <Trophy className="h-4 w-4" />;
  if (index === 1) return <Medal className="h-4 w-4" />;
  if (index === 2) return <Award className="h-4 w-4" />;
  return <Activity className="h-4 w-4" />;
};

const StatMetric: React.FC<{
  label: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
}> = ({ label, value, helper, icon }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
          {label}
        </span>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
          {icon}
        </div>
      </div>

      <div className="stat-number text-3xl font-black text-white">
        {value}
      </div>

      <p className="mt-1 text-xs font-bold text-slate-500">
        {helper}
      </p>
    </div>
  );
};

const TopPerformerCard: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  users: StatsProps["users"];
  valueKey: "exacts" | "results" | "totalPoints";
  valueLabel: string;
  onUserClick?: (user: User) => void;
}> = ({ title, subtitle, icon, users, valueKey, valueLabel, onUserClick }) => {
  const leader = users[0];

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
      <div className="border-b border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-300">
              {subtitle}
            </div>

            <h3 className="font-display mt-1 text-xl font-black uppercase tracking-[-0.01em] text-white">
              {title}
            </h3>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] text-orange-400 shadow-sm ring-1 ring-white/10">
            {icon}
          </div>
        </div>
      </div>

      {leader ? (
        <div className="p-5">
          <button
            type="button"
            onClick={() => onUserClick?.(leader)}
            className="group mb-4 flex w-full items-center justify-between gap-4 rounded-3xl border border-orange-500/20 bg-orange-500/[0.06] p-4 text-left transition hover:border-orange-500/30 hover:bg-orange-500/10"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] shadow-sm ring-1 ring-white/10">
                <UserFlag flagEmoji={leader.flagEmoji} className="h-9 w-9 text-2xl" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[color:var(--color-gold-500)] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                    #1
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-300">
                    Zirve
                  </span>
                </div>

                <div className="font-display mt-1 truncate text-lg font-black uppercase tracking-[-0.01em] text-white group-hover:text-orange-300">
                  {leader.name}
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="stat-number text-4xl font-black text-white">
                {leader[valueKey] || 0}
              </div>

              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                {valueLabel}
              </div>
            </div>
          </button>

          <div className="space-y-2">
            {users.slice(1, 5).map((user, index) => {
              const realIndex = index + 1;

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onUserClick?.(user)}
                  className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-left transition hover:border-orange-500/25 hover:bg-white/[0.04] hover:shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-xs font-black text-slate-500 ring-1 ring-white/10">
                      {realIndex + 1}
                    </div>

                    <UserFlag flagEmoji={user.flagEmoji} className="h-6 w-6 text-lg" />

                    <div className="min-w-0">
                      <div className="truncate text-sm font-black text-white group-hover:text-orange-400">
                        {user.name}
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        {getRankIcon(realIndex)}
                        {getRankLabel(realIndex)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="stat-number text-xl font-black text-white">
                      {user[valueKey] || 0}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {valueLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-5">
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
            <p className="text-sm font-bold text-slate-500">
              Bu istatistik için henüz veri yok.
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
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-300">
            Tüm Oyuncular
          </div>
          <h3 className="font-display mt-1 text-xl font-black uppercase tracking-[-0.01em] text-white">
            Performans Tablosu
          </h3>
        </div>

        <BarChart3 className="h-6 w-6 text-orange-400" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr] bg-white/[0.03] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
          <div>Yazar</div>
          <div className="text-right">Puan</div>
          <div className="text-right">Tam</div>
          <div className="text-right">Sonuç</div>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {users.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => onUserClick?.(user)}
              className="grid w-full grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr] items-center px-4 py-3 text-left transition hover:bg-white/[0.07]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-black text-slate-500">
                  {index + 1}
                </div>

                <UserFlag flagEmoji={user.flagEmoji} className="h-5 w-5 text-base" />

                <span className="truncate text-sm font-black text-white">
                  {user.name}
                </span>
              </div>

              <div className="text-right text-sm font-black text-white">
                {user.totalPoints || 0}
              </div>

              <div className="text-right text-sm font-black text-white">
                {user.exacts || 0}
              </div>

              <div className="text-right text-sm font-black text-white">
                {user.results || 0}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Statistics: React.FC<StatsProps> = ({ users, onUserClick }) => {
  const sortedByPoints = [...users].sort((a, b) => {
    if ((b.totalPoints || 0) !== (a.totalPoints || 0)) return (b.totalPoints || 0) - (a.totalPoints || 0);
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

  const avgPoints = users.length > 0
    ? Math.round((totalPoints / users.length) * 10) / 10
    : 0;

  return (
    <section className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatMetric
          label="Lider"
          value={bestUser?.name || "Yok"}
          helper={bestUser ? `${bestUser.totalPoints || 0} puanla zirvede` : "Veri bekleniyor"}
          icon={<Trophy className="h-5 w-5" />}
        />

        <StatMetric
          label="Toplam Puan"
          value={totalPoints}
          helper="Sezonda toplanan toplam puan"
          icon={<Zap className="h-5 w-5" />}
        />

        <StatMetric
          label="Tam Skor"
          value={totalExacts}
          helper="Toplam tam isabet"
          icon={<Target className="h-5 w-5" />}
        />

        <StatMetric
          label="Ortalama"
          value={avgPoints}
          helper="Oyuncu başı puan ortalaması"
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <TopPerformerCard
          title="Tam Skor Ustaları"
          subtitle="Keskin Tahmin"
          icon={<Target className="h-6 w-6" />}
          users={topExacts}
          valueKey="exacts"
          valueLabel="tam"
          onUserClick={onUserClick}
        />

        <TopPerformerCard
          title="Sonuç Avcıları"
          subtitle="Doğru Taraf"
          icon={<Award className="h-6 w-6" />}
          users={topResults}
          valueKey="results"
          valueLabel="sonuç"
          onUserClick={onUserClick}
        />
      </div>

      <MiniTable users={sortedByPoints} onUserClick={onUserClick} />
    </section>
  );
};

export default Statistics;