import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Match,
  Prediction,
  Season,
  User,
  Week
} from "../types";
import Header from "../components/Header";
import UserFlag from "../components/UserFlag";
import UserCards from "../components/UserCards";
import Statistics from "../components/Statistics";
import WeekMatches from "../WeekMatches";
import PredictionModal from "../components/PredictionModal";
import AdminLogin from "../components/AdminLogin";
import AdminPanel from "../components/AdminPanel";
import UserProfileModal from "../UserProfileModal";
import ArchiveSeasonModal from "../components/ArchiveSeasonModal";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  Archive,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  Eye,
  History,
  Lock,
  Medal,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Unlock,
  Users,
  X,
  Zap
} from "lucide-react";
import { calculateWeekPoints } from "../utils/calculatePoints";

const getDateMs = (date: any) => {
  if (!date) return 0;
  if (typeof date.toDate === "function") return date.toDate().getTime();
  if (date.seconds) return date.seconds * 1000;
  if (date instanceof Date) return date.getTime();
  if (typeof date === "string") return new Date(date).getTime();
  return 0;
};

const isPlayed = (match: Match) => {
  return (
    match.actualHome !== null &&
    match.actualHome !== undefined &&
    match.actualAway !== null &&
    match.actualAway !== undefined
  );
};

const StatTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  helper?: string;
  dark?: boolean;
}> = ({ icon, label, value, helper, dark = false }) => {
  return (
    <div
      className={
        dark
          ? "rounded-3xl border border-white/10 bg-white/[0.06] p-4"
          : "rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-sm"
      }
    >
      <div
        className={
          dark
            ? "mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500"
            : "mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500"
        }
      >
        {icon}
        {label}
      </div>

      <div
        className={
          dark
            ? "truncate text-2xl font-black tracking-[-0.04em] text-white"
            : "truncate text-2xl font-black tracking-[-0.04em] text-white"
        }
      >
        {value}
      </div>

      {helper && (
        <div
          className={
            dark
              ? "mt-1 truncate text-xs font-bold text-slate-500"
              : "mt-1 truncate text-xs font-bold text-slate-500"
          }
        >
          {helper}
        </div>
      )}
    </div>
  );
};

