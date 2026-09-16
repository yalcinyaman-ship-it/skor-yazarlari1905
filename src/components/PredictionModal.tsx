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
  serverTimestamp,
  writeBatch
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

  return new Date(ms).toLocaleDateString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
};

const isFilledScore = (value: unknown) => {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
};

const isMatchLocked = (_match: Match) => {
  // Zaman kilitlenmesi kaldırıldı - Tüm maçlar tahmine açık
  return false;
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
      if (isMatchLocked(match)) return false;
      const prediction = predictions[match.id];

      return (
        isFilledScore(prediction?.home) &&
        isFilledScore(prediction?.away)
      );
    }).length;
  }, [sortedMatches, predictions]);

  const openMatchCount = sortedMatches.filter((match) => !isMatchLocked(match)).length;

  const progressPct = openMatchCount
    ? Math.round((completedMatchCount / openMatchCount) * 100)
    : 0;

  const unpredictedUsers = useMemo(() => {
    return users.filter((user) => !existingPredictors.includes(user.id));
  }, [users, existingPredictors]);

  useEffect(() => {
    if (!isVisible || !activeWeek || !seasonId) return;

    const fetchExisting = async () => {
      try {
        const submissionSnap = await getDocs(
          collection(db, "seasons", seasonId, "weeks", activeWeek.id, "submissions")
        );
        const uids = new Set(
          submissionSnap.docs
            .map((document) => document.data().userId || document.id)
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

    const openMatches = sortedMatches.filter((match) => !isMatchLocked(match));

    const missingMatches = openMatches.filter((match) => {
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

    if (openMatches.length === 0) {
      setError("Tahmine açık maç kalmadı.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const batch = writeBatch(db);

      openMatches.forEach((match) => {
        const prediction = predictions[match.id];
        const targetId = `${selectedUser.id}_${match.id}`;

        batch.set(doc(db, "seasons", seasonId, "predictions", targetId), {
          userId: selectedUser.id,
          weekId: activeWeek.id,
          matchId: match.id,
          predictedHome: Number(prediction.home),
          predictedAway: Number(prediction.away),
          createdAt: serverTimestamp()
        });
      });

      batch.set(
        doc(db, "seasons", seasonId, "weeks", activeWeek.id, "submissions", selectedUser.id),
        {
          userId: selectedUser.id,
          createdAt: serverTimestamp()
        }
      );

      await batch.commit();

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
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={resetAndClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-950/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl text-slate-100"
      >
        {/* Modal Header */}
        <div className="relative shrink-0 overflow-hidden border-b border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md">
          {/* Subtle Top Stadium Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-3/4 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                  {activeWeek.label}
                </span>

                <span className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                  {step === 1 ? "1/2 Yazar Seçimi" : "2/2 Skor Girişi"}
                </span>
              </div>

              <h2 className="mt-3 flex items-center gap-3 text-xl font-bold leading-tight tracking-tight text-white font-sports sm:text-2xl">
                {step === 2 && (
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-0.5 shadow-inner">
                    <UserFlag flagEmoji={selectedUser?.flagEmoji} className="h-7 w-7 text-2xl" />
                  </span>
                )}
                <span>
                  {step === 1 ? "Kim tahmin yapıyor?" : `${selectedUser?.name}, skorları gir`}
                </span>
              </h2>

              <p className="mt-1.5 hidden max-w-2xl text-xs sm:text-sm font-medium leading-relaxed text-slate-400 sm:block">
                {step === 1
                  ? "Tahmin yapacak yazarı seç. Bu hafta tahmin gönderen yazar tekrar listelenmez."
                  : "Her maç için skorları gir. Eksik maç kalırsa kayıt işlemi tamamlanmaz."}
              </p>
            </div>

            <button
              type="button"
              onClick={resetAndClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
              aria-label="Tahmin penceresini kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {step === 2 && !isSuccess && (
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-emerald-400" />
                  Tamamlanan Maç: <strong className="text-white font-mono">{completedMatchCount}/{openMatchCount}</strong>
                </span>
                <span className="font-mono text-emerald-400 font-extrabold">{progressPct}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-900 border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto bg-slate-950/90 p-4 sm:p-6 scrollbar-thin">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[340px] flex-col items-center justify-center gap-5 rounded-3xl border border-emerald-500/40 bg-emerald-950/30 p-8 text-center shadow-[0_0_40px_rgba(16,185,129,0.15)]"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                  <CheckCircle className="h-11 w-11 stroke-[2.2]" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white font-sports">
                    Tahminler Başarıyla Kaydedildi
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-300">
                    Haftalık maçlar oynandıkça puanlar otomatik hesaplanıp puan tablosuna yansıtılacaktır.
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
                {/* Stats Summary Tiles */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-md backdrop-blur-sm sm:p-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <Users className="h-4 w-4 text-blue-400" />
                      Toplam Yazar
                    </div>
                    <div className="mt-1 font-mono text-xl font-black text-white tabular-nums sm:text-2xl">
                      {users.length}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-md backdrop-blur-sm sm:p-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Tahmin Yapan
                    </div>
                    <div className="mt-1 font-mono text-xl font-black text-emerald-400 tabular-nums sm:text-2xl">
                      {existingPredictors.length}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-md backdrop-blur-sm sm:p-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <Clock3 className="h-4 w-4 text-amber-400" />
                      Bekleyen
                    </div>
                    <div className="mt-1 font-mono text-xl font-black text-amber-400 tabular-nums sm:text-2xl">
                      {unpredictedUsers.length}
                    </div>
                  </div>
                </div>

                {unpredictedUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 px-4 py-12 text-center shadow-xl">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <CheckCircle className="h-8 w-8 stroke-[2]" />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-white font-sports">
                        Tüm Yazarlar Tahminlerini Tamamladı
                      </h3>

                      <p className="mt-1.5 max-w-md text-xs sm:text-sm font-medium leading-relaxed text-slate-400">
                        Bu hafta için bekleyen yazar kalmadı. Maçlar oynandıkça sonuçları takip edebilirsiniz.
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
                        className="group relative overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/70 p-4 text-center shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:bg-slate-850 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] active:translate-y-0 cursor-pointer"
                      >
                        {user.colors && user.colors.length > 0 && (
                          <div
                            className="absolute bottom-0 left-0 h-1.5 w-full opacity-80"
                            style={{
                              background:
                                user.colors.length > 1
                                  ? `linear-gradient(to right, ${user.colors.join(", ")})`
                                  : user.colors[0]
                            }}
                          />
                        )}

                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/90 border border-slate-700/80 p-1 shadow-inner transition-transform duration-200 group-hover:scale-105 group-hover:border-emerald-500/40">
                          <UserFlag flagEmoji={user.flagEmoji} className="h-11 w-11 text-4xl" />
                        </div>

                        <div className="truncate text-sm font-bold text-white font-sports tracking-wide">
                          {user.name}
                        </div>

                        <div className="mt-2.5 inline-flex items-center justify-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 transition-all duration-200 group-hover:bg-emerald-500 group-hover:text-slate-950 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.4)]">
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
                  <div className="flex items-start gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/15 p-4 text-xs sm:text-sm font-semibold text-rose-300 shadow-md">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <span className="whitespace-pre-line leading-relaxed">{error}</span>
                  </div>
                )}

                {sortedMatches.length === 0 ? (
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center shadow-xl">
                    <Trophy className="mx-auto mb-3 h-8 w-8 text-slate-500" />
                    <h3 className="text-lg font-bold text-white font-sports">
                      Bu Haftaya Maç Eklenmemiş
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-400">
                      Maçlar eklendikten sonra tahmin girişi yapılabilir.
                    </p>
                  </div>
                ) : (
                  sortedMatches.map((match, index) => {
                    const prediction = predictions[match.id];
                    const locked = isMatchLocked(match);
                    const isComplete =
                      isFilledScore(prediction?.home) &&
                      isFilledScore(prediction?.away);

                    return (
                      <div
                        key={match.id}
                        className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-lg backdrop-blur-md transition-all duration-200 ${
                          locked
                            ? "border-slate-800 bg-slate-900/40 opacity-70"
                            : isComplete
                            ? "border-emerald-500/40 bg-slate-900/80 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "border-slate-800/90 bg-slate-900/60 hover:border-slate-700/90"
                        }`}
                      >
                        {/* Top Indicator Line */}
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                            <Target className="h-3.5 w-3.5" />
                            Maç {index + 1}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="hidden text-[10px] font-semibold text-slate-400 sm:inline">
                              {formatMatchDate(match.matchDate)}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                locked
                                  ? "bg-slate-800 border-slate-700 text-slate-400"
                                  : isComplete
                                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                  : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                              }`}
                            >
                              {locked ? "Kilitli" : isComplete ? "Tamamlandı" : "Eksik"}
                            </span>
                          </div>
                        </div>

                        {/* Mobile View */}
                        <div className="flex flex-col gap-3 sm:hidden">
                          <div className="flex items-center justify-between gap-2">
                            {/* Home Team */}
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-1 shadow-inner">
                                <TeamLogo teamName={match.homeTeam} className="h-7 w-7 object-contain" />
                              </div>
                              <span className="text-xs font-bold text-white font-sports truncate uppercase">
                                {match.homeTeam}
                              </span>
                            </div>

                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">VS</span>

                            {/* Away Team */}
                            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                              <span className="text-xs font-bold text-white font-sports truncate uppercase text-right">
                                {match.awayTeam}
                              </span>
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-1 shadow-inner">
                                <TeamLogo teamName={match.awayTeam} className="h-7 w-7 object-contain" />
                              </div>
                            </div>
                          </div>

                          {/* Mobile Score Inputs */}
                          <div className="flex items-center justify-center gap-3 pt-1">
                            <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-2 justify-center shadow-inner">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">EV</span>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min="0"
                                  max="30"
                                  disabled={locked}
                                  value={prediction?.home ?? ""}
                                  onChange={(event) =>
                                    handleScoreChange(match.id, "home", event.target.value)
                                  }
                                  className="h-11 w-12 rounded-xl border border-slate-700 bg-slate-900 text-center font-mono text-xl font-black text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25 placeholder:text-slate-700"
                                  placeholder="0"
                                />
                              </div>

                              <span className="text-lg font-black text-slate-600 px-1">:</span>

                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min="0"
                                  max="30"
                                  disabled={locked}
                                  value={prediction?.away ?? ""}
                                  onChange={(event) =>
                                    handleScoreChange(match.id, "away", event.target.value)
                                  }
                                  className="h-11 w-12 rounded-xl border border-slate-700 bg-slate-900 text-center font-mono text-xl font-black text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25 placeholder:text-slate-700"
                                  placeholder="0"
                                />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">DEP</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Desktop View (Versus Card Grid) */}
                        <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                          {/* Home Team */}
                          <div className="flex min-w-0 items-center justify-end gap-3">
                            <span className="truncate text-right text-sm font-bold text-white font-sports uppercase tracking-wide">
                              {match.homeTeam}
                            </span>
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/90 p-1.5 shadow-inner">
                              <TeamLogo
                                teamName={match.homeTeam}
                                className="h-9 w-9 shrink-0 object-contain"
                              />
                            </div>
                          </div>

                          {/* Inputs Container */}
                          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-inner">
                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              max="30"
                              disabled={locked}
                              value={prediction?.home ?? ""}
                              onChange={(event) =>
                                handleScoreChange(match.id, "home", event.target.value)
                              }
                              className="h-13 w-14 rounded-xl border border-slate-700 bg-slate-900 text-center font-mono text-2xl font-black text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 shadow-inner placeholder:text-slate-700"
                              placeholder="0"
                            />

                            <span className="text-xl font-black text-slate-600 px-0.5">:</span>

                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              max="30"
                              disabled={locked}
                              value={prediction?.away ?? ""}
                              onChange={(event) =>
                                handleScoreChange(match.id, "away", event.target.value)
                              }
                              className="h-13 w-14 rounded-xl border border-slate-700 bg-slate-900 text-center font-mono text-2xl font-black text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 shadow-inner placeholder:text-slate-700"
                              placeholder="0"
                            />
                          </div>

                          {/* Away Team */}
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/90 p-1.5 shadow-inner">
                              <TeamLogo
                                teamName={match.awayTeam}
                                className="h-9 w-9 shrink-0 object-contain"
                              />
                            </div>
                            <span className="truncate text-left text-sm font-bold text-white font-sports uppercase tracking-wide">
                              {match.awayTeam}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 text-center text-[10px] font-semibold text-slate-400">
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

        {/* Modal Footer Controls */}
        {step === 2 && !isSuccess && (
          <div className="grid grid-cols-[1fr_2fr] gap-3 border-t border-slate-800 bg-slate-900/80 p-4 sm:p-5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSelectedUser(null);
                setPredictions({});
                setError(null);
              }}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-bold text-slate-200 shadow-sm transition hover:border-slate-600 hover:bg-slate-750 active:scale-[0.98]"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || sortedMatches.length === 0}
              className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-xs font-extrabold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                "Kaydediliyor..."
              ) : (
                <>
                  <Save className="h-4 w-4 stroke-[2.2]" />
                  Tahminleri Kaydet
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
