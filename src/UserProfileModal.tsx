import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, TrendingUp, Target, CheckCircle, BarChart3, Activity, PieChart } from "lucide-react";
import { User, Season, Week, Match, Prediction } from "./types";
import UserFlag from "./components/UserFlag";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";
import TeamLogo from "./components/TeamLogo";

const CustomSVGLineChart: React.FC<{ data: { name: string; Puan: number }[] }> = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number } | null>(null);

  if (!data || data.length === 0) return null;

  const width = 500;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map((item) => item.Puan), 10);
  const roundedMaxVal = Math.ceil(maxVal / 5) * 5;

  const points = data.map((item, index) => {
    const x = paddingLeft + (data.length > 1 ? (index / (data.length - 1)) * graphWidth : graphWidth / 2);
    const y = paddingTop + graphHeight - (roundedMaxVal > 0 ? (item.Puan / roundedMaxVal) * graphHeight : 0);

    return {
      x,
      y,
      name: item.name,
      Puan: item.Puan
    };
  });

  const linePath = points.map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`)).join(" ");

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + graphHeight} L ${points[0].x} ${paddingTop + graphHeight} Z`
      : "";

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative mt-4 h-[250px] w-full select-none sm:h-[300px]">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full font-sans">
        {gridLines.map((ratio, index) => {
          const y = paddingTop + graphHeight - ratio * graphHeight;
          const label = Math.round(ratio * roundedMaxVal);

          return (
            <g key={index}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={9}
                className="fill-slate-400 font-bold"
              >
                {label}
              </text>
            </g>
          );
        })}

        {points.map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={height - 8}
            textAnchor="middle"
            fontSize={9}
            className="fill-slate-400 font-bold"
          >
            {point.name.replace("Hafta ", "H")}
          </text>
        ))}

        <defs>
          <linearGradient id="profileChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a6b3d" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#0a6b3d" stopOpacity="0" />
          </linearGradient>
        </defs>

        {points.length > 0 && (
          <>
            {points.length > 1 && <path d={areaPath} fill="url(#profileChartGradient)" />}
            {points.length > 1 && (
              <path
                d={linePath}
                fill="none"
                stroke="#0a6b3d"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </>
        )}

        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredPoint?.index === index ? 6 : 4}
              fill={hoveredPoint?.index === index ? "#0a6b3d" : "#ffffff"}
              stroke="#0a6b3d"
              strokeWidth={2}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={16}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => {
                setHoveredPoint({ index, x: point.x, y: point.y });
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}
      </svg>

      {hoveredPoint !== null && (
        <div
          className="pointer-events-none absolute z-50 flex -translate-x-1/2 flex-col gap-0.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-xs shadow-xl"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100 - 55}px`
          }}
        >
          <span className="font-black text-white">
            {points[hoveredPoint.index].name}
          </span>
          <span className="font-bold text-orange-400">
            Puan: <span className="text-white">{points[hoveredPoint.index].Puan}</span>
          </span>
        </div>
      )}
    </div>
  );
};

interface UserProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  user: User & { totalPoints?: number; exacts?: number; results?: number };
  season: Season;
  weeks: Week[];
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isVisible,
  onClose,
  user,
  season,
  weeks
}) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ name: string; Puan: number }[]>([]);
  const [bestTeam, setBestTeam] = useState<{ team: string; hits: number } | null>(null);
  const [predictionStats, setPredictionStats] = useState({
    exact: 0,
    result: 0,
    wrong: 0,
    total: 0
  });
  const [exactList, setExactList] = useState<{ match: Match; prediction: Prediction; weekNumber: number }[]>([]);
  const [resultList, setResultList] = useState<{ match: Match; prediction: Prediction; weekNumber: number }[]>([]);
  const [wrongList, setWrongList] = useState<{ match: Match; prediction: Prediction; weekNumber: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"exact" | "result" | "wrong">("exact");

  useEffect(() => {
    if (!isVisible) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const predsSnap = await getDocs(
          query(
            collection(db, "seasons", season.id, "predictions"),
            where("userId", "==", user.id)
          )
        );

        const predictions = predsSnap.docs.map((document) => ({
          id: document.id,
          ...document.data()
        } as Prediction));

        const publishedWeeks = weeks
          .filter((week) => week.isPublished)
          .sort((a, b) => a.weekNumber - b.weekNumber);

        const allMatches: Record<string, Match> = {};
        const matchIdToWeekNumber: Record<string, number> = {};
        const weekPointsData: { name: string; Puan: number }[] = [];

        let exactCount = 0;
        let resultCount = 0;
        let wrongCount = 0;

        const teamHits: Record<string, number> = {};

        for (const week of publishedWeeks) {
          const matchesSnap = await getDocs(
            collection(db, "seasons", season.id, "weeks", week.id, "matches")
          );

          matchesSnap.forEach((document) => {
            const matchData = {
              id: document.id,
              ...document.data()
            } as Match;
            allMatches[document.id] = matchData;
            matchIdToWeekNumber[document.id] = week.weekNumber;
          });

          const pointsDoc = await getDoc(
            doc(db, "seasons", season.id, "weekPoints", week.id, "userPoints", user.id)
          );

          const points = pointsDoc.exists() ? pointsDoc.data()?.totalWeekPoints || 0 : 0;

          weekPointsData.push({
            name: `Hafta ${week.weekNumber}`,
            Puan: points
          });
        }

        setChartData(weekPointsData);

        const getResult = (home: number, away: number) => {
          if (home > away) return "home";
          if (home < away) return "away";
          return "draw";
        };

        const tempExacts: { match: Match; prediction: Prediction; weekNumber: number }[] = [];
        const tempResults: { match: Match; prediction: Prediction; weekNumber: number }[] = [];
        const tempWrongs: { match: Match; prediction: Prediction; weekNumber: number }[] = [];

        predictions.forEach((prediction) => {
          const match = allMatches[prediction.matchId];

          if (match && match.actualHome !== null && match.actualAway !== null) {
            const isExact =
              match.actualHome === prediction.predictedHome &&
              match.actualAway === prediction.predictedAway;

            const isResult =
              getResult(match.actualHome, match.actualAway) ===
              getResult(prediction.predictedHome, prediction.predictedAway);

            const item = {
              match,
              prediction,
              weekNumber: matchIdToWeekNumber[prediction.matchId] || 1
            };

            if (isExact) {
              exactCount++;
              tempExacts.push(item);
              teamHits[match.homeTeam] = (teamHits[match.homeTeam] || 0) + 2;
              teamHits[match.awayTeam] = (teamHits[match.awayTeam] || 0) + 2;
            } else if (isResult) {
              resultCount++;
              tempResults.push(item);
              teamHits[match.homeTeam] = (teamHits[match.homeTeam] || 0) + 1;
              teamHits[match.awayTeam] = (teamHits[match.awayTeam] || 0) + 1;
            } else {
              wrongCount++;
              tempWrongs.push(item);
            }
          }
        });

        const sortFn = (a: any, b: any) => b.weekNumber - a.weekNumber;
        setExactList(tempExacts.sort(sortFn));
        setResultList(tempResults.sort(sortFn));
        setWrongList(tempWrongs.sort(sortFn));

        let bestTeamName: string | null = null;
        let maxHits = -1;

        Object.entries(teamHits).forEach(([team, hits]) => {
          if (hits > maxHits) {
            maxHits = hits;
            bestTeamName = team;
          }
        });

        setBestTeam(bestTeamName ? { team: bestTeamName, hits: maxHits } : null);

        setPredictionStats({
          exact: exactCount,
          result: resultCount,
          wrong: wrongCount,
          total: exactCount + resultCount + wrongCount
        });
      } catch (err) {
        console.error("Error fetching user stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isVisible, user.id, season.id, weeks]);

  const getActiveList = () => {
    if (selectedCategory === "exact") return exactList;
    if (selectedCategory === "result") return resultList;
    return wrongList;
  };

  if (!isVisible) return null;

  const exactRate =
    predictionStats.total > 0
      ? Math.round((predictionStats.exact / predictionStats.total) * 100)
      : 0;

  const exactWidth = (predictionStats.exact / (predictionStats.total || 1)) * 100;
  const resultWidth = (predictionStats.result / (predictionStats.total || 1)) * 100;
  const wrongWidth = (predictionStats.wrong / (predictionStats.total || 1)) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 18 }}
          className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/[0.03] ring-1 ring-white/10">
                <UserFlag flagEmoji={user.flagEmoji} className="h-11 w-11 text-5xl" />
              </div>

              <div className="min-w-0">
                <h2 className="font-display truncate text-2xl font-black uppercase tracking-[-0.01em] text-white sm:text-3xl">
                  {user.name}
                </h2>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.24em] text-orange-400">
                  Sezon profili
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="w-full overflow-y-auto p-5 sm:p-7">
            {loading ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-orange-400">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                <div className="text-xs font-black uppercase tracking-[0.24em]">
                  Veriler yükleniyor
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center shadow-sm">
                    <Target className="mx-auto mb-2 h-6 w-6 text-white" />
                    <div className="stat-number text-3xl font-black text-white">
                      {user.totalPoints || 0}
                    </div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Toplam puan
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center shadow-sm">
                    <CheckCircle className="mx-auto mb-2 h-6 w-6 text-orange-400" />
                    <div className="stat-number text-3xl font-black text-orange-400">
                      {predictionStats.exact}
                    </div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Tam skor
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center shadow-sm">
                    <TrendingUp className="mx-auto mb-2 h-6 w-6 text-sky-400" />
                    <div className="stat-number text-3xl font-black text-white">
                      {exactRate}%
                    </div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Tam skor oranı
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-sm sm:p-6">
                  <div className="mb-5">
                    <h3 className="font-display flex items-center gap-2 text-lg font-black uppercase tracking-[-0.01em] text-white">
                      <PieChart className="h-5 w-5 text-orange-400" />
                      Tahmin analizi
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Tam skor, doğru sonuç ve yanlış tahmin dağılımı. Detaylar için aşağıdaki kartlara tıklayabilirsiniz.
                    </p>
                  </div>

                  <div className="flex h-4 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      style={{ width: `${exactWidth}%` }}
                      className="h-full bg-orange-600"
                      title="Tam skor"
                    />
                    <div
                      style={{ width: `${resultWidth}%` }}
                      className="h-full bg-amber-400"
                      title="Sonuç"
                    />
                    <div
                      style={{ width: `${wrongWidth}%` }}
                      className="h-full bg-red-500"
                      title="Yanlış"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("exact")}
                      className={`group rounded-2xl p-4 text-left transition-all border-2 flex flex-col justify-between ${
                        selectedCategory === "exact"
                          ? "border-orange-500 bg-orange-500/10 shadow-sm"
                          : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-wider text-orange-400">
                        Tam skor
                      </div>
                      <div className="mt-2 flex items-baseline justify-between w-full">
                        <span className="stat-number text-2xl font-black text-white">
                          {predictionStats.exact}
                        </span>
                        <span className="text-[10px] font-black uppercase text-orange-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          GÖSTER
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCategory("result")}
                      className={`group rounded-2xl p-4 text-left transition-all border-2 flex flex-col justify-between ${
                        selectedCategory === "result"
                          ? "border-amber-400 bg-amber-400/10 shadow-sm"
                          : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                        Sonuç
                      </div>
                      <div className="mt-2 flex items-baseline justify-between w-full">
                        <span className="stat-number text-2xl font-black text-white">
                          {predictionStats.result}
                        </span>
                        <span className="text-[10px] font-black uppercase text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          GÖSTER
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCategory("wrong")}
                      className={`group rounded-2xl p-4 text-left transition-all border-2 flex flex-col justify-between ${
                        selectedCategory === "wrong"
                          ? "border-red-400 bg-red-400/10 shadow-sm"
                          : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-wider text-red-300">
                        Yanlış
                      </div>
                      <div className="mt-2 flex items-baseline justify-between w-full">
                        <span className="stat-number text-2xl font-black text-white">
                          {predictionStats.wrong}
                        </span>
                        <span className="text-[10px] font-black uppercase text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          GÖSTER
                        </span>
                      </div>
                    </button>
                  </div>

                  <div className="mt-6 border-t border-white/[0.06] pt-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {selectedCategory === "exact"
                          ? "Tam Skor Bildiği Maçlar"
                          : selectedCategory === "result"
                          ? "Sadece Sonucunu Bildiği Maçlar"
                          : "Yanlış Tahmin Ettiği Maçlar"}
                      </h4>
                      <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-black text-slate-500">
                        {getActiveList().length} Maç
                      </span>
                    </div>

                    {getActiveList().length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {getActiveList().map(({ match, prediction, weekNumber }) => (
                          <div
                            key={match.id}
                            className={`rounded-2xl border p-4 bg-white/[0.03] flex flex-col justify-between transition hover:bg-white/[0.04] hover:shadow-sm ${
                              selectedCategory === "exact"
                                ? "border-orange-500/20"
                                : selectedCategory === "result"
                                ? "border-amber-400/20"
                                : "border-red-400/20"
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-3">
                              <span className="text-[10px] font-black text-slate-500">
                                Hafta {weekNumber}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                  selectedCategory === "exact"
                                    ? "bg-orange-500/15 text-orange-300"
                                    : selectedCategory === "result"
                                    ? "bg-amber-400/15 text-amber-300"
                                    : "bg-red-400/15 text-red-300"
                                }`}
                              >
                                {selectedCategory === "exact"
                                  ? "Tam Skor"
                                  : selectedCategory === "result"
                                  ? "Doğru Sonuç"
                                  : "Yanlış"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 flex-1 items-center gap-2">
                                <TeamLogo teamName={match.homeTeam} size="sm" className="h-8 w-8 shrink-0" />
                                <span className="truncate text-sm font-black text-white">
                                  {match.homeTeam}
                                </span>
                              </div>

                              <div className="shrink-0 text-center px-2 py-1 bg-white/[0.04] border border-white/10 rounded-xl min-w-[56px] font-mono text-xs font-black text-white">
                                {match.actualHome} - {match.actualAway}
                              </div>

                              <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
                                <span className="truncate text-sm font-black text-white">
                                  {match.awayTeam}
                                </span>
                                <TeamLogo teamName={match.awayTeam} size="sm" className="h-8 w-8 shrink-0" />
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-1.5 border border-white/[0.06] text-xs">
                              <span className="font-bold text-slate-500">
                                Yazar Tahmini
                              </span>
                              <span className="font-mono font-black text-slate-500">
                                {prediction.predictedHome} - {prediction.predictedAway}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
                        <p className="text-sm font-bold text-slate-500">
                          Bu kategoride henüz maç bulunamadı.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserProfileModal;