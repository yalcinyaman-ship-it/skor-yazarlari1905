import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  Clock3,
  Save,
  ShieldCheck,
  Target,
  Trophy,
  UserRound,
  Users,
  X
} from "lucide-react";
import { User, Match, Week } from "../types";
import UserFlag from "./UserFlag";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from "firebase/firestore";
import { db } from "../firebase";
import TeamLogo from "./TeamLogo";

interface PredictionModalProps {
  isVisible: boolean;
  onClose: () => void;
  users: User[];
  activeWeek: Week;
  matches: Match[];
  seasonId: string;
}

type ScoreSide = "home" | "away";
type PredictionDraft = Record<string, { home?: number; away?: number }>;

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

  return new Date(ms).toLocaleString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const isFilledScore = (value: unknown) => {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
};

const PredictionModal: React.FC<PredictionModalProps> = ({
  isVisible,
  onClose,
  users,
  activeWeek,
  matches,
  seasonId
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<PredictionDraft>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingPredictors, setExistingPredictors] = useState<string[]>([]);

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => getDateMs(a.matchDate) - getDateMs(b.matchDate));
  }, [matches]);

  const completedMatchCount = useMemo(() => {
    return sortedMatches.filter((match) => {
      const prediction = predictions[match.id];

      return (
        isFilledScore(prediction?.home) &&
        isFilledScore(prediction?.away)
      );
    }).length;
  }, [sortedMatches, predictions]);

  const progressPct = sortedMatches.length
    ? Math.round((completedMatchCount / sortedMatches.length) * 100)
    : 0;

  const unpredictedUsers = useMemo(() => {
    return users.filter((user) => !existingPredictors.includes(user.id));
  }, [users, existingPredictors]);

  useEffect(() => {
    if (!isVisible || !activeWeek || !seasonId) return;

    const fetchExisting = async () => {
      try {
        const q = query(
          collection(db, "seasons", seasonId, "predictions"),
          where("weekId", "==", activeWeek.id)
        );

        const snap = await getDocs(q);
        const uids = new Set(
          snap.docs
            .map((document) => document.data().userId)
            .filter(Boolean)
        );

        setExistingPredictors(Array.from(uids));
      } catch (err) {
        console.error("Error fetching existing predictions", err);
      }
    };

    fetchExisting();
  }, [isVisible, activeWeek, seasonId]);

  const resetAndClose = () => {
    onClose();

    setTimeout(() => {
      setStep(1);
      setSelectedUser(null);
      setPredictions({});
      setIsSuccess(false);
      setError(null);
      setIsSubmitting(false);
    }, 250);
  };

  const handleUserSelect = (user: User) => {
    if (existingPredictors.includes(user.id)) return;

    setSelectedUser(user);
    setStep(2);
    setPredictions({});
    setError(null);
  };

  const handleScoreChange = (matchId: string, side: ScoreSide, value: string) => {
    if (value === "") {
      setPredictions((prev) => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          [side]: undefined
        }
      }));
      return;
    }

    const numericValue = Number(value);

    if (!Number.isInteger(numericValue) || numericValue < 0 || numericValue > 30) {
      return;
    }

    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [side]: numericValue
      }
    }));

    setError(null);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    const missingMatches = sortedMatches.filter((match) => {
      const prediction = predictions[match.id];

      return (
        !isFilledScore(prediction?.home) ||
        !isFilledScore(prediction?.away)
      );
    });

    if (missingMatches.length > 0) {
      setError(
        `Eksik skor var. Kaydetmeden önce şu maçları tamamla:\n` +
          missingMatches
            .map((match) => `• ${match.homeTeam} - ${match.awayTeam}`)
            .join("\n")
      );
      return;
    }

    if (sortedMatches.length === 0) {
      setError("Bu haftaya maç eklenmemiş. Tahmin kaydedilemez.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const promises = sortedMatches.map((match) => {
        const prediction = predictions[match.id];
        const targetId = `${selectedUser.id}_${match.id}`;

        return setDoc(doc(db, "seasons", seasonId, "predictions", targetId), {
          userId: selectedUser.id,
          weekId: activeWeek.id,
          matchId: match.id,
          predictedHome: Number(prediction.home),
          predictedAway: Number(prediction.away),
          createdAt: serverTimestamp()
        });
      });

      await Promise.all(promises);

      setExistingPredictors((prev) => {
        if (prev.includes(selectedUser.id)) return prev;
        return [...prev, selectedUser.id];
      });

      setIsSuccess(true);

      setTimeout(() => {
        resetAndClose();
      }, 1500);
    } catch (err: any) {
      setError(`Hata oluştu: ${err?.message || "Tahminler kaydedilemedi."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        onClick={resetAndClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] shadow-2xl"
      >
        <div className="border-b border-white/[0.06] bg-white/[0.04] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                  {activeWeek.label}
                </span>

                <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {step === 1 ? "1/2 Oyuncu" : "2/2 Skor"}
                </span>
              </div>

              <h2 className="mt-3 flex items-center gap-3 text-2xl font-black tracking-[-0.055em] text-white sm:text-3xl">
                {step === 2 && <UserFlag flagEmoji={selectedUser?.flagEmoji} className="h-8 w-8 text-3xl" />}
                {step === 1 ? "Kim tahmin yapıyor?" : `${selectedUser?.name}, skorları gir`}
              </h2>

              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                {step === 1
                  ? "Adını seç. Bu hafta tahmin yapan kişi tekrar listelenmez."
                  : "Her maç için iki skoru da doldur. Eksik maç kalırsa kayıt yapılmaz."}
              </p>
            </div>

            <button
              type="button"
              onClick={resetAndClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-500 shadow-sm transition hover:bg-white/[0.07] hover:text-white"
              aria-label="Tahmin penceresini kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {step === 2 && !isSuccess && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black uppercase tracking-wider text-slate-500">
                <span>
                  Tamamlanan maç: {completedMatchCount}/{sortedMatches.length}
                </span>
                <span>{progressPct}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-orange-600 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto bg-white/[0.03] p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[340px] flex-col items-center justify-center gap-5 rounded-[1.5rem] border border-orange-500/20 bg-white/[0.04] p-8 text-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-orange-600 text-white shadow-lg shadow-emerald-700/20">
                  <CheckCircle className="h-11 w-11" />
                </div>

                <div>
                  <h3 className="text-2xl font-black tracking-[-0.04em] text-white">
                    Tahminler kaydedildi
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                    İşlem tamam. Sonuçlar açıklanınca puanlar haftanın merkezinde görünecek.
                  </p>
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="step1"
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 16, opacity: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <Users className="h-4 w-4 text-orange-400" />
                      Toplam
                    </div>
                    <div className="mt-1 text-2xl font-black text-white">
                      {users.length}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <CheckCircle2 className="h-4 w-4 text-orange-400" />
                      Yapan
                    </div>
                    <div className="mt-1 text-2xl font-black text-white">
                      {existingPredictors.length}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <Clock3 className="h-4 w-4 text-amber-600" />
                      Bekleyen
                    </div>
                    <div className="mt-1 text-2xl font-black text-white">
                      {unpredictedUsers.length}
                    </div>
                  </div>
                </div>

                {unpredictedUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-12 text-center shadow-sm">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
                      <CheckCircle className="h-8 w-8" />
                    </div>

                    <div>
                      <h3 className="text-lg font-black tracking-tight text-white">
                        Herkes tahminini yaptı
                      </h3>

                      <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                        Bu hafta için bekleyen yazar kalmadı. Artık sonuçları bekleme zamanı.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {unpredictedUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleUserSelect(user)}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-500/30 hover:shadow-md active:translate-y-0"
                      >
                        {user.colors && user.colors.length > 0 && (
                          <div
                            className="absolute bottom-0 left-0 h-1.5 w-full opacity-70"
                            style={{
                              background:
                                user.colors.length > 1
                                  ? `linear-gradient(to right, ${user.colors.join(", ")})`
                                  : user.colors[0]
                            }}
                          />
                        )}

                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] ring-1 ring-white/10 transition group-hover:scale-105">
                          <UserFlag flagEmoji={user.flagEmoji} className="h-11 w-11 text-4xl" />
                        </div>

                        <div className="truncate text-sm font-black text-white">
                          {user.name}
                        </div>

                        <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 transition group-hover:bg-orange-500/10 group-hover:text-orange-400">
                          <UserRound className="h-3.5 w-3.5" />
                          Seç
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ x: 16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -16, opacity: 0 }}
                className="space-y-4"
              >
                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm font-bold text-red-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="whitespace-pre-line leading-6">{error}</span>
                  </div>
                )}

                {sortedMatches.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-sm">
                    <Trophy className="mx-auto mb-3 h-8 w-8 text-slate-500" />
                    <h3 className="text-lg font-black text-white">
                      Maç bulunamadı
                    </h3>
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      Bu haftaya maç eklenmeden tahmin girilemez.
                    </p>
                  </div>
                ) : (
                  sortedMatches.map((match, index) => {
                    const prediction = predictions[match.id];
                    const isComplete =
                      isFilledScore(prediction?.home) &&
                      isFilledScore(prediction?.away);

                    return (
                      <div
                        key={match.id}
                        className={`rounded-[1.5rem] border bg-white/[0.04] p-4 shadow-sm transition ${
                          isComplete
                            ? "border-orange-500/25 ring-1 ring-orange-500/20"
                            : "border-white/10"
                        }`}
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                            <Target className="h-4 w-4 text-orange-400" />
                            Maç {index + 1}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="hidden text-[10px] font-black uppercase tracking-wider text-slate-500 sm:inline">
                              {formatMatchDate(match.matchDate)}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                                isComplete
                                  ? "bg-orange-500/15 text-orange-300"
                                  : "bg-white/[0.06] text-slate-500"
                              }`}
                            >
                              {isComplete ? "Tamam" : "Eksik"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <div className="flex min-w-0 items-center justify-end gap-2">
                            <span className="truncate text-right text-xs font-black text-white sm:text-base">
                              {match.homeTeam}
                            </span>

                            <TeamLogo
                              teamName={match.homeTeam}
                              className="h-9 w-9 shrink-0 sm:h-11 sm:w-11"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              max="30"
                              value={prediction?.home ?? ""}
                              onChange={(event) =>
                                handleScoreChange(match.id, "home", event.target.value)
                              }
                              className="h-12 w-12 rounded-xl border border-white/10 bg-white/[0.04] text-center text-xl font-black text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 sm:h-14 sm:w-14"
                              placeholder="0"
                            />

                            <span className="text-sm font-black text-slate-500">:</span>

                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              max="30"
                              value={prediction?.away ?? ""}
                              onChange={(event) =>
                                handleScoreChange(match.id, "away", event.target.value)
                              }
                              className="h-12 w-12 rounded-xl border border-white/10 bg-white/[0.04] text-center text-xl font-black text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 sm:h-14 sm:w-14"
                              placeholder="0"
                            />
                          </div>

                          <div className="flex min-w-0 items-center gap-2">
                            <TeamLogo
                              teamName={match.awayTeam}
                              className="h-9 w-9 shrink-0 sm:h-11 sm:w-11"
                            />

                            <span className="truncate text-left text-xs font-black text-white sm:text-base">
                              {match.awayTeam}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 sm:hidden">
                          {formatMatchDate(match.matchDate)}
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step === 2 && !isSuccess && (
          <div className="grid grid-cols-[1fr_2fr] gap-3 border-t border-white/[0.06] bg-white/[0.04] p-4">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSelectedUser(null);
                setPredictions({});
                setError(null);
              }}
              className="btn-secondary justify-center"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || sortedMatches.length === 0}
              className="btn-primary justify-center"
            >
              {isSubmitting ? (
                "Kaydediliyor..."
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Kaydet
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PredictionModal;