const StatusPill: React.FC<{
  children: React.ReactNode;
  tone?: "green" | "amber" | "blue" | "slate" | "dark";
}> = ({ children, tone = "slate" }) => {
  const className =
    tone === "green"
      ? "border-orange-500/20 bg-orange-500/10 text-orange-300"
      : tone === "amber"
        ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
        : tone === "blue"
          ? "border-sky-400/25 bg-sky-400/10 text-sky-300"
          : tone === "dark"
            ? "border-white/10 bg-white/10 text-white"
            : "border-white/10 bg-white/[0.03] text-slate-500";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${className}`}
    >
      {children}
    </span>
  );
};

const EmptyState: React.FC<{
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => {
  return (
    <section className="card-base p-8 text-center sm:p-12">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
        <Trophy className="h-8 w-8" />
      </div>

      <h2 className="text-3xl font-black tracking-[-0.05em] text-white">
        {title}
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-500">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </section>
  );
};

const HomePage: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ozet" | "tahminler" | "puan-durumu" | "istatistikler">("puan-durumu");

  const [selectedUserForProfile, setSelectedUserForProfile] = useState<any>(null);
  const [selectedArchiveSeason, setSelectedArchiveSeason] = useState<Season | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);

  const [weeks, setWeeks] = useState<Week[]>([]);
  const [activeWeek, setActiveWeek] = useState<Week | null>(null);
  const [selectedWeekId, setSelectedWeekId] = useState("");

  const [matches, setMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Record<string, Match[]>>({});
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [weekPoints, setWeekPoints] = useState<any>({});

  const [historyWeek, setHistoryWeek] = useState<Week | null>(null);
  const [historyMatches, setHistoryMatches] = useState<Match[]>([]);
  const [historyPredictions, setHistoryPredictions] = useState<Prediction[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snap) => {
        setUsers(
          snap.docs.map((document) => ({
            id: document.id,
            ...document.data()
          } as User))
        );
      },
      (err) => {
        console.error("Firestore users snapshot failed:", err);
        setError("Firestore bağlantı hatası: " + err.message);
      }
    );

    const unsubSeasons = onSnapshot(
      query(collection(db, "seasons"), orderBy("startedAt", "desc")),
      (snap) => {
        const seasonList = snap.docs.map((document) => ({
          id: document.id,
          ...document.data()
        } as Season));

        setAllSeasons(seasonList);
        setActiveSeason(seasonList.find((season) => season.status === "active") || null);
      },
      (err) => {
        console.error("Firestore seasons snapshot failed:", err);
        setError("Firestore bağlantı hatası: " + err.message);
      }
    );

    return () => {
      unsubUsers();
      unsubSeasons();
    };
  }, []);

  useEffect(() => {
    if (!activeSeason) {
      setWeeks([]);
      setActiveWeek(null);
      setSelectedWeekId("");
      setPredictions([]);
      setMatches([]);
      setAllMatches({});
      return;
    }

    const unsubWeeks = onSnapshot(
      query(
        collection(db, "seasons", activeSeason.id, "weeks"),
        orderBy("weekNumber")
      ),
      (snap) => {
        const weekList = snap.docs.map((document) => ({
          id: document.id,
          ...document.data()
        } as Week));

        const active = weekList.find((week) => week.isActive) || null;

        setWeeks(weekList);
        setActiveWeek(active);
        setSelectedWeekId((current) => current || active?.id || weekList[0]?.id || "");
      },
      (err) => {
        console.error("Firestore weeks snapshot failed:", err);
        setError("Firestore bağlantı hatası: " + err.message);
      }
    );

    const unsubPredictions = onSnapshot(
      collection(db, "seasons", activeSeason.id, "predictions"),
      (snap) => {
        setPredictions(
          snap.docs.map((document) => ({
            id: document.id,
            ...document.data()
          } as Prediction))
        );
      },
      (err) => {
        console.error("Firestore predictions snapshot failed:", err);
        setError("Firestore bağlantı hatası: " + err.message);
      }
    );

    return () => {
      unsubWeeks();
      unsubPredictions();
    };
  }, [activeSeason]);

  useEffect(() => {
    if (!activeSeason || weeks.length === 0) return;

    const unsubs = weeks.map((week) => {
      return onSnapshot(
        collection(db, "seasons", activeSeason.id, "weeks", week.id, "matches"),
        (snap) => {
          const matchList = snap.docs
            .map((document) => ({
              id: document.id,
              ...document.data()
            } as Match))
            .sort((a, b) => getDateMs(a.matchDate) - getDateMs(b.matchDate));

          setAllMatches((prev) => ({
            ...prev,
            [week.id]: matchList
          }));
        },
        (err) => {
          console.error("Firestore matches snapshot failed:", err);
          setError("Firestore bağlantı hatası: " + err.message);
        }
      );
    });

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [activeSeason, weeks]);

  useEffect(() => {
    if (!activeSeason || !selectedWeekId) {
      setMatches([]);
      setHistoryWeek(null);
      return;
    }

    const selected = weeks.find((week) => week.id === selectedWeekId) || null;
    setHistoryWeek(selected);

    const fetchSelectedWeek = async () => {
      try {
        const matchSnap = await getDocs(
          collection(db, "seasons", activeSeason.id, "weeks", selectedWeekId, "matches")
        );

        const matchList = matchSnap.docs
          .map((document) => ({
            id: document.id,
            ...document.data()
          } as Match))
          .sort((a, b) => getDateMs(a.matchDate) - getDateMs(b.matchDate));

        setHistoryMatches(matchList);
        setHistoryPredictions(
          predictions.filter((prediction) => prediction.weekId === selectedWeekId)
        );

        if (selectedWeekId === activeWeek?.id) {
          setMatches(matchList);
        }
      } catch (err: any) {
        console.error("Selected week fetch failed:", err);
        setError("Firestore bağlantı hatası: " + err.message);
      }
    };

    fetchSelectedWeek();
  }, [activeSeason, selectedWeekId, weeks, predictions, activeWeek]);

  useEffect(() => {
    if (!activeSeason || !activeWeek) {
      setWeekPoints({});
      return;
    }

    const unsubWeekPoints = onSnapshot(
      collection(db, "seasons", activeSeason.id, "weekPoints", activeWeek.id, "userPoints"),
      (snap) => {
        const points: any = {};
        snap.docs.forEach((document) => {
          points[document.id] = document.data().totalWeekPoints || 0;
        });
        setWeekPoints(points);
      },
      (err) => {
        console.error("Firestore week points snapshot failed:", err);
        setError("Firestore bağlantı hatası: " + err.message);
      }
    );

    return () => {
      unsubWeekPoints();
    };
  }, [activeSeason, activeWeek]);

  const activeWeekPredictions = useMemo(() => {
    if (!activeWeek) return [];
    return predictions.filter((prediction) => prediction.weekId === activeWeek.id);
  }, [activeWeek, predictions]);

  const existingPredictors = useMemo(() => {
    return Array.from(new Set(activeWeekPredictions.map((prediction) => prediction.userId)));
  }, [activeWeekPredictions]);

  const allUsersHavePredicted =
    users.length > 0 && users.every((user) => existingPredictors.includes(user.id));

  const activeWeekMatches = activeWeek ? allMatches[activeWeek.id] || matches : [];

  const userStats = useMemo(() => {
    return users.map((user) => {
      let points = activeSeason?.id
        ? user.seasonPoints?.[activeSeason.id] || 0
        : user.totalPoints || 0;

      let exacts = activeSeason?.id
        ? user.seasonExacts?.[activeSeason.id] || 0
        : user.totalExacts || 0;

      let results = activeSeason?.id
        ? user.seasonResults?.[activeSeason.id] || 0
        : user.totalResults || 0;

      weeks.forEach((week) => {
        if (week.pointsPublished) return;

        const weekMatches = allMatches[week.id] || [];
        if (weekMatches.length === 0) return;

        const weekPredictions = predictions.filter(
          (prediction) => prediction.weekId === week.id
        );

        const calculated = calculateWeekPoints(weekMatches, weekPredictions, users);
        const userWeekData = calculated[user.id];

        if (userWeekData) {
          points += userWeekData.totalWeekPoints || 0;
          exacts += userWeekData.exacts || 0;
          results += userWeekData.results || 0;
        }
      });

      const publishedWeeksCount = Math.max(
        weeks.filter((week) => week.pointsPublished).length,
        1
      );

      return {
        ...user,
        totalPoints: points,
        exacts,
        results,
        weekPoints: weekPoints[user.id] || 0,
        avgPoints: points / publishedWeeksCount
      };
    });
  }, [users, activeSeason, weeks, allMatches, predictions, weekPoints]);

  const sortedUserStats = useMemo(() => {
    return [...userStats].sort((a: any, b: any) => {
      if ((b.totalPoints || 0) !== (a.totalPoints || 0)) {
        return (b.totalPoints || 0) - (a.totalPoints || 0);
      }

      if ((b.exacts || 0) !== (a.exacts || 0)) {
        return (b.exacts || 0) - (a.exacts || 0);
      }

      if ((b.results || 0) !== (a.results || 0)) {
        return (b.results || 0) - (a.results || 0);
      }

      return (a.name || "").localeCompare(b.name || "");
    });
  }, [userStats]);

  const selectedWeek = weeks.find((week) => week.id === selectedWeekId) || activeWeek || historyWeek;
  const selectedWeekMatches =
    selectedWeekId === activeWeek?.id ? activeWeekMatches : historyMatches;
  const selectedWeekPredictions =
    selectedWeekId === activeWeek?.id ? activeWeekPredictions : historyPredictions;

  const playedMatchesCount = activeWeekMatches.filter(isPlayed).length;
  const pendingMatchesCount = Math.max(activeWeekMatches.length - playedMatchesCount, 0);

  const selectedPlayedCount = selectedWeekMatches.filter(isPlayed).length;
  const selectedPendingCount = Math.max(selectedWeekMatches.length - selectedPlayedCount, 0);

  const finishedSeasons = allSeasons.filter((season) => season.status === "finished");
  const lastFinishedSeason = finishedSeasons[0];

  const lastChampion = useMemo(() => {
    if (!lastFinishedSeason) return null;

    return users
      .map((user) => ({
        ...user,
        score: user.seasonPoints?.[lastFinishedSeason.id] || 0,
        exacts: user.seasonExacts?.[lastFinishedSeason.id] || 0,
        results: user.seasonResults?.[lastFinishedSeason.id] || 0
      }))
      .filter((user: any) => user.score > 0)
      .sort(
        (a: any, b: any) =>
          b.score - a.score || b.exacts - a.exacts || b.results - a.results
      )[0] || null;
  }, [lastFinishedSeason, users]);

  const waitingUsers = users.filter((user) => !existingPredictors.includes(user.id));
  const leader = sortedUserStats[0] as any;
  const second = sortedUserStats[1] as any;
  const leaderGap =
    leader && second ? Math.max((leader.totalPoints || 0) - (second.totalPoints || 0), 0) : 0;

  const participationPercent =
    users.length > 0 ? Math.round((existingPredictors.length / users.length) * 100) : 0;

  const predictionLocked =
    !activeSeason || !activeWeek || activeWeek.isPublished || allUsersHavePredicted;

  const openAdmin = () => {
    if (isAdmin) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminModalOpen(true);
    }
  };

  const scrollToWeek = () => {
    const target = document.getElementById("mac-takvimi");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen px-4 pb-20 pt-24">
      <Header
        onAdminClick={openAdmin}
        onPredictionClick={() => setIsPredictionModalOpen(true)}
        activeSeasonName={activeSeason?.name}
        isAdmin={isAdmin}
        hasActiveWeek={!!activeWeek && !activeWeek.isPublished && !allUsersHavePredicted}
      />

      <main className="mx-auto max-w-7xl space-y-8 text-slate-900">
        {error && (
          <div
            className="flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-300 shadow-sm"
            id="global-db-error"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="mb-1 font-black uppercase tracking-wider">
                Veritabanı uyarısı
              </p>
              <span className="font-semibold opacity-90">{error}</span>
            </div>
          </div>
        )}

        {/* Sitenin Klasına Uygun Tab Navigasyonu */}
        {activeSeason && (
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-3xl bg-slate-100 border border-slate-200 backdrop-blur-sm">
            {/* GENEL ÖZET */}
            <button
              onClick={() => setActiveTab("ozet")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                activeTab === "ozet"
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/25 scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0 text-orange-600" />
              <span>Genel Özet</span>
            </button>

            {/* MAÇ TAHMİNİ YAP */}
            <button
              onClick={() => {
                if (!predictionLocked) {
                  setIsPredictionModalOpen(true);
                }
              }}
              disabled={predictionLocked}
              title={predictionLocked ? "Tüm tahminler girildi veya kilitlendi." : "Haftalık tahminleri girmek için tıklayın."}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                predictionLocked
                  ? "bg-slate-200/50 text-slate-400 cursor-not-allowed border border-slate-300"
                  : activeTab === "ozet"
                    ? "bg-orange-600 text-white shadow-lg shadow-emerald-600/15 hover:bg-orange-500 hover:scale-[1.02] animate-pulse"
                    : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 hover:border-orange-300"
              }`}
            >
              <Target className={`h-4 w-4 shrink-0 ${predictionLocked ? "text-slate-400" : "text-orange-600"}`} />
              <span>Maç Tahmini Yap</span>
            </button>

            {/* TAHMİNLER */}
            <button
              onClick={() => setActiveTab("tahminler")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                activeTab === "tahminler"
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/25 scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Calendar className="h-4 w-4 shrink-0 text-orange-600" />
              <span>Tahminler</span>
            </button>

            {/* PUAN DURUMU */}
            <button
              onClick={() => setActiveTab("puan-durumu")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                activeTab === "puan-durumu"
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/25 scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Medal className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Puan Durumu</span>
            </button>

            {/* İSTATİSTİKLER */}
            <button
              onClick={() => setActiveTab("istatistikler")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                activeTab === "istatistikler"
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/25 scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <BarChart3 className="h-4 w-4 shrink-0 text-orange-600" />
              <span>İstatistikler</span>
            </button>
          </div>
        )}

        {activeSeason ? (
          <>
            {activeTab === "ozet" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <section className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.04] shadow-[0_30px_110px_rgba(15,23,42,0.09)]">
                  <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(180deg,rgba(10,107,61,0.05),transparent_60%)]" />

                  <div className="relative grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="p-5 sm:p-8 lg:p-10">
                      <div className="mb-6 flex flex-wrap items-center gap-2">
                        <StatusPill tone="green">
                          <Sparkles className="h-3.5 w-3.5" />
                          Canlı Lig Merkezi
                        </StatusPill>

                        <StatusPill tone="slate">{activeSeason.name}</StatusPill>

                        {activeWeek && (
                          <StatusPill
                            tone={
                              activeWeek.isPublished
                                ? "blue"
                                : allUsersHavePredicted
                                  ? "green"
                                  : "amber"
                            }
                          >
                            {activeWeek.isPublished
                              ? "Tahminler yayında"
                              : allUsersHavePredicted
                                ? "Tahminler tamam"
                                : "Tahmin açık"}
                          </StatusPill>
                        )}
                      </div>

                      <div className="max-w-4xl">
                        <h1 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] text-slate-850 sm:text-6xl lg:text-7xl">
                          Skor Yazarları
                          <span className="block text-orange-400">
                            tahmin ligi
                          </span>
                        </h1>

                        <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-500 sm:text-lg">
                          Haftalık skor tahminleri, liderlik yarışı, maç sonuçları ve
                          sezon hafızası tek ekranda. Gereksiz kalabalık yok; rekabet
                          doğrudan ortada.
                        </p>
                      </div>

                      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <StatTile
                          icon={<Calendar className="h-4 w-4 text-orange-400" />}
                          label="Aktif Hafta"
                          value={activeWeek?.label || "Yok"}
                          helper={activeSeason?.name || "Sezon bekleniyor"}
                        />

                        <StatTile
                          icon={<Users className="h-4 w-4 text-orange-400" />}
                          label="Katılım"
                          value={`${existingPredictors.length}/${users.length}`}
                          helper={`%${participationPercent} tamamlandı`}
                        />

                        <StatTile
                          icon={<Clock className="h-4 w-4 text-amber-600" />}
                          label="Bekleyen Maç"
                          value={pendingMatchesCount}
                          helper={`${playedMatchesCount} maç sonuçlandı`}
                        />

                        <StatTile
                          icon={<Crown className="h-4 w-4 text-amber-500" />}
                          label="Lider"
                          value={leader?.name || "Yok"}
                          helper={leader ? `${leader.totalPoints || 0} puan` : "Puan bekleniyor"}
                        />
                      </div>

                      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() => setIsPredictionModalOpen(true)}
                          disabled={predictionLocked}
                          className="btn-primary justify-center"
                        >
                          <Target className="h-5 w-5" />
                          {allUsersHavePredicted ? "Tahminler Tamamlandı" : "Tahmin Yap"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab("tahminler")}
                          className="btn-secondary justify-center"
                        >
                          <Eye className="h-5 w-5" />
                          Haftayı Gör
                        </button>

                        <button
                          type="button"
                          onClick={openAdmin}
                          className="btn-secondary justify-center"
                        >
                          <ShieldCheck className="h-5 w-5" />
                          Yönetim
                        </button>
                      </div>
                    </div>

                    <div className="bg-grain bg-scoreboard relative border-t border-white/10 bg-slate-950 p-5 text-white sm:p-8 lg:border-l lg:border-t-0 lg:p-8">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.16),transparent_32rem)]" />

                      <div className="relative">
                        <div className="mb-6 flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">
                              Haftanın nabzı
                            </div>

                            <div className="mt-2 text-3xl font-black tracking-[-0.055em]">
                              {activeWeek?.label || "Beklemede"}
                            </div>

                            <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                              Kim tahmin yaptı, kim bekliyor, yarış hangi tempoda ilerliyor?
                            </p>
                          </div>

                          <div
                            className={`rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-wider ${
                              activeWeek?.isPublished
                                ? "bg-blue-400/15 text-blue-200"
                                : allUsersHavePredicted
                                  ? "bg-emerald-400/15 text-emerald-200"
                                  : "bg-amber-400/15 text-amber-200"
                            }`}
                          >
                            {activeWeek?.isPublished
                              ? "Yayında"
                              : allUsersHavePredicted
                                ? "Kilitlendi"
                                : "Tahmin Açık"}
                          </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5">
                          <div className="flex items-end justify-between gap-4">
                            <div>
                              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                                Katılım oranı
                              </div>

                              <div className="stat-number mt-1 text-6xl font-black">
                                {participationPercent}
                                <span className="text-3xl text-slate-500">%</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                Durum
                              </div>

                              <div
                                className={`mt-1 text-sm font-black ${
                                  allUsersHavePredicted ? "text-emerald-300" : "text-amber-200"
                                }`}
                              >
                                {allUsersHavePredicted ? "Herkes yaptı" : "Bekleyen var"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                              style={{ width: `${participationPercent}%` }}
                            />
                          </div>

                          <div className="mt-5 grid grid-cols-3 gap-2">
                            <StatTile
                              dark
                              icon={<BarChart3 className="h-4 w-4 text-emerald-300" />}
                              label="Maç"
                              value={activeWeekMatches.length}
                            />

                            <StatTile
                              dark
                              icon={<CheckCircle2 className="h-4 w-4 text-emerald-300" />}
                              label="Sonuç"
                              value={playedMatchesCount}
                            />

                            <StatTile
                              dark
                              icon={<Clock className="h-4 w-4 text-amber-300" />}
                              label="Bekleyen"
                              value={pendingMatchesCount}
                            />
                          </div>
                        </div>

                        {leader && (
                          <div className="mt-4 rounded-[1.5rem] border border-amber-300/20 bg-amber-300/10 p-4">
                            <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-amber-200">
                              <Medal className="h-4 w-4" />
                              Liderlik farkı
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <UserFlag flagEmoji={leader.flagEmoji} className="h-10 w-10 text-4xl" />

                                <div className="min-w-0">
                                  <div className="truncate text-lg font-black text-white">
                                    {leader.name}
                                  </div>

                                  <div className="text-xs font-bold text-slate-500">
                                    {leader.totalPoints || 0} puan
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-3xl font-black tracking-[-0.06em] text-amber-200">
                                  +{leaderGap}
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                  fark
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-5">
                          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                            Yazarlar
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {users.map((user) => {
                              const hasPredicted = existingPredictors.includes(user.id);

                              return (
                                <span
                                  key={user.id}
                                  title={`${user.name} ${hasPredicted ? "tahmin yaptı" : "bekleniyor"}`}
                                  className={`flex h-10 w-10 items-center justify-center rounded-full border p-1 transition ${
                                    hasPredicted
                                      ? "border-emerald-400/30 bg-emerald-400/10"
                                      : "border-white/10 bg-white/5 grayscale opacity-35"
                                  }`}
                                >
                                  <UserFlag flagEmoji={user.flagEmoji} className="h-full w-full text-lg" />
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {!allUsersHavePredicted && activeWeek && (
                          <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3">
                            <div className="text-[10px] font-black uppercase tracking-wider text-amber-200">
                              Bekleyenler
                            </div>

                            <div className="mt-1 text-sm font-bold text-white">
                              {waitingUsers.map((user) => user.name).join(", ") || "Bekleyen yok"}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {finishedSeasons.length > 0 && (
                  <section className="space-y-4">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                      <div>
                        <div className="section-title flex items-center gap-2">
                          <Archive className="h-4 w-4" />
                          Lig Hafızası
                        </div>
                        <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] text-slate-850 sm:text-3xl">
                          Geçmiş Sezonlar
                        </h2>
                      </div>

                      <p className="max-w-md text-sm font-semibold leading-6 text-slate-500">
                        Eski liglerin şampiyonu, sıralaması ve detayları arşivde saklanır.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {finishedSeasons.map((season) => {
                        const champion = users
                          .map((user) => ({
                            ...user,
                            score: user.seasonPoints?.[season.id] || 0,
                            exacts: user.seasonExacts?.[season.id] || 0,
                            results: user.seasonResults?.[season.id] || 0
                          }))
                          .filter((user: any) => user.score > 0)
                          .sort(
                            (a: any, b: any) =>
                              b.score - a.score || b.exacts - a.exacts || b.results - a.results
                          )[0];

                        return (
                          <button
                            key={season.id}
                            type="button"
                            onClick={() => setSelectedArchiveSeason(season)}
                            className="card-base card-hover group p-5 text-left"
                          >
                            <div className="mb-5 flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-lg font-black text-white transition group-hover:text-orange-400">
                                  {season.name}
                                </h3>
                                <p className="mt-1 text-xs font-black uppercase tracking-wider text-slate-500">
                                  Tamamlanan Sezon
                                </p>
                              </div>

                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                Arşiv
                              </span>
                            </div>

                            {champion ? (
                              <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                <div className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                  Şampiyon
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <UserFlag flagEmoji={champion.flagEmoji} className="h-6 w-6 text-2xl" />
                                    <span className="font-black text-white">
                                      {champion.name}
                                    </span>
                                  </div>

                                  <span className="rounded-xl bg-white/[0.04] px-3 py-1.5 text-sm font-black text-orange-400">
                                    {champion.score}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm font-bold text-slate-500">
                                Şampiyon bilgisi bekleniyor.
                              </div>
                            )}

                            <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs font-black uppercase tracking-wider text-orange-400">
                              <span>Sezon Detayları</span>
                              <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}
              </motion.div>
            )}

            {activeTab === "tahminler" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <section id="mac-takvimi" className="scroll-mt-28">
                  <div className="card-base p-5 sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <div className="section-title">Hafta Seçimi</div>
                        <h2 className="mt-2 text-xl font-black text-slate-850">
                          Haftalar ve Maç Detayı
                        </h2>
                      </div>

                      <History className="h-6 w-6 text-orange-400" />
                    </div>

                    {/* Desktop/Tablet Week Buttons */}
                    <div className="hidden sm:flex mb-5 gap-2 overflow-x-auto pb-2">
                      {weeks.map((week) => (
                        <button
                          key={week.id}
                          type="button"
                          onClick={() => setSelectedWeekId(week.id)}
                          className={`shrink-0 rounded-2xl border px-4 py-3 text-left transition ${
                            selectedWeekId === week.id
                              ? "border-orange-500 bg-orange-600 text-white"
                              : "border-white/10 bg-white/[0.04] text-slate-500 hover:border-orange-500/40"
                          }`}
                        >
                          <div className="text-sm font-black">{week.label}</div>
                          <div
                            className={`mt-1 text-[10px] font-black uppercase tracking-wider ${
                              selectedWeekId === week.id ? "text-white/80" : "text-slate-500"
                            }`}
                          >
                            {week.isActive
                              ? "Aktif"
                              : week.pointsPublished
                                ? "Puanlandı"
                                : week.isPublished
                                  ? "Yayında"
                                  : "Geçmiş"}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Mobile Week Select Dropdown */}
                    <div className="block sm:hidden mb-5">
                      <label htmlFor="week-select-mobile" className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                        Hafta Seçin:
                      </label>
                      <select
                        id="week-select-mobile"
                        value={selectedWeekId}
                        onChange={(e) => setSelectedWeekId(e.target.value)}
                        className="w-full rounded-2xl border border-slate-250 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-orange-500"
                      >
                        {weeks.map((week) => (
                          <option key={week.id} value={week.id}>
                            {week.label} ({week.isActive ? "Aktif" : week.pointsPublished ? "Puanlandı" : week.isPublished ? "Yayında" : "Geçmiş"})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedWeek ? (
                      <WeekMatches
                        label={selectedWeek.label}
                        matches={selectedWeekMatches}
                        predictions={selectedWeekPredictions}
                        users={users}
                        isPublished={selectedWeek.isPublished || selectedWeek.id !== activeWeek?.id}
                        pointsPublished={selectedWeek.pointsPublished}
                        isAdmin={isAdmin}
                      />
                    ) : (
                      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
                        <p className="font-bold text-slate-500">
                          Henüz hafta bulunmuyor.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "puan-durumu" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <section className="space-y-4">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                      <div className="section-title">Canlı Sıralama</div>
                      <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] text-slate-850 sm:text-3xl">
                        Sezon Puan Durumu
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                        Liderlik, tam isabet ve doğru sonuç performansı tek bakışta.
                      </p>
                    </div>

                    <div className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-500">
                      {weeks.length} Hafta · {users.length} Yazar
                    </div>
                  </div>

                  <UserCards
                    users={sortedUserStats as any}
                    onUserClick={(user) => setSelectedUserForProfile(user)}
                  />
                </section>
              </motion.div>
            )}

            {activeTab === "istatistikler" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <section className="space-y-4">
                  <div>
                    <div className="section-title">Performans Analizi</div>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] text-slate-850 sm:text-3xl">
                      İstatistik Merkezi
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                      Tahmin kalitesi, isabet dengesi ve oyuncu performansı burada okunur.
                    </p>
                  </div>

                  <Statistics
                    users={sortedUserStats}
                    onUserClick={(user) => setSelectedUserForProfile(user)}
                  />
                </section>
              </motion.div>
            )}
          </>
        ) : (
          <>
            <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <EmptyState
                title="Aktif sezon bekleniyor"
                description="Yeni sezon açıldığında haftalar, maçlar, tahminler ve canlı puan durumu burada otomatik görünür."
                action={
                  isAdmin ? (
                    <button
                      type="button"
                      onClick={() => setIsAdminPanelOpen(true)}
                      className="btn-primary"
                    >
                      <Zap className="h-5 w-5" />
                      Sezonu Yönet
                    </button>
                  ) : null
                }
              />

              {lastChampion && lastFinishedSeason && (
                <div className="card-base p-6">
                  <div className="section-title">Son Şampiyon</div>

                  <div className="mt-5 flex items-center gap-4">
                    <UserFlag flagEmoji={lastChampion.flagEmoji} className="h-16 w-16 text-6xl" />

                    <div>
                      <h3 className="text-2xl font-black text-white">
                        {lastChampion.name}
                      </h3>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                        {lastFinishedSeason.name}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white/[0.03] p-3 text-center">
                      <div className="text-2xl font-black text-orange-400">
                        {lastChampion.score}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Puan
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/[0.03] p-3 text-center">
                      <div className="text-2xl font-black text-white">
                        {lastChampion.exacts}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Tam
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/[0.03] p-3 text-center">
                      <div className="text-2xl font-black text-white">
                        {lastChampion.results}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Sonuç
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {finishedSeasons.length > 0 && (
              <section className="space-y-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <div className="section-title flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      Lig Hafızası
                    </div>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] text-white sm:text-3xl">
                      Geçmiş Sezonlar
                    </h2>
                  </div>

                  <p className="max-w-md text-sm font-semibold leading-6 text-slate-500">
                    Eski liglerin şampiyonu, sıralaması ve detayları arşivde saklanır.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {finishedSeasons.map((season) => {
                    const champion = users
                      .map((user) => ({
                        ...user,
                        score: user.seasonPoints?.[season.id] || 0,
                        exacts: user.seasonExacts?.[season.id] || 0,
                        results: user.seasonResults?.[season.id] || 0
                      }))
                      .filter((user: any) => user.score > 0)
                      .sort(
                        (a: any, b: any) =>
                          b.score - a.score || b.exacts - a.exacts || b.results - a.results
                      )[0];

                    return (
                      <button
                        key={season.id}
                        type="button"
                        onClick={() => setSelectedArchiveSeason(season)}
                        className="card-base card-hover group p-5 text-left"
                      >
                        <div className="mb-5 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-black text-white transition group-hover:text-orange-400">
                              {season.name}
                            </h3>
                            <p className="mt-1 text-xs font-black uppercase tracking-wider text-slate-500">
                              Tamamlanan sezon
                            </p>
                          </div>

                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Arşiv
                          </span>
                        </div>

                        {champion ? (
                          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                              Şampiyon
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <UserFlag flagEmoji={champion.flagEmoji} className="h-6 w-6 text-2xl" />
                                <span className="font-black text-white">
                                  {champion.name}
                                </span>
                              </div>

                              <span className="rounded-xl bg-white/[0.04] px-3 py-1.5 text-sm font-black text-orange-400">
                                {champion.score}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm font-bold text-slate-500">
                            Şampiyon bilgisi bekleniyor.
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs font-black uppercase tracking-wider text-orange-400">
                          <span>Sezon Detayları</span>
                          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-center gap-4 border-t border-white/10 pb-12 pt-8">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Skor Yazarları. Özel tahmin ligi merkezi.
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={openAdmin}
            className="rounded-full p-2 text-slate-500 transition duration-200 hover:bg-white/[0.06] hover:text-slate-300"
            title={isAdmin ? "Yönetici Panelini Aç" : "Yönetici Girişi (Şifre İster)"}
            id="admin-footer-btn-login"
          >
            {isAdmin ? <Unlock className="h-4 w-4 text-emerald-400" /> : <Lock className="h-4 w-4" />}
          </button>

          <button
            onClick={() => {
              setIsAdmin(false);
              setIsAdminPanelOpen(false);
            }}
            className="rounded-full p-2 text-slate-500 transition duration-200 hover:bg-white/[0.06] hover:text-rose-400"
            title="Yönetici Çıkışı"
            id="admin-footer-btn-logout"
          >
            <Lock className="h-4 w-4 text-slate-400 hover:text-rose-400" />
          </button>
        </div>
      </footer>

      <AnimatePresence>
        {isAdminModalOpen && (
          <AdminLogin
            isVisible={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            onSuccess={() => {
              setIsAdmin(true);
              setIsAdminPanelOpen(true);
            }}
          />
        )}

        {isAdminPanelOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setIsAdminPanelOpen(false)}
            />

            <div className="relative max-h-[90vh] w-full max-w-6xl">
              <button
                onClick={() => setIsAdminPanelOpen(false)}
                className="absolute -top-10 right-0 flex items-center gap-2 text-sm font-bold text-white opacity-70 hover:opacity-100"
                type="button"
              >
                Kapat <X className="h-4 w-4" />
              </button>

              <AdminPanel />
            </div>
          </div>
        )}

        {isPredictionModalOpen && activeWeek && activeSeason && (
          <PredictionModal
            isVisible={isPredictionModalOpen}
            onClose={() => setIsPredictionModalOpen(false)}
            users={users}
            activeWeek={activeWeek}
            matches={activeWeekMatches}
            seasonId={activeSeason.id}
          />
        )}

        {selectedUserForProfile && activeSeason && (
          <UserProfileModal
            isVisible={!!selectedUserForProfile}
            onClose={() => setSelectedUserForProfile(null)}
            user={selectedUserForProfile}
            season={activeSeason}
            weeks={weeks}
          />
        )}

        {selectedArchiveSeason && (
          <ArchiveSeasonModal
            isVisible={!!selectedArchiveSeason}
            onClose={() => setSelectedArchiveSeason(null)}
            season={selectedArchiveSeason}
            users={users}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;