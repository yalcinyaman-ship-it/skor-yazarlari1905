import React, { useMemo, useState } from "react";
import { Match, Prediction, User } from "./types";
import UserFlag from "./components/UserFlag";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Lock,
  Minus,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  XCircle
} from "lucide-react";
import TeamLogo from "./components/TeamLogo";

interface WeekMatchesProps {
  label: string;
  matches: Match[];
  predictions: Prediction[];
  users: User[];
  isPublished: boolean;
  pointsPublished: boolean;
  isAdmin?: boolean;
}

type MatchResult = "home" | "away" | "draw";

const getDateMs = (date: any) => {
  if (!date) return 0;
  if (typeof date.toDate === "function") return date.toDate().getTime();
  if (date.seconds) return date.seconds * 1000;
  if (date instanceof Date) return date.getTime();
  if (typeof date === "string") return new Date(date).getTime();
  return 0;
};

const formatMatchDate = (matchDate: any) => {
  const ms = getDateMs(matchDate);

  if (!ms) return "Tarih bekleniyor";

  return new Date(ms).toLocaleDateString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "long"
  });
};

const getResult = (home: number, away: number): MatchResult => {
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
};

const isResultKnown = (match: Match) => {
  return (
    match.actualHome !== null &&
    match.actualHome !== undefined &&
    match.actualAway !== null &&
    match.actualAway !== undefined
  );
};

const getPredictionStatus = (
  prediction: Prediction,
  match: Match,
  matchPredictions: Prediction[]
) => {
  if (!isResultKnown(match)) {
    return {
      label: "Sonuç bekliyor",
      points: null,
      className: "border-white/10 bg-white/[0.03] text-slate-500",
      icon: <Clock3 className="h-3.5 w-3.5" />
    };
  }

  const actualHome = match.actualHome as number;
  const actualAway = match.actualAway as number;

  const exact =
    prediction.predictedHome === actualHome &&
    prediction.predictedAway === actualAway;

  const actualResult = getResult(actualHome, actualAway);
  const predictedResult = getResult(
    prediction.predictedHome,
    prediction.predictedAway
  );

  const resultCorrect = predictedResult === actualResult;

  const correctResultCount = matchPredictions.filter((item) => {
    return getResult(item.predictedHome, item.predictedAway) === actualResult;
  }).length;

  if (exact) {
    const bonus = correctResultCount === 1 ? 1 : 0;

    return {
      label: bonus ? "Tek bilen tam isabet" : "Tam isabet",
      points: 2 + bonus,
      className: "border-amber-400/25 bg-amber-400/10 text-amber-300",
      icon: <Trophy className="h-3.5 w-3.5" />
    };
  }

  if (resultCorrect) {
    const bonus = correctResultCount === 1 ? 1 : 0;

    return {
      label: bonus ? "Tek bilen sonuç" : "Doğru sonuç",
      points: 1 + bonus,
      className: "border-orange-500/25 bg-orange-500/10 text-orange-300",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />
    };
  }

  return {
    label: "Yanlış",
    points: 0,
    className: "border-red-400/25 bg-red-400/10 text-red-300",
    icon: <XCircle className="h-3.5 w-3.5" />
  };
};

const SmallStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 shadow-sm">
      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </div>

      <div className="mt-1 truncate text-sm font-black text-white">
        {value}
      </div>
    </div>
  );
};

