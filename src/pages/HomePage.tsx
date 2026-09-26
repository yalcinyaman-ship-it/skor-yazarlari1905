import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  Match,
  Prediction,
  Season,
  User,
  Week
} from "../types";
import Header from "../components/Header";
import UserFlag from "../components/UserFlag";
import { flagUrlForEmoji } from "../flags";
import UserCards from "../components/UserCards";
import Statistics from "../components/Statistics";
import WeekMatches from "../WeekMatches";
import PredictionModal from "../components/PredictionModal";
import AdminLogin from "../components/AdminLogin";
import AdminPanel from "../components/AdminPanel";
import UserProfileModal from "../UserProfileModal";
import ArchiveSeasonModal from "../components/ArchiveSeasonModal";
import FlameHome from "../components/FlameHome";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  Archive,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Clock3,
  Crosshair,
  Crown,
  Eye,
  Flame,
  History,
  LayoutGrid,
  Lock,
  Medal,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Unlock,
  Users,
  X,
  Zap
} from "lucide-react";
import { calculateWeekPoints } from "../utils/calculatePoints";

const getMonogram = (name: string): string => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase("tr-TR");
  return (parts[0][0] + parts[parts.length - 1][0]).toLocaleUpperCase("tr-TR");
};

const formatAuthorName = (name: string): string => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toLocaleUpperCase("tr-TR");
  return `${first} ${lastInitial}.`;
};

const formatWeekLabel = (label?: string | null): string => {
  if (!label) return "";
  return label.replace(/hatfa/gi, "Hafta");
};

