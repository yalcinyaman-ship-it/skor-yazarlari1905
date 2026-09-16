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
      className: "border-[#E5E7EB] bg-[#F9FAFB] text-gray-600",
      icon: <Clock3 className="h-3.5 w-3.5 text-gray-400" />
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
      className: "border-[#10B981] bg-[#ECFDF5] text-[#065F46] shadow-sm",
      icon: <Trophy className="h-3.5 w-3.5 text-[#059669]" />
    };
  }

  if (resultCorrect) {
    const bonus = correctResultCount === 1 ? 1 : 0;

    return {
      label: bonus ? "Tek bilen sonuç" : "Doğru sonuç",
      points: 1 + bonus,
      className: "border-[#10B981] bg-[#ECFDF5] text-[#065F46] shadow-sm",
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" />
    };
  }

  return {
    label: "Yanlış",
    points: 0,
    className: "border-[#E5E7EB] bg-[#F9FAFB] text-gray-500",
    icon: <XCircle className="h-3.5 w-3.5 text-gray-400" />
  };
};

const SmallStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 shadow-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-xl font-bold tracking-tight text-[#111827]">{value}</div>
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
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] p-5 text-[#111827] sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E25822]">
                <Lock className="h-4 w-4" />
                Hafta kilitli
              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
                {label}
              </h2>

              <p className="mt-1.5 max-w-2xl text-sm text-gray-500">
                Admin haftayı yayınlayana kadar tahmin detayları kapalı kalır.
              </p>
            </div>

            <div className="rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
              Yayın bekliyor
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-7">
          <SmallStat
            icon={<Users className="h-4 w-4 text-[#E25822]" />}
            label="Katılan"
            value={`${uniquePredictorIds.size}/${users.length}`}
          />

          <SmallStat
            icon={<CalendarDays className="h-4 w-4 text-[#E25822]" />}
            label="Maç"
            value={matches.length}
          />

          <SmallStat
            icon={<ShieldCheck className="h-4 w-4 text-[#059669]" />}
            label="Durum"
            value="Gizli"
          />
        </div>

        <div className="border-t border-[#E5E7EB] p-5 sm:p-7">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => {
              const hasSubmitted = uniquePredictorIds.has(user.id);

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`shrink-0 ${hasSubmitted ? "" : "grayscale opacity-40"}`}>
                      <UserFlag flagEmoji={user.flagEmoji} className="h-5 w-5 text-lg" />
                    </span>

                    <span className="truncate text-sm font-bold text-[#111827]">
                      {user.name}
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                      hasSubmitted
                        ? "bg-[#ECFDF5] border-emerald-200 text-[#059669]"
                        : "bg-white border-[#E5E7EB] text-gray-500"
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
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9FAFB] text-gray-500 border border-[#E5E7EB]">
          <CalendarDays className="h-7 w-7 text-[#E25822]" />
        </div>

        <h3 className="text-lg font-bold text-[#111827]">
          Bu haftaya maç eklenmemiş
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          Maçlar admin panelinden eklendiğinde burada listelenecek.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="border-b border-[#E5E7EB] bg-white p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Haftanın Maç Merkezi
              </div>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
                {label}
              </h2>

              <p className="mt-1.5 max-w-2xl text-sm text-gray-600">
                Maçları net gör, sonucu takip et, detaydan herkesin tahminini aç.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 xl:w-[420px]">
              <SmallStat
                icon={<CalendarDays className="h-4 w-4 text-[#E25822]" />}
                label="Maç"
                value={sortedMatches.length}
              />

              <SmallStat
                icon={<ShieldCheck className="h-4 w-4 text-[#059669]" />}
                label="Biten"
                value={playedCount}
              />

              <SmallStat
                icon={<Clock3 className="h-4 w-4 text-[#E25822]" />}
                label="Bekleyen"
                value={pendingCount}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3.5 p-4 sm:p-6 bg-[#F9FAFB]">
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
                style={{
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                  border: "1px solid #E5E7EB",
                  borderRadius: "14px"
                }}
                className="overflow-hidden bg-white transition-all duration-200 hover:border-gray-300"
              >
                <button
                  type="button"
                  onClick={() => setExpandedMatchId(expanded ? null : match.id)}
                  className="block w-full p-4 text-left transition duration-150 hover:bg-[#FAF9F7] sm:p-6"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#111827]">
                        <CalendarDays className="h-4 w-4 text-[#E25822]" />
                        {formatMatchDate(match.matchDate)}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                            resultKnown
                              ? "bg-[#ECFDF5] border-emerald-200 text-[#059669]"
                              : "bg-amber-50 border-amber-200 text-amber-700"
                          }`}
                        >
                          {resultKnown ? "Sonuçlandı" : "Bekliyor"}
                        </span>

                        <span className="rounded-full bg-[#F9FAFB] border border-[#E5E7EB] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          {total} tahmin
                        </span>
                      </div>
                    </div>

                    {/* Mobile layout (stacked & responsive) */}
                    <div className="flex flex-col gap-3 sm:hidden">
                      <div className="flex items-center justify-between">
                        {/* Home Team */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <TeamLogo teamName={match.homeTeam} className="h-9 w-9 shrink-0 drop-shadow-sm" />
                          <span className="truncate text-sm font-bold text-[#111827]">
                            {match.homeTeam}
                          </span>
                        </div>

                        {/* Score/VS block in middle */}
                        <div className="mx-2 shrink-0">
                          <div className="min-w-[76px] rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] px-3 py-2 text-center shadow-sm">
                            {resultKnown ? (
                              <span className="font-mono text-base font-bold text-[#111827]">
                                {match.actualHome} : {match.actualAway}
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">VS</span>
                            )}
                          </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end">
                          <span className="truncate text-sm font-bold text-[#111827] text-right">
                            {match.awayTeam}
                          </span>
                          <TeamLogo teamName={match.awayTeam} className="h-9 w-9 shrink-0 drop-shadow-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Desktop layout (3 columns side-by-side) */}
                    <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] items-center gap-6">
                      <div className="min-w-0">
                        <div className="flex items-center justify-end gap-4">
                          <div className="min-w-0 text-right">
                            <div className="truncate text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
                              {match.homeTeam}
                            </div>
                            <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                              Ev sahibi
                            </div>
                          </div>

                          <TeamLogo
                            teamName={match.homeTeam}
                            className="h-14 w-14 shrink-0 sm:h-16 sm:w-16 drop-shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="min-w-[96px] rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] px-4 py-3 text-center shadow-sm sm:min-w-[120px]">
                          {resultKnown ? (
                            <div className="font-mono text-3xl font-black text-[#111827] sm:text-4xl">
                              {match.actualHome}
                              <span className="mx-1.5 text-gray-400">:</span>
                              {match.actualAway}
                            </div>
                          ) : (
                            <div className="text-sm font-bold uppercase tracking-[0.28em] text-gray-500 sm:text-base">
                              VS
                            </div>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          {resultKnown ? (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5 text-[#059669]" />
                              <span>Resmi skor</span>
                            </>
                          ) : (
                            <>
                              <Clock3 className="h-3.5 w-3.5 text-amber-500" />
                              <span>Maç bekliyor</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center justify-start gap-3">
                          <TeamLogo
                            teamName={match.awayTeam}
                            className="h-12 w-12 shrink-0 sm:h-16 sm:w-16 drop-shadow-sm"
                          />

                          <div className="min-w-0 text-left">
                            <div className="truncate text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
                              {match.awayTeam}
                            </div>
                            <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                              Deplasman
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                      <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#E25822]">
                          <BarChart3 className="h-3.5 w-3.5" />
                          Favori Tahmin
                        </div>
                        <div className="mt-0.5 truncate text-sm font-bold text-[#111827]">
                          {popularPick}
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#059669]">
                          <Target className="h-3.5 w-3.5" />
                          Puan Durumu
                        </div>
                        <div className="mt-0.5 truncate text-sm font-bold text-[#111827]">
                          {pointsPublished ? "Puanlandı" : "Bekliyor"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#111827] shadow-sm transition-all hover:bg-[#F9FAFB] sm:min-w-[130px]">
                        <span>{expanded ? "Kapat" : "Detay Aç"}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-[#E25822] transition-transform duration-300 ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-[#E5E7EB] bg-white">
                    <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-5 py-4 sm:px-6">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#E25822]">
                            Açılan maç
                          </div>

                          <h3 className="mt-1 text-base font-bold text-[#111827]">
                            {match.homeTeam} - {match.awayTeam}
                          </h3>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {formatMatchDate(match.matchDate)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-center shadow-sm">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            Skor
                          </div>

                          <div className="font-mono text-xl font-black text-[#111827] tracking-tight">
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
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            Tahmin dağılımı
                          </h4>

                          <p className="mt-0.5 text-xs text-gray-600">
                            Kim hangi tarafa oynamış, hızlıca gör.
                          </p>
                        </div>

                        <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-0.5 text-[10px] font-bold text-gray-600">
                          {total > 0 ? `${total} tahmin` : "Tahmin yok"}
                        </span>
                      </div>

                      {/* Tahmin Dağılım Çubuğu (% Barı): Terracotta, Taş Rengi, Sakin Lacivert/Antrasit */}
                      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
                        <div className="flex h-10 w-full">
                          <div
                            style={{ width: `${homePct}%` }}
                            className="flex items-center justify-center bg-[#E25822] text-[10px] font-bold text-white transition-all duration-300"
                          >
                            {homePct >= 12 ? `${homePct}%` : ""}
                          </div>

                          <div
                            style={{ width: `${drawPct}%` }}
                            className="flex items-center justify-center bg-[#E5E7EB] text-[10px] font-bold text-[#111827] transition-all duration-300"
                          >
                            {drawPct >= 12 ? `${drawPct}%` : ""}
                          </div>

                          <div
                            style={{ width: `${awayPct}%` }}
                            className="flex items-center justify-center bg-[#334155] text-[10px] font-bold text-white transition-all duration-300"
                          >
                            {awayPct >= 12 ? `${awayPct}%` : ""}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-wider">
                        <span className="truncate text-[#E25822]">
                          {match.homeTeam} ({homeWins})
                        </span>

                        <span className="flex items-center justify-center gap-1 text-gray-600">
                          <Minus className="h-3 w-3" />
                          Beraberlik ({draws})
                        </span>

                        <span className="truncate text-right text-[#334155]">
                          {match.awayTeam} ({awayWins})
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:p-6">
                      {matchPredictions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
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
                                className={`relative overflow-hidden rounded-xl border px-3.5 py-3 shadow-sm transition-all duration-150 hover:-translate-y-0.5 ${status.className}`}
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
                                    <UserFlag flagEmoji={user.flagEmoji} className="h-5 w-5 text-lg" />

                                    <div className="min-w-0">
                                      <div className="truncate text-xs font-bold text-[#111827]">
                                        {user.name}
                                      </div>

                                      <div className="mt-0.5 flex items-center gap-1 text-[10px] font-medium opacity-90">
                                        {status.icon}
                                        <span>{status.label}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <div className="font-mono text-base font-bold text-[#111827]">
                                      {prediction.predictedHome} - {prediction.predictedAway}
                                    </div>

                                    {status.points !== null && (
                                      <div className={`text-[10px] font-bold uppercase tracking-wider ${status.points > 0 ? "text-[#059669]" : "text-gray-400"}`}>
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
                        <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-6 text-center">
                          <Sparkles className="mx-auto mb-2 h-5 w-5 text-[#E25822]/60" />

                          <p className="text-sm font-medium text-gray-500">
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