const WeekMatches: React.FC<WeekMatchesProps> = ({
  label,
  matches,
  predictions,
  users,
  isPublished,
  pointsPublished,
  isAdmin = false
}) => {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => getDateMs(a.matchDate) - getDateMs(b.matchDate));
  }, [matches]);

  const uniquePredictorIds = useMemo(() => {
    return new Set(predictions.map((prediction) => prediction.userId));
  }, [predictions]);

  const playedCount = sortedMatches.filter(isResultKnown).length;
  const pendingCount = Math.max(sortedMatches.length - playedCount, 0);

  if (!isPublished && !isAdmin) {
    return (
      <section className="card-base overflow-hidden">
        <div className="bg-slate-950 p-5 text-white sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-amber-200">
                <Lock className="h-4 w-4" />
                Hafta kilitli
              </div>

              <h2 className="font-display mt-2 text-2xl font-black uppercase tracking-[-0.01em] sm:text-3xl">
                {label}
              </h2>

              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                Admin haftayı yayınlayana kadar tahmin detayları kapalı kalır.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-xs font-black uppercase tracking-wider text-amber-200">
              Yayın bekliyor
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-7">
          <SmallStat
            icon={<Users className="h-4 w-4 text-orange-400" />}
            label="Katılan"
            value={`${uniquePredictorIds.size}/${users.length}`}
          />

          <SmallStat
            icon={<CalendarDays className="h-4 w-4 text-orange-400" />}
            label="Maç"
            value={matches.length}
          />

          <SmallStat
            icon={<ShieldCheck className="h-4 w-4 text-orange-400" />}
            label="Durum"
            value="Gizli"
          />
        </div>

        <div className="border-t border-white/[0.06] p-5 sm:p-7">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => {
              const hasSubmitted = uniquePredictorIds.has(user.id);

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`shrink-0 ${hasSubmitted ? "" : "grayscale opacity-40"}`}>
                      <UserFlag flagEmoji={user.flagEmoji} className="h-5 w-5 text-lg" />
                    </span>

                    <span className="truncate text-sm font-black text-white">
                      {user.name}
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                      hasSubmitted
                        ? "bg-orange-500/15 text-orange-300"
                        : "bg-white/[0.08] text-slate-500"
                    }`}
                  >
                    {hasSubmitted ? "Yaptı" : "Bekliyor"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (!sortedMatches.length) {
    return (
      <section className="card-base p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/[0.03] text-slate-500 ring-1 ring-white/10">
          <CalendarDays className="h-7 w-7" />
        </div>

        <h3 className="text-lg font-black text-white">
          Bu haftaya maç eklenmemiş
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
          Maçlar admin panelinden eklendiğinde burada listelenecek.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="card-base overflow-hidden">
        <div className="border-b border-white/[0.06] p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="section-title">
                Haftanın maç merkezi
              </div>

              <h2 className="font-display mt-2 text-3xl font-black uppercase tracking-[-0.02em] text-white sm:text-5xl">
                {label}
              </h2>

              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                Maçları net gör, sonucu takip et, detaydan herkesin tahminini aç.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 xl:w-[420px]">
              <SmallStat
                icon={<CalendarDays className="h-4 w-4 text-orange-400" />}
                label="Maç"
                value={sortedMatches.length}
              />

              <SmallStat
                icon={<ShieldCheck className="h-4 w-4 text-orange-400" />}
                label="Biten"
                value={playedCount}
              />

              <SmallStat
                icon={<Clock3 className="h-4 w-4 text-amber-600" />}
                label="Bekleyen"
                value={pendingCount}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-6">
          {sortedMatches.map((match) => {
            const matchPredictions = predictions.filter(
              (prediction) => prediction.matchId === match.id
            );

            const resultKnown = isResultKnown(match);
            const expanded = expandedMatchId === match.id;
            const total = matchPredictions.length;

            const homeWins = matchPredictions.filter((prediction) => {
              return prediction.predictedHome > prediction.predictedAway;
            }).length;

            const awayWins = matchPredictions.filter((prediction) => {
              return prediction.predictedAway > prediction.predictedHome;
            }).length;

            const draws = matchPredictions.filter((prediction) => {
              return prediction.predictedHome === prediction.predictedAway;
            }).length;

            const homePct = total ? Math.round((homeWins / total) * 100) : 0;
            const drawPct = total ? Math.round((draws / total) * 100) : 0;
            const awayPct = total ? Math.max(0, 100 - homePct - drawPct) : 0;

            const popularPick =
              total === 0
                ? "Veri yok"
                : homeWins >= draws && homeWins >= awayWins
                  ? match.homeTeam
                  : awayWins >= homeWins && awayWins >= draws
                    ? match.awayTeam
                    : "Beraberlik";

            return (
              <article
                key={match.id}
                className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] shadow-[0_16px_54px_rgba(15,23,42,0.055)]"
              >
                <button
                  type="button"
                  onClick={() => setExpandedMatchId(expanded ? null : match.id)}
                  className="block w-full p-4 text-left transition duration-200 hover:bg-white/[0.07] sm:p-5"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-500">
                        <CalendarDays className="h-4 w-4" />
                        {formatMatchDate(match.matchDate)}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                            resultKnown
                              ? "bg-orange-500/10 text-orange-400"
                              : "bg-amber-400/10 text-amber-300"
                          }`}
                        >
                          {resultKnown ? "Sonuçlandı" : "Bekliyor"}
                        </span>

                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {total} tahmin
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                      <div className="min-w-0">
                        <div className="flex items-center justify-end gap-2 sm:gap-3">
                          <div className="min-w-0 text-right">
                            <div className="truncate text-lg font-black tracking-[-0.04em] text-white sm:text-2xl">
                              {match.homeTeam}
                            </div>
                            <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                              Ev sahibi
                            </div>
                          </div>

                          <TeamLogo
                            teamName={match.homeTeam}
                            className="h-12 w-12 shrink-0 sm:h-16 sm:w-16"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`min-w-[86px] rounded-[1.35rem] border px-3 py-3 text-center shadow-sm sm:min-w-[112px] ${
                            resultKnown
                              ? "border-orange-500/25 bg-orange-500/10 text-orange-300"
                              : "border-white/10 bg-white/[0.03] text-white"
                          }`}
                        >
                          {resultKnown ? (
                            <div className="stat-number text-3xl sm:text-4xl">
                              {match.actualHome}
                              <span className="mx-1.5 text-slate-500">:</span>
                              {match.actualAway}
                            </div>
                          ) : (
                            <div className="text-sm font-black uppercase tracking-[0.28em] text-slate-500 sm:text-base">
                              VS
                            </div>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {resultKnown ? (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
                              Resmi skor
                            </>
                          ) : (
                            <>
                              <Clock3 className="h-3.5 w-3.5 text-amber-600" />
                              Maç bekliyor
                            </>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center justify-start gap-2 sm:gap-3">
                          <TeamLogo
                            teamName={match.awayTeam}
                            className="h-12 w-12 shrink-0 sm:h-16 sm:w-16"
                          />

                          <div className="min-w-0 text-left">
                            <div className="truncate text-lg font-black tracking-[-0.04em] text-white sm:text-2xl">
                              {match.awayTeam}
                            </div>
                            <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                              Deplasman
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                          <BarChart3 className="h-3.5 w-3.5 text-orange-400" />
                          Favori Tahmin
                        </div>
                        <div className="mt-1 truncate text-sm font-black text-white">
                          {popularPick}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                          <Target className="h-3.5 w-3.5 text-orange-400" />
                          Puan Durumu
                        </div>
                        <div className="mt-1 truncate text-sm font-black text-white">
                          {pointsPublished ? "Puanlandı" : "Bekliyor"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white shadow-sm sm:min-w-[150px]">
                        <span>{expanded ? "Kapat" : "Detay Aç"}</span>
                        <ChevronDown
                          className={`h-5 w-5 text-slate-500 transition ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-white/[0.06] bg-white/[0.03]">
                    <div className="border-b border-white/10 bg-white/[0.04] px-5 py-4 sm:px-6">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-400">
                            Açılan maç
                          </div>

                          <h3 className="font-display mt-1 text-xl font-black uppercase tracking-[-0.01em] text-white">
                            {match.homeTeam} - {match.awayTeam}
                          </h3>

                          <p className="mt-1 text-xs font-bold text-slate-500">
                            {formatMatchDate(match.matchDate)}
                          </p>
                        </div>

                        <div
                          className={`rounded-2xl border px-4 py-2 text-center ${
                            resultKnown
                              ? "border-orange-500/25 bg-orange-500/10 text-orange-300"
                              : "border-white/10 bg-white/[0.03] text-slate-500"
                          }`}
                        >
                          <div className="text-[10px] font-black uppercase tracking-wider">
                            Skor
                          </div>

                          <div className="stat-number text-2xl">
                            {resultKnown
                              ? `${match.actualHome} - ${match.actualAway}`
                              : "Bekliyor"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                            Tahmin dağılımı
                          </h4>

                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            Kim hangi tarafa oynamış, hızlıca gör.
                          </p>
                        </div>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {total > 0 ? `${total} tahmin` : "Tahmin yok"}
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                        <div className="flex h-11 w-full">
                          <div
                            style={{ width: `${homePct}%` }}
                            className="flex items-center justify-center bg-orange-600 text-[10px] font-black text-white"
                          >
                            {homePct >= 12 ? `${homePct}%` : ""}
                          </div>

                          <div
                            style={{ width: `${drawPct}%` }}
                            className="flex items-center justify-center bg-slate-400 text-[10px] font-black text-white"
                          >
                            {drawPct >= 12 ? `${drawPct}%` : ""}
                          </div>

                          <div
                            style={{ width: `${awayPct}%` }}
                            className="flex items-center justify-center bg-blue-700 text-[10px] font-black text-white"
                          >
                            {awayPct >= 12 ? `${awayPct}%` : ""}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-wider">
                        <span className="truncate text-orange-400">
                          {match.homeTeam} ({homeWins})
                        </span>

                        <span className="flex items-center justify-center gap-1 text-slate-500">
                          <Minus className="h-3 w-3" />
                          Beraberlik ({draws})
                        </span>

                        <span className="truncate text-right text-blue-700">
                          {match.awayTeam} ({awayWins})
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-white/10 bg-white/[0.04] p-5 sm:p-6">
                      {matchPredictions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {users.map((user) => {
                            const prediction = matchPredictions.find(
                              (item) => item.userId === user.id
                            );

                            if (!prediction) return null;

                            const status = getPredictionStatus(
                              prediction,
                              match,
                              matchPredictions
                            );

                            return (
                              <div
                                key={user.id}
                                className={`relative overflow-hidden rounded-2xl border px-4 py-3 ${status.className}`}
                              >
                                {user.colors && user.colors.length > 0 && (
                                  <div
                                    className="absolute bottom-0 left-0 h-0.5 w-full opacity-70"
                                    style={{
                                      background:
                                        user.colors.length > 1
                                          ? `linear-gradient(to right, ${user.colors.join(", ")})`
                                          : user.colors[0]
                                    }}
                                  />
                                )}

                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <UserFlag flagEmoji={user.flagEmoji} className="h-5 w-5 text-lg" />

                                    <div className="min-w-0">
                                      <div className="truncate text-sm font-black">
                                        {user.name}
                                      </div>

                                      <div className="mt-0.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider opacity-80">
                                        {status.icon}
                                        {status.label}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <div className="text-lg font-black">
                                      {prediction.predictedHome}-{prediction.predictedAway}
                                    </div>

                                    {status.points !== null && (
                                      <div className="text-[10px] font-black uppercase tracking-wider opacity-80">
                                        {status.points > 0 ? `+${status.points}` : "0"} puan
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
                          <Sparkles className="mx-auto mb-2 h-6 w-6 text-slate-500" />

                          <p className="text-sm font-bold text-slate-500">
                            Bu maç için henüz tahmin yok.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WeekMatches;