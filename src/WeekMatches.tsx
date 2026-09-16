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
      className: "border-slate-800 bg-slate-900/60 text-slate-400",
      icon: <Clock3 className="h-3.5 w-3.5 text-slate-500" />
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
      className: "border-amber-400/50 bg-amber-950/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
      icon: <Trophy className="h-3.5 w-3.5 text-amber-400" />
    };
  }

  if (resultCorrect) {
    const bonus = correctResultCount === 1 ? 1 : 0;

    return {
      label: bonus ? "Tek bilen sonuç" : "Doğru sonuç",
      points: 1 + bonus,
      className: "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
    };
  }

  return {
    label: "Yanlış",
    points: 0,
    className: "border-slate-800 bg-slate-900/50 text-slate-500",
    icon: <XCircle className="h-3.5 w-3.5 text-slate-600" />
  };
};

const SmallStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-3.5 shadow-md backdrop-blur-md">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 font-mono text-xl font-black text-white tabular-nums">
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
      <section className="overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/85 shadow-2xl backdrop-blur-xl">
        <div className="relative border-b border-slate-800 bg-slate-950/70 p-6 sm:p-8 text-slate-100">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-3/4 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                <Lock className="h-7 w-7 stroke-[2]" />
              </div>

              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                  <span>Hafta Kilitli</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                </div>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white font-sports sm:text-3xl">
                  {label}
                </h2>

                <p className="mt-1 max-w-xl text-xs sm:text-sm font-medium text-slate-400 leading-relaxed">
                  Tüm yazarlar tahminlerini tamamlayana veya maçlar başlayana kadar tahmin detayları gizli tutulur.
                </p>
              </div>
            </div>

            <div className="self-start sm:self-auto rounded-full border border-amber-500/40 bg-amber-500/15 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              Yayın Bekliyor
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6 bg-slate-950/40">
          <SmallStat
            icon={<Users className="h-4 w-4 text-blue-400" />}
            label="Tahmin Yapan Yazar"
            value={`${uniquePredictorIds.size} / ${users.length}`}
          />

          <SmallStat
            icon={<CalendarDays className="h-4 w-4 text-amber-400" />}
            label="Toplam Maç"
            value={matches.length}
          />

          <SmallStat
            icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />}
            label="Gizlilik Koruması"
            value="Aktif (Gizli)"
          />
        </div>

        <div className="border-t border-slate-800/90 p-5 sm:p-6">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Yazar Katılım Durumu
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => {
              const hasSubmitted = uniquePredictorIds.has(user.id);

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 shadow-md backdrop-blur-sm transition-all hover:border-slate-700"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={`shrink-0 ${hasSubmitted ? "" : "grayscale opacity-40"}`}>
                      <UserFlag flagEmoji={user.flagEmoji} className="h-6 w-6 text-xl" />
                    </span>

                    <span className="truncate text-xs font-bold text-white font-sports">
                      {user.name}
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                      hasSubmitted
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    {hasSubmitted ? "Tamamlandı" : "Bekleniyor"}
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
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-xl backdrop-blur-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-800 text-slate-400 border border-slate-700 shadow-inner">
          <CalendarDays className="h-8 w-8 text-amber-400" />
        </div>

        <h3 className="text-xl font-bold text-white font-sports">
          Bu Haftaya Henüz Maç Eklenmemiş
        </h3>

        <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm font-medium text-slate-400">
          Maçlar eklendikten sonra fikstür ve yazar tahminleri burada canlı olarak görüntülenecektir.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/85 shadow-2xl backdrop-blur-xl">
        {/* Header Bar */}
        <div className="relative border-b border-slate-800 bg-slate-950/70 p-5 sm:p-7">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-3/4 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                <Target className="h-3.5 w-3.5" />
                <span>Haftanın Maç Arenası</span>
              </div>

              <h2 className="font-sports mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {label}
              </h2>

              <p className="mt-1 max-w-2xl text-xs sm:text-sm font-medium text-slate-400 leading-relaxed">
                Resmi maç sonuçlarını canlı takip et, detaydan tüm yazarların tahminlerini ve puanlamalarını incele.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 xl:w-[420px]">
              <SmallStat
                icon={<CalendarDays className="h-4 w-4 text-blue-400" />}
                label="Toplam Maç"
                value={sortedMatches.length}
              />

              <SmallStat
                icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />}
                label="Biten Maç"
                value={playedCount}
              />

              <SmallStat
                icon={<Clock3 className="h-4 w-4 text-amber-400" />}
                label="Bekleyen"
                value={pendingCount}
              />
            </div>
          </div>
        </div>

        {/* Matches List */}
        <div className="grid gap-4 p-4 sm:p-6 bg-slate-950/50">
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
                className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/80 shadow-lg backdrop-blur-md transition-all duration-200 hover:border-slate-700 hover:shadow-xl"
              >
                {/* Stadium Light Top Accent Line */}
                <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-500 opacity-75" />

                <button
                  type="button"
                  onClick={() => setExpandedMatchId(expanded ? null : match.id)}
                  className="block w-full p-4.5 text-left transition duration-150 hover:bg-slate-800/30 sm:p-6 cursor-pointer"
                >
                  <div className="flex flex-col gap-4">
                    {/* Top Row: Date & Badges */}
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/20 text-blue-400">
                          <CalendarDays className="h-3.5 w-3.5" />
                        </span>
                        <span>{formatMatchDate(match.matchDate)}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                            resultKnown
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                              : "bg-amber-500/15 border-amber-500/40 text-amber-300"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${resultKnown ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
                          {resultKnown ? "Sonuçlandı" : "Maç Bekleniyor"}
                        </span>

                        <span className="rounded-full bg-slate-800/90 border border-slate-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                          {total} tahmin
                        </span>
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="flex flex-col gap-3 sm:hidden">
                      <div className="flex items-center justify-between">
                        {/* Home Team */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-1 shadow-inner">
                            <TeamLogo teamName={match.homeTeam} className="h-8 w-8 shrink-0 object-contain" />
                          </div>
                          <span className="truncate text-xs font-bold text-white font-sports uppercase">
                            {match.homeTeam}
                          </span>
                        </div>

                        {/* Digital Scoreboard Box */}
                        <div className="mx-2 shrink-0">
                          <div className="min-w-[84px] rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-center shadow-inner">
                            {resultKnown ? (
                              <span className="font-mono text-base font-black text-white tabular-nums tracking-tight">
                                {match.actualHome} : {match.actualAway}
                              </span>
                            ) : (
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">VS</span>
                            )}
                          </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                          <span className="truncate text-xs font-bold text-white font-sports uppercase text-right">
                            {match.awayTeam}
                          </span>
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-1 shadow-inner">
                            <TeamLogo teamName={match.awayTeam} className="h-8 w-8 shrink-0 object-contain" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop View (3 Columns Versus Arena) */}
                    <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] items-center gap-6">
                      {/* Home Team Side */}
                      <div className="min-w-0">
                        <div className="flex items-center justify-end gap-4">
                          <div className="min-w-0 text-right">
                            <div className="truncate text-xl font-bold tracking-tight text-white font-sports uppercase sm:text-2xl">
                              {match.homeTeam}
                            </div>
                            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Ev Sahibi
                            </div>
                          </div>

                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/90 p-2 shadow-inner transition-transform duration-200 hover:scale-105">
                            <TeamLogo
                              teamName={match.homeTeam}
                              className="h-12 w-12 shrink-0 object-contain drop-shadow-md"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Center Digital Scoreboard */}
                      <div className="flex flex-col items-center">
                        <div className="min-w-[120px] rounded-2xl border border-slate-700 bg-slate-950 px-6 py-3 text-center shadow-[0_0_20px_rgba(0,0,0,0.6)]">
                          {resultKnown ? (
                            <div className="font-mono text-3xl font-black text-white tracking-tight tabular-nums sm:text-4xl">
                              {match.actualHome}
                              <span className="mx-2 text-slate-500">:</span>
                              {match.actualAway}
                            </div>
                          ) : (
                            <div className="text-base font-black uppercase tracking-[0.3em] text-slate-400 sm:text-lg">
                              VS
                            </div>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {resultKnown ? (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Resmi Skor</span>
                            </>
                          ) : (
                            <>
                              <Clock3 className="h-3.5 w-3.5 text-amber-400" />
                              <span>Maç Bekleniyor</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Away Team Side */}
                      <div className="min-w-0">
                        <div className="flex items-center justify-start gap-4">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/90 p-2 shadow-inner transition-transform duration-200 hover:scale-105">
                            <TeamLogo
                              teamName={match.awayTeam}
                              className="h-12 w-12 shrink-0 object-contain drop-shadow-md"
                            />
                          </div>

                          <div className="min-w-0 text-left">
                            <div className="truncate text-xl font-bold tracking-tight text-white font-sports uppercase sm:text-2xl">
                              {match.awayTeam}
                            </div>
                            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Deplasman
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Quick Analytics & Accordion Toggle */}
                    <div className="grid gap-2.5 sm:grid-cols-[1fr_1fr_auto] sm:items-center pt-1 border-t border-slate-800/70">
                      <div className="rounded-xl border border-slate-800 bg-slate-800/50 px-3.5 py-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                          <BarChart3 className="h-3.5 w-3.5" />
                          Favori Tahmin
                        </div>
                        <div className="mt-0.5 truncate text-xs sm:text-sm font-bold text-white font-sports">
                          {popularPick}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-800/50 px-3.5 py-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          <Target className="h-3.5 w-3.5" />
                          Puanlama Durumu
                        </div>
                        <div className="mt-0.5 truncate text-xs sm:text-sm font-bold text-white font-sports">
                          {pointsPublished ? "Puanlandı" : "Bekliyor"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-750 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 shadow-sm transition hover:border-slate-600 hover:bg-slate-750 sm:min-w-[130px]">
                        <span>{expanded ? "Detay Kapat" : "Detay Aç"}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-emerald-400 transition-transform duration-300 ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded Predictions Accordion Panel */}
                {expanded && (
                  <div className="border-t border-slate-800 bg-slate-950/80 animate-fadeIn">
                    {/* Accordion Header */}
                    <div className="border-b border-slate-800 bg-slate-900/60 px-5 py-4 sm:px-6">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            Fikstür Detayı
                          </div>

                          <h3 className="font-sports mt-0.5 text-sm sm:text-base font-bold text-white uppercase">
                            {match.homeTeam} - {match.awayTeam}
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {formatMatchDate(match.matchDate)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-center shadow-inner">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Resmi Sonuç
                          </div>

                          <div className="font-mono text-lg sm:text-xl font-black text-white tracking-tight tabular-nums">
                            {resultKnown
                              ? `${match.actualHome} - ${match.actualAway}`
                              : "Sonuç Bekleniyor"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Predictions Distribution */}
                    <div className="p-5 sm:p-6">
                      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Yazar Tahmin Dağılımı
                          </h4>
                          <p className="mt-0.5 text-xs text-slate-300">
                            Yazarların taraf tercihleri ve yüzdeleri
                          </p>
                        </div>

                        <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-[10px] font-bold text-slate-300">
                          {total > 0 ? `${total} Yazar Tahmini` : "Tahmin Yok"}
                        </span>
                      </div>

                      {/* Distribution Progress Bar */}
                      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-inner">
                        <div className="flex h-8 w-full">
                          <div
                            style={{ width: `${homePct}%` }}
                            className="flex items-center justify-center bg-blue-600 font-mono text-[10px] font-extrabold text-white transition-all duration-300"
                          >
                            {homePct >= 12 ? `${homePct}%` : ""}
                          </div>

                          <div
                            style={{ width: `${drawPct}%` }}
                            className="flex items-center justify-center bg-slate-600 font-mono text-[10px] font-extrabold text-slate-200 transition-all duration-300"
                          >
                            {drawPct >= 12 ? `${drawPct}%` : ""}
                          </div>

                          <div
                            style={{ width: `${awayPct}%` }}
                            className="flex items-center justify-center bg-emerald-600 font-mono text-[10px] font-extrabold text-white transition-all duration-300"
                          >
                            {awayPct >= 12 ? `${awayPct}%` : ""}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-wider font-sports">
                        <span className="truncate text-blue-400">
                          {match.homeTeam} ({homeWins})
                        </span>

                        <span className="flex items-center justify-center gap-1 text-slate-400">
                          <Minus className="h-3 w-3" />
                          Beraberlik ({draws})
                        </span>

                        <span className="truncate text-right text-emerald-400">
                          {match.awayTeam} ({awayWins})
                        </span>
                      </div>
                    </div>

                    {/* Author Predictions Cards Matrix */}
                    <div className="border-t border-slate-800 bg-slate-950/60 p-5 sm:p-6">
                      <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Yazar Skor Tahminleri ve Puanlar
                      </div>

                      {matchPredictions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
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
                                className={`relative overflow-hidden rounded-2xl border p-3.5 shadow-md backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 ${status.className}`}
                              >
                                {user.colors && user.colors.length > 0 && (
                                  <div
                                    className="absolute bottom-0 left-0 h-1 w-full opacity-80"
                                    style={{
                                      background:
                                        user.colors.length > 1
                                          ? `linear-gradient(to right, ${user.colors.join(", ")})`
                                          : user.colors[0]
                                    }}
                                  />
                                )}

                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex min-w-0 items-center gap-2.5">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700/80 p-0.5 shadow-inner">
                                      <UserFlag flagEmoji={user.flagEmoji} className="h-6 w-6 text-lg" />
                                    </span>

                                    <div className="min-w-0">
                                      <div className="truncate text-xs font-bold text-white font-sports">
                                        {user.name}
                                      </div>

                                      <div className="mt-0.5 flex items-center gap-1 text-[10px] font-medium opacity-90">
                                        {status.icon}
                                        <span>{status.label}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <div className="font-mono text-base font-black text-white tabular-nums">
                                      {prediction.predictedHome} - {prediction.predictedAway}
                                    </div>

                                    {status.points !== null && (
                                      <div className={`text-[10px] font-bold uppercase tracking-wider ${status.points > 0 ? "text-emerald-400" : "text-slate-500"}`}>
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
                        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-6 text-center">
                          <Sparkles className="mx-auto mb-2 h-5 w-5 text-emerald-400/60" />
                          <p className="text-xs sm:text-sm font-medium text-slate-400">
                            Bu maç için henüz yazar tahmini bulunmuyor.
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
