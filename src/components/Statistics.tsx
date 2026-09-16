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
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all hover:border-slate-300">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#64748B]">
          {label}
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[#1E3A8A]">
          {icon}
        </div>
      </div>

      <div className="stat-number font-mono text-2xl sm:text-3xl font-black text-[#0F172A]">
        {value}
      </div>

      <p className="mt-1 text-xs font-medium text-[#64748B]">
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
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
      <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1E3A8A]">
              {subtitle}
            </div>

            <h3 className="font-serif mt-0.5 text-xl font-bold tracking-tight text-[#0F172A]">
              {title}
            </h3>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#1E3A8A] shadow-2xs border border-[#E2E8F0]">
            {icon}
          </div>
        </div>
      </div>

      {leader ? (
        <div className="p-5">
          <button
            type="button"
            onClick={() => onUserClick?.(leader)}
            className="group mb-4 flex w-full items-center justify-between gap-4 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 p-4 text-left transition hover:border-amber-300 hover:shadow-xs"
          >
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs border border-amber-200">
                <UserFlag flagEmoji={leader.flagEmoji} className="h-7 w-7 text-2xl" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                    #1
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Zirve
                  </span>
                </div>

                <div className="font-serif mt-0.5 truncate text-lg font-bold text-[#0F172A] group-hover:text-[#1E3A8A] transition-colors">
                  {leader.name}
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="stat-number font-mono text-3xl font-black text-[#0F172A]">
                {leader[valueKey] || 0}
              </div>

              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                {valueLabel}
              </div>
            </div>
          </button>

          <div className="space-y-1.5">
            {users.slice(1, 5).map((user, index) => {
              const realIndex = index + 1;

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onUserClick?.(user)}
                  className="group flex w-full items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]/70 px-4 py-2.5 text-left transition hover:border-slate-300 hover:bg-[#F8FAFC] hover:shadow-2xs"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0F172A] border border-[#E2E8F0]">
                      {realIndex + 1}
                    </div>

                    <UserFlag flagEmoji={user.flagEmoji} className="h-5 w-5 text-base" />

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[#0F172A] group-hover:text-[#1E3A8A] transition-colors">
                        {user.name}
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
                        {getRankIcon(realIndex)}
                        {getRankLabel(realIndex)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="stat-number font-mono text-lg font-bold text-[#0F172A]">
                      {user[valueKey] || 0}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
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
          <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-6 text-center">
            <p className="text-sm font-medium text-[#64748B]">
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
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1E3A8A]">
            Tüm Oyuncular
          </div>
          <h3 className="font-serif mt-0.5 text-xl font-bold tracking-tight text-[#0F172A]">
            Performans Tablosu
          </h3>
        </div>

        <BarChart3 className="h-5 w-5 text-[#1E3A8A]" />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
        <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr] bg-[#F8FAFC] px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
          <div>Yazar</div>
          <div className="text-right">Puan</div>
          <div className="text-right">Tam</div>
          <div className="text-right">Sonuç</div>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {users.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => onUserClick?.(user)}
              className="grid w-full grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr] items-center px-4 py-3 text-left transition hover:bg-[#F8FAFC]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#0F172A] border border-[#E2E8F0]">
                  {index + 1}
                </div>

                <UserFlag flagEmoji={user.flagEmoji} className="h-5 w-5 text-base" />

                <span className="truncate text-sm font-semibold text-[#0F172A]">
                  {user.name}
                </span>
              </div>

              <div className="text-right font-mono text-sm font-bold text-[#0F172A]">
                {user.totalPoints || 0}
              </div>

              <div className="text-right font-mono text-sm font-bold text-[#0F172A]">
                {user.exacts || 0}
              </div>

              <div className="text-right font-mono text-sm font-bold text-[#0F172A]">
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
