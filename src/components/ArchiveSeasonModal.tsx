import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trophy, Medal, Calendar, Award, CalendarDays, Loader2 } from "lucide-react";
import { Season, User, Week, Match, Prediction } from "../types";
import UserFlag from "./UserFlag";
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
        const list = snap.docs.map((document) => ({
          id: document.id,
          ...document.data()
        } as Week));

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
          .map((document) => ({
            id: document.id,
            ...document.data()
          } as Match))
          .sort((a, b) => getDateMs(a.matchDate) - getDateMs(b.matchDate));

        setMatches(matchList);

        const predSnap = await getDocs(
          query(
            collection(db, "seasons", season.id, "predictions"),
            where("weekId", "==", selectedWeek.id)
          )
        );

        setPredictions(
          predSnap.docs.map((document) => ({
            id: document.id,
            ...document.data()
          } as Prediction))
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
        <div
          className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 18 }}
          className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-150 bg-slate-50 p-5 sm:p-7">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white">
                <Trophy className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-xl font-black tracking-tight text-slate-850 sm:text-2xl">
                  {season.name} finali
                </h2>

                <div className="mt-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-orange-600">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Final tarihi: {season.finishedAt?.toDate?.()?.toLocaleDateString("tr-TR") || "Bilinmiyor"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-850"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="w-full space-y-8 overflow-y-auto p-5 sm:p-7 bg-white">
            {firstPlace && (
              <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-amber-50/20 p-6 text-center shadow-sm">
                <div className="absolute right-4 top-4 hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 sm:flex">
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                    Şampiyon
                  </span>
                </div>

                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 ring-1 ring-amber-200">
                  <UserFlag flagEmoji={firstPlace.flagEmoji} className="h-14 w-14 text-6xl" />
                </div>

                <h3 className="text-2xl font-black tracking-tight text-slate-850">
                  {firstPlace.name}
                </h3>

                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-amber-800">
                  Zirvenin sahibi
                </p>

                <div className="mx-auto mt-5 grid max-w-md grid-cols-3 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                  <div className="p-4 text-center">
                    <div className="text-xl font-black text-slate-800">
                      {firstPlace.pts}
                    </div>
                    <div className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
                      Puan
                    </div>
                  </div>

                  <div className="border-x border-slate-200 p-4 text-center">
                    <div className="text-xl font-black text-slate-800">
                      {firstPlace.exacts}
                    </div>
                    <div className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
                      Tam skor
                    </div>
                  </div>

                  <div className="p-4 text-center">
                    <div className="text-xl font-black text-slate-800">
                      {firstPlace.results}
                    </div>
                    <div className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
                      Sonuç
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                <Medal className="h-4 w-4 text-orange-600" />
                Sezon sonu genel sıralaması
              </h3>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-150 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                        <th className="px-5 py-4 font-black">Sıra</th>
                        <th className="px-5 py-4 font-black">Yazar</th>
                        <th className="px-5 py-4 text-center font-black">Toplam puan</th>
                        <th className="px-5 py-4 text-center font-black">Tam skor</th>
                        <th className="px-5 py-4 text-center font-black">Sonuç</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rankedUsers.map((user, index) => {
                        const isFirst = index === 0;
                        const isSecond = index === 1;
                        const isThird = index === 2;

                        return (
                          <tr
                            key={user.id}
                            className={`border-b border-slate-100 transition hover:bg-slate-50 ${
                              isFirst ? "bg-amber-50/50 font-bold" : ""
                            }`}
                          >
                            <td className="px-5 py-4 text-sm font-black text-slate-850">
                              {isFirst ? (
                                <Trophy className="h-4 w-4 text-amber-500" />
                              ) : isSecond ? (
                                <Medal className="h-4 w-4 text-slate-400" />
                              ) : isThird ? (
                                <Medal className="h-4 w-4 text-orange-600" />
                              ) : (
                                `${index + 1}.`
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <span className="relative">
                                  <UserFlag flagEmoji={user.flagEmoji} className="h-6 w-6 text-2xl" />
                                  {user.colors && user.colors.length > 0 && (
                                    <div
                                      className="absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full opacity-80"
                                      style={{
                                        background:
                                          user.colors.length > 1
                                            ? `linear-gradient(to right, ${user.colors.join(", ")})`
                                            : user.colors[0]
                                      }}
                                    />
                                  )}
                                </span>

                                <span className="font-black text-slate-800">
                                  {user.name}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-center">
                              <span className="text-base font-black text-slate-850">
                                {user.pts}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-center font-black text-orange-600">
                              {user.exacts}
                            </td>

                            <td className="px-5 py-4 text-center font-bold text-slate-500">
                              {user.results}
                            </td>
                          </tr>
                        );
                      })}

                      {rankedUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-sm font-bold text-slate-500">
                            Bu sezona ait puanlanmış kullanıcı kaydı bulunamadı.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-5 border-t border-slate-200 pt-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-800">
                    <CalendarDays className="h-5 w-5 text-orange-600" />
                    Detaylı hafta sonuçları
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Arşivdeki haftaları seçerek maçları ve tahminleri incele.
                  </p>
                </div>

                {weeks.length > 0 && (
                  <select
                    value={selectedWeek?.id || ""}
                    onChange={(e) => {
                      const found = weeks.find((week) => week.id === e.target.value);
                      if (found) setSelectedWeek(found);
                    }}
                    className="input-field w-full sm:max-w-xs bg-white text-slate-800 border border-slate-200"
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
                <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-12 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
                  <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                    Hafta verileri yükleniyor
                  </span>
                </div>
              ) : selectedWeek ? (
                <motion.div
                  key={selectedWeek.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
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
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <span className="text-sm font-bold text-slate-500">
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
