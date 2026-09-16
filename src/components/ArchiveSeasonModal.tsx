import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Trophy,
  Medal,
  Calendar,
  Award,
  CalendarDays,
  Loader2,
  Crown,
  Sparkles,
  ChevronRight,
  Target
} from "lucide-react";
import { Season, User, Week, Match, Prediction } from "../types";
import UserFlag from "./UserFlag";
import { flagUrlForEmoji } from "../flags";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { db } from "../firebase";
import WeekMatches from "../WeekMatches";

interface ArchiveSeasonModalProps {
  isVisible: boolean;
  onClose: () => void;
  season: Season;
  users: User[];
}

const getDateMs = (date: any) => {
  if (!date) return 0;
  if (typeof date.toDate === "function") return date.toDate().getTime();
  if (date.seconds) return date.seconds * 1000;
  if (date instanceof Date) return date.getTime();
  if (typeof date === "string") return new Date(date).getTime();
  return 0;
};

const ArchiveSeasonModal: React.FC<ArchiveSeasonModalProps> = ({
  isVisible,
  onClose,
  season,
  users
}) => {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const rankedUsers = useMemo(() => {
    return users
      .map((user) => {
        const pts = (user.seasonPoints && user.seasonPoints[season.id]) || 0;
        const exacts = (user.seasonExacts && user.seasonExacts[season.id]) || 0;
        const results = (user.seasonResults && user.seasonResults[season.id]) || 0;

        return {
          ...user,
          pts,
          exacts,
          results
        };
      })
      .filter((user) => user.pts > 0)
      .sort((a, b) => b.pts - a.pts || b.exacts - a.exacts || b.results - a.results);
  }, [users, season.id]);

  const firstPlace = rankedUsers[0];

  useEffect(() => {
    if (!isVisible) return;

    const fetchWeeks = async () => {
      try {
        const qWeeks = query(
          collection(db, "seasons", season.id, "weeks"),
          orderBy("weekNumber")
        );

        const snap = await getDocs(qWeeks);
        const list = snap.docs.map(
          (document) =>
            ({
              id: document.id,
              ...document.data()
            } as Week)
        );

        setWeeks(list);

        if (list.length > 0) {
          setSelectedWeek(list[0]);
        } else {
          setSelectedWeek(null);
        }
      } catch (err) {
        console.error("Error fetching archive weeks:", err);
      }
    };

    fetchWeeks();
  }, [isVisible, season.id]);

  useEffect(() => {
    if (!isVisible || !selectedWeek) return;

    const fetchWeekDetails = async () => {
      setIsLoading(true);

      try {
        const matchSnap = await getDocs(
          collection(db, "seasons", season.id, "weeks", selectedWeek.id, "matches")
        );

        const matchList = matchSnap.docs
          .map(
            (document) =>
              ({
                id: document.id,
                ...document.data()
              } as Match)
          )
          .sort((a, b) => getDateMs(a.matchDate) - getDateMs(b.matchDate));

        setMatches(matchList);

        const predSnap = await getDocs(
          query(
            collection(db, "seasons", season.id, "predictions"),
            where("weekId", "==", selectedWeek.id)
          )
        );

        setPredictions(
          predSnap.docs.map(
            (document) =>
              ({
                id: document.id,
                ...document.data()
              } as Prediction)
          )
        );
      } catch (err) {
        console.error("Error fetching week detail data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeekDetails();
  }, [isVisible, season.id, selectedWeek]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-xl"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 18 }}
          className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/95 text-white shadow-2xl backdrop-blur-2xl ring-1 ring-slate-800"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/80 p-5 sm:p-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Trophy className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-300 font-mono">
                    Hall of Fame
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Lig Arşivi</span>
                </div>

                <h2 className="font-sports mt-0.5 truncate text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                  {season.name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  Kapanış:{" "}
                  {season.finishedAt?.toDate?.()?.toLocaleDateString("tr-TR") || "Tamamlandı"}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white cursor-pointer"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="w-full space-y-6 overflow-y-auto p-5 sm:p-7 bg-slate-950/50">
            {/* Şampiyon Podyumu (Hall of Fame Champion) */}
            {firstPlace ? (
              <div className="relative overflow-hidden rounded-3xl border border-amber-400/50 bg-gradient-to-b from-amber-500/15 via-slate-900/90 to-slate-950/95 p-6 text-center shadow-[0_0_35px_rgba(245,158,11,0.15)] backdrop-blur-xl">
                {/* Crown badge */}
                <div className="absolute right-4 top-4 hidden sm:flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                  <Crown className="h-3.5 w-3.5 text-amber-400" />
                  <span>ŞAMPİYON</span>
                </div>

                <div className="mx-auto mb-3 relative flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-400/60 bg-slate-900 p-2 shadow-inner ring-4 ring-amber-400/20">
                  {firstPlace.clubLogo || flagUrlForEmoji(firstPlace.flagEmoji, 80) ? (
                    <img
                      src={firstPlace.clubLogo || flagUrlForEmoji(firstPlace.flagEmoji, 80)!}
                      alt={firstPlace.name}
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 object-contain drop-shadow-md"
                      loading="lazy"
                    />
                  ) : (
                    <UserFlag flagEmoji={firstPlace.flagEmoji} className="h-14 w-14 text-5xl" />
                  )}
                  <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-mono text-xs font-black ring-2 ring-slate-950">
                    👑
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <h3 className="font-sports text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
                    {firstPlace.name}
                  </h3>
                  <Sparkles className="h-4 w-4 text-amber-400" />
                </div>

                <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.22em] text-amber-400/90">
                  Sezon Şampiyonu
                </p>

                {/* Score Stats Grid */}
                <div className="mx-auto mt-5 grid max-w-md grid-cols-3 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-md">
                  <div className="p-3.5 text-center">
                    <div className="font-mono text-2xl font-black text-amber-400 tabular-nums">
                      {firstPlace.pts}
                    </div>
                    <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                      TOPLAM PUAN
                    </div>
                  </div>

                  <div className="border-x border-slate-800 p-3.5 text-center">
                    <div className="font-mono text-2xl font-black text-emerald-400 tabular-nums">
                      {firstPlace.exacts}
                    </div>
                    <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                      TAM SKOR
                    </div>
                  </div>

                  <div className="p-3.5 text-center">
                    <div className="font-mono text-2xl font-black text-blue-400 tabular-nums">
                      {firstPlace.results}
                    </div>
                    <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                      DOĞRU SONUÇ
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-bold text-blue-300">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  Sezon Tamamlanmadı / Arşivleniyor
                </span>
                <p className="mt-2 text-xs text-slate-400">
                  Bu arşiv kaydı için nihai şampiyonluk puanları henüz sisteme işleniyor.
                </p>
              </div>
            )}

            {/* Sezon Sonu Genel Sıralaması */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-sports text-sm sm:text-base font-bold uppercase tracking-wider text-slate-200">
                  <Medal className="h-4 w-4 text-amber-400" />
                  Nihai Lig Tablosu
                </h3>

                <span className="font-mono text-xs font-bold text-slate-400">
                  {rankedUsers.length} Oyuncu
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-3 text-center w-14">#</th>
                        <th className="px-4 py-3 font-bold">YAZAR</th>
                        <th className="px-4 py-3 text-center font-bold">TAM SKOR</th>
                        <th className="px-4 py-3 text-center font-bold">DOĞRU SONUÇ</th>
                        <th className="px-4 py-3 text-right font-bold font-mono">TOPLAM PUAN</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800/70">
                      {rankedUsers.map((user, index) => {
                        const isFirst = index === 0;
                        const isSecond = index === 1;
                        const isThird = index === 2;

                        return (
                          <tr
                            key={user.id}
                            className={`transition hover:bg-slate-850/60 ${
                              isFirst ? "bg-amber-500/10" : ""
                            }`}
                          >
                            <td className="px-4 py-3 text-center">
                              {isFirst ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400 font-mono text-xs font-black text-slate-950">
                                  1
                                </span>
                              ) : isSecond ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-300 font-mono text-xs font-black text-slate-950">
                                  2
                                </span>
                              ) : isThird ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-amber-700 font-mono text-xs font-black text-white">
                                  3
                                </span>
                              ) : (
                                <span className="font-mono text-xs font-bold text-slate-500">
                                  {index + 1}
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-0.5">
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

                                <span
                                  className={`font-sports text-sm font-bold uppercase ${
                                    isFirst
                                      ? "text-amber-400"
                                      : isSecond
                                      ? "text-slate-200"
                                      : isThird
                                      ? "text-amber-300"
                                      : "text-slate-300"
                                  }`}
                                >
                                  {user.name}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex min-w-[32px] justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
                                {user.exacts}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex min-w-[32px] justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 font-mono text-xs font-bold text-blue-400">
                                {user.results}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <span
                                className={`font-mono text-base font-black tabular-nums ${
                                  isFirst ? "text-amber-400" : "text-white"
                                }`}
                              >
                                {user.pts}
                              </span>
                            </td>
                          </tr>
                        );
                      })}

                      {rankedUsers.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-xs font-semibold text-slate-400"
                          >
                            Bu sezona ait puanlanmış kullanıcı kaydı bulunamadı.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Detaylı Hafta Sonuçları (Week Matches Archive) */}
            <div className="space-y-4 border-t border-slate-800 pt-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="flex items-center gap-2 font-sports text-base font-bold uppercase tracking-wider text-white">
                    <CalendarDays className="h-5 w-5 text-blue-400" />
                    Haftalık Maç ve Tahmin Arşivi
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Oynanan haftayı seçerek yazarların tahminlerini ve maç sonuçlarını inceleyin.
                  </p>
                </div>

                {weeks.length > 0 && (
                  <select
                    value={selectedWeek?.id || ""}
                    onChange={(e) => {
                      const found = weeks.find((week) => week.id === e.target.value);
                      if (found) setSelectedWeek(found);
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-inner outline-none transition focus:border-blue-500"
                  >
                    {weeks.map((week) => (
                      <option key={week.id} value={week.id}>
                        {week.label || `${week.weekNumber}. Hafta`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
                    Hafta Verileri Yükleniyor...
                  </span>
                </div>
              ) : selectedWeek ? (
                <motion.div
                  key={selectedWeek.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-xl"
                >
                  <WeekMatches
                    label={selectedWeek.label}
                    matches={matches}
                    predictions={predictions}
                    users={users}
                    isPublished={true}
                    pointsPublished={true}
                  />
                </motion.div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
                  <span className="text-xs font-semibold text-slate-400">
                    Sezona ait haftalık detay bulunamadı.
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ArchiveSeasonModal;