const AuthorClubLens: React.FC<{ user: User; hasPredicted: boolean }> = ({ user, hasPredicted }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user.flagEmoji, user.clubLogo]);

  const logoUrl = !imgError
    ? (user.clubLogo || (user as any).logo || flagUrlForEmoji(user.flagEmoji, 80))
    : null;

  return (
    <div
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950/80 transition-all duration-200 ${
        hasPredicted
          ? "border border-emerald-500/60 ring-2 ring-emerald-500/40 shadow-[0_0_14px_rgba(16,185,129,0.35)]"
          : "border border-slate-700/60 opacity-60 group-hover:opacity-100 group-hover:border-slate-500 shadow-sm"
      }`}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={user.name}
          referrerPolicy="no-referrer"
          className="h-7 w-7 max-h-[75%] max-w-[75%] object-contain drop-shadow-xs"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <UserFlag flagEmoji={user.flagEmoji} className="h-6 w-6 text-base" />
      )}

      {/* Tahmin durumu onay / bekleme rozeti */}
      {hasPredicted ? (
        <span
          className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-slate-950 ring-2 ring-slate-900 shadow-sm"
          title="Tahmin gönderildi"
        >
          ✓
        </span>
      ) : (
        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 ring-2 ring-slate-900" title="Tahmin bekleniyor"></span>
        </span>
      )}
    </div>
  );
};

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
  icon?: React.ReactNode;
  iconBg?: string;
  label: string;
  value: React.ReactNode;
  helper?: string;
  dark?: boolean;
  glass?: boolean;
}> = ({ icon, iconBg = "bg-blue-500/10 border-blue-500/20 text-blue-400", label, value, helper }) => {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700/90 hover:bg-slate-900/80">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {label}
        </span>
        {icon && (
          <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border shadow-inner ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="font-mono text-2xl sm:text-[26px] font-extrabold tracking-tight text-white tabular-nums">
          {value}
        </div>

        {helper && (
          <p className="mt-1 truncate text-xs font-medium text-slate-400">
            {helper}
          </p>
        )}
      </div>
    </div>
  );
};

const StatusPill: React.FC<{
  children: React.ReactNode;
  tone?: "green" | "amber" | "blue" | "slate" | "dark";
}> = ({ children, tone = "slate" }) => {
  const className =
    tone === "green"
      ? "border-[#1F4A33] bg-[#0F2A1C] text-[#3FD483]"
      : tone === "amber"
        ? "border-[#5A2A10] bg-[#2A1508] text-[#FF6A1F]"
        : tone === "blue"
          ? "border-[#5A2A10] bg-[#2A1508] text-[#FF8A3D]"
          : tone === "dark"
            ? "border-[#2E241C] bg-[#0F0B08] text-[#F6EFE7]"
            : "border-[#2E241C] bg-[#0F0B08] text-[#A89A8C]";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${className}`}
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
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#5A2A10] bg-[#2A1508] text-[#FF6A1F]">
        <Trophy className="h-8 w-8" />
      </div>

      <h2 className="text-3xl font-black tracking-[-0.04em] text-[#F6EFE7]">
        {title}
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-7 text-[#A89A8C]">
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
  const [activeTab, setActiveTab] = useState<"ozet" | "tahminler" | "puan-durumu" | "istatistikler" | "hafiza">("ozet");

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
  const [submittedUserIds, setSubmittedUserIds] = useState<string[]>([]);
  const [weekPoints, setWeekPoints] = useState<any>({});

  const [historyWeek, setHistoryWeek] = useState<Week | null>(null);
  const [historyMatches, setHistoryMatches] = useState<Match[]>([]);
  const [historyPredictions, setHistoryPredictions] = useState<Prediction[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      const authenticatedAdmin = user?.email === "admin@skoryazarlari.app";
      setIsAdmin(authenticatedAdmin);

      if (!authenticatedAdmin) {
        setIsAdminPanelOpen(false);
      }
    });
  }, []);

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

    return () => {
      unsubWeeks();
    };
  }, [activeSeason]);

  useEffect(() => {
    if (!activeSeason || weeks.length === 0) {
      setPredictions([]);
      return;
    }

    const readableWeeks = isAdmin
      ? weeks
      : weeks.filter((week) => week.isPublished);

    if (readableWeeks.length === 0) {
      setPredictions([]);
      return;
    }

    const predictionsByWeek = new Map<string, Prediction[]>();
    const unsubs = readableWeeks.map((week) =>
      onSnapshot(
        query(
          collection(db, "seasons", activeSeason.id, "predictions"),
          where("weekId", "==", week.id)
        ),
        (snap) => {
          predictionsByWeek.set(
            week.id,
            snap.docs.map((document) => ({
              id: document.id,
              ...document.data()
            } as Prediction))
          );
          setPredictions(Array.from(predictionsByWeek.values()).flat());
        },
        (err) => {
          console.error("Firestore predictions snapshot failed:", err);
          setError("Firestore bağlantı hatası: " + err.message);
        }
      )
    );

    return () => unsubs.forEach((unsub) => unsub());
  }, [activeSeason, weeks, isAdmin]);

  useEffect(() => {
    if (!activeSeason || !activeWeek) {
      setSubmittedUserIds([]);
      return;
    }

    return onSnapshot(
      collection(db, "seasons", activeSeason.id, "weeks", activeWeek.id, "submissions"),
      (snap) => {
        setSubmittedUserIds(
          snap.docs.map((document) => document.data().userId || document.id)
        );
      },
      (err) => {
        console.error("Firestore submissions snapshot failed:", err);
        setError("Firestore bağlantı hatası: " + err.message);
      }
    );
  }, [activeSeason, activeWeek]);

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

  // Skor botu: sayfa her açıldığında sunucudan maç saatlerini ve biten maç skorlarını tazeler (10 dk'da bir çalışır).
  useEffect(() => {
    fetch("/api/skor-guncelle").catch(() => {});
    const t = setInterval(() => fetch("/api/skor-guncelle").catch(() => {}), 10 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const [nowMs, setNowMs] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeWeekPredictions = useMemo(() => {
    if (!activeWeek) return [];
    return predictions.filter((prediction) => prediction.weekId === activeWeek.id);
  }, [activeWeek, predictions]);

  const existingPredictors = useMemo(() => {
    return Array.from(
      new Set([
        ...submittedUserIds,
        ...activeWeekPredictions.map((prediction) => prediction.userId)
      ].filter(Boolean))
    );
  }, [submittedUserIds, activeWeekPredictions]);

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

  // İlk maçın başlama saati: tahminler bu anda kendiliğinden kapanır.
  const firstKickoffMs = (() => {
    const times = activeWeekMatches.map((m) => getDateMs(m.matchDate)).filter((t) => t > 0);
    return times.length ? Math.min(...times) : 0;
  })();
  const kickoffPassed = firstKickoffMs > 0 && nowMs >= firstKickoffMs;

  const predictionLocked =
    !activeSeason || !activeWeek || activeWeek.isPublished || allUsersHavePredicted || kickoffPassed;

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
    <div>
      <FlameHome
        activeSeason={activeSeason}
        activeWeek={activeWeek}
        weeks={weeks}
        users={users}
        sortedUserStats={sortedUserStats as any[]}
        allMatches={allMatches}
        predictions={predictions}
        existingPredictors={existingPredictors}
        allUsersHavePredicted={allUsersHavePredicted}
        participationPercent={participationPercent}
        leaderGap={leaderGap}
        predictionLocked={predictionLocked}
        firstKickoffMs={firstKickoffMs}
        nowMs={nowMs}
        finishedSeasons={finishedSeasons}
        isAdmin={isAdmin}
        error={error}
        selectedWeekId={selectedWeekId}
        setSelectedWeekId={setSelectedWeekId}
        onPredict={() => setIsPredictionModalOpen(true)}
        onAdmin={openAdmin}
        onLogout={() => signOut(auth)}
        onUserClick={(user) => setSelectedUserForProfile(user)}
        onArchiveClick={(season) => setSelectedArchiveSeason(season)}
      />

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
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setIsAdminPanelOpen(false)}
            />

            <div className="relative max-h-[90vh] w-full max-w-6xl">
              <button
                onClick={() => setIsAdminPanelOpen(false)}
                className="absolute -top-10 right-0 flex items-center gap-2 rounded-full border border-[#2E241C] bg-[#15100C]/95 px-3 py-1 text-xs font-bold text-[#F6EFE7] shadow-sm transition hover:bg-[#15100C]"
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
