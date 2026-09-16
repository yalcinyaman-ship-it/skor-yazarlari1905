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
      className={`relative flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-2xl bg-[#FFFFFF] transition-all duration-200 ${
        hasPredicted
          ? "ring-2 ring-emerald-500/70 shadow-[0_3px_8px_rgba(0,0,0,0.06),0_0_12px_rgba(16,185,129,0.20)]"
          : "opacity-50 group-hover:opacity-85 shadow-[0_3px_8px_rgba(0,0,0,0.06)]"
      }`}
      style={{
        border: hasPredicted ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(0,0,0,0.08)"
      }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={user.name}
          referrerPolicy="no-referrer"
          className="h-7 w-7 max-h-[75%] max-w-[75%] object-contain"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <UserFlag flagEmoji={user.flagEmoji} className="h-6 w-6 text-base" />
      )}

      {/* Tahmin yapmamış yazar için zarif mikro bekleme noktası */}
      {!hasPredicted && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white"
          title="Tahmin bekleniyor"
        />
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
  label: string;
  value: React.ReactNode;
  helper?: string;
  dark?: boolean;
  glass?: boolean;
}> = ({ icon, label, value, helper }) => {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 sm:p-4 transition-all shadow-2xs">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-[#64748B]">
        {icon && <span className="opacity-90">{icon}</span>}
        <span>{label}</span>
      </div>

      <div className="mt-1 truncate font-mono text-lg sm:text-[19px] font-bold tracking-tight text-[#0F172A]">
        {value}
      </div>

      {helper && (
        <div className="mt-0.5 truncate text-xs text-[#64748B]">
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
      ? "border-[#D0EADB] bg-[#EDF7F2] text-[#2D8A66]"
      : tone === "amber"
        ? "border-[#F3DCD2] bg-[#FDF4F0] text-[#D96B43]"
        : tone === "blue"
          ? "border-[#D5E2EE] bg-[#EEF4F9] text-[#366899]"
          : tone === "dark"
            ? "border-[#EAE6DF] bg-[#FAF8F5] text-[#1A1A1A]"
            : "border-[#EAE6DF] bg-[#FAF8F5] text-[#6B6760]";

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
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#F3DCD2] bg-[#FDF4F0] text-[#D96B43]">
        <Trophy className="h-8 w-8" />
      </div>

      <h2 className="text-3xl font-black tracking-[-0.04em] text-[#1A1A1A]">
        {title}
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-7 text-[#6B6760]">
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

  // Sefer Koçan - Erzurumspor vs Galatasaray (1-2) tahmini otomatik senkronizasyonu
  useEffect(() => {
    if (!activeSeason || !activeWeek || !users.length || !matches.length) return;

    const seferUser = users.find((u) => u.name && u.name.toLowerCase().includes("sefer"));
    if (!seferUser) return;

    const erzGalaMatch = matches.find((m) => {
      const home = (m.homeTeam || "").toLowerCase();
      const away = (m.awayTeam || "").toLowerCase();
      return (
        (home.includes("erzurum") && away.includes("galatasaray")) ||
        (home.includes("galatasaray") && away.includes("erzurum"))
      );
    });

    if (!erzGalaMatch) return;

    const targetId = `${seferUser.id}_${erzGalaMatch.id}`;
    const existingPred = predictions.find((p) => p.userId === seferUser.id && p.matchId === erzGalaMatch.id);

    if (!existingPred) {
      const isHomeErzurum = (erzGalaMatch.homeTeam || "").toLowerCase().includes("erzurum");
      const predictedHome = isHomeErzurum ? 1 : 2;
      const predictedAway = isHomeErzurum ? 2 : 1;

      const syncSeferPrediction = async () => {
        try {
          await setDoc(doc(db, "seasons", activeSeason.id, "predictions", targetId), {
            userId: seferUser.id,
            weekId: activeWeek.id,
            matchId: erzGalaMatch.id,
            predictedHome,
            predictedAway,
            createdAt: serverTimestamp()
          });

          await setDoc(
            doc(db, "seasons", activeSeason.id, "weeks", activeWeek.id, "submissions", seferUser.id),
            {
              userId: seferUser.id,
              createdAt: serverTimestamp()
            }
          );
          console.log("Sefer Koçan tahmini eklendi (Erzurumspor 1 - 2 Galatasaray).");
        } catch (err) {
          console.error("Sefer Koçan tahmini eklenirken hata:", err);
        }
      };

      syncSeferPrediction();
    }
  }, [activeSeason, activeWeek, users, matches, predictions]);

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
    <div className="min-h-screen bg-[#F4F1EA] px-3 pb-24 pt-36 sm:pt-40 sm:px-5">
      <Header
        onAdminClick={openAdmin}
        onPredictionClick={() => setIsPredictionModalOpen(true)}
        activeSeasonName={activeSeason?.name}
        isAdmin={isAdmin}
        hasActiveWeek={!!activeWeek && !activeWeek.isPublished && !allUsersHavePredicted}
      />

      <main className="mx-auto max-w-[1440px] space-y-8 text-[#1A1A1E]">
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

        {/* Apple / Linear Tarzı Centered Segmented Control */}
        {activeSeason && (
          <div className="flex w-full items-center justify-center">
            <div
              style={{
                backgroundColor: "#ECE8E1",
                padding: "4px",
                borderRadius: "9999px",
              }}
              className="inline-flex flex-wrap items-center justify-center gap-1 border border-[#DFDAD1] shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            >
              {/* GENEL ÖZET */}
              <button
                onClick={() => setActiveTab("ozet")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-150 ${
                  activeTab === "ozet"
                    ? "bg-[#FFFFFF] text-[#111827] font-semibold shadow-sm"
                    : "bg-transparent text-[#5A5751] font-medium hover:text-[#111827] hover:bg-black/[0.03]"
                }`}
              >
                <LayoutGrid
                  className={`h-3.5 w-3.5 shrink-0 ${activeTab === "ozet" ? "text-[#111827]" : "text-[#5A5751]"}`}
                  strokeWidth={1.5}
                />
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 ${
                  predictionLocked
                    ? "cursor-not-allowed text-[#5A5751] opacity-65"
                    : "bg-transparent text-[#111827] hover:text-[#111827] hover:bg-black/[0.03] active:scale-[0.98]"
                }`}
              >
                <Crosshair className="h-3.5 w-3.5 shrink-0 stroke-[1.5] text-[#D9532F]" />
                <span>Maç Tahmini Yap</span>
              </button>

              {/* TAHMİNLER */}
              <button
                onClick={() => setActiveTab("tahminler")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-150 ${
                  activeTab === "tahminler"
                    ? "bg-[#FFFFFF] text-[#111827] font-semibold shadow-sm"
                    : "bg-transparent text-[#5A5751] font-medium hover:text-[#111827] hover:bg-black/[0.03]"
                }`}
              >
                <Calendar
                  className={`h-3.5 w-3.5 shrink-0 ${activeTab === "tahminler" ? "text-[#111827]" : "text-[#5A5751]"}`}
                  strokeWidth={1.5}
                />
                <span>Tahminler</span>
              </button>

              {/* PUAN DURUMU */}
              <button
                onClick={() => setActiveTab("puan-durumu")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-150 ${
                  activeTab === "puan-durumu"
                    ? "bg-[#FFFFFF] text-[#111827] font-semibold shadow-sm"
                    : "bg-transparent text-[#5A5751] font-medium hover:text-[#111827] hover:bg-black/[0.03]"
                }`}
              >
                <Trophy
                  className={`h-3.5 w-3.5 shrink-0 ${activeTab === "puan-durumu" ? "text-[#111827]" : "text-[#5A5751]"}`}
                  strokeWidth={1.5}
                />
                <span>Puan Durumu</span>
              </button>

              {/* İSTATİSTİKLER */}
              <button
                onClick={() => setActiveTab("istatistikler")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-150 ${
                  activeTab === "istatistikler"
                    ? "bg-[#FFFFFF] text-[#111827] font-semibold shadow-sm"
                    : "bg-transparent text-[#5A5751] font-medium hover:text-[#111827] hover:bg-black/[0.03]"
                }`}
              >
                <TrendingUp
                  className={`h-3.5 w-3.5 shrink-0 ${activeTab === "istatistikler" ? "text-[#111827]" : "text-[#5A5751]"}`}
                  strokeWidth={1.5}
                />
                <span>İstatistikler</span>
              </button>

              {/* LİG HAFIZASI */}
              <button
                onClick={() => setActiveTab("hafiza")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-150 ${
                  activeTab === "hafiza"
                    ? "bg-[#FFFFFF] text-[#111827] font-semibold shadow-sm"
                    : "bg-transparent text-[#5A5751] font-medium hover:text-[#111827] hover:bg-black/[0.03]"
                }`}
              >
                <Archive
                  className={`h-3.5 w-3.5 shrink-0 ${activeTab === "hafiza" ? "text-[#111827]" : "text-[#5A5751]"}`}
                  strokeWidth={1.5}
                />
                <span>Lig Hafızası</span>
              </button>
            </div>
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
                <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr] items-stretch">
                  {/* SOL KART: Hero ve 4 Metrik (Haftanın Ana Etkinlik Vitrini) */}
                  <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 text-[#0F172A] shadow-sm transition-all duration-200 hover:border-slate-300">
                    {/* Üst Maç Haftası & Rekabet Vurgusu Çizgisi */}
                    <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-[#1E3A8A] via-[#D97706] to-[#059669]" />

                    <div>
                      {/* Üst Bilgi Satırı - Editoryal Maç Haftası Etiketi */}
                      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 text-xs text-[#64748B]">
                          <span className="inline-flex items-center gap-1 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8]">
                            <Sparkles className="h-3 w-3 text-[#1D4ED8]" />
                            Maç Haftası
                          </span>
                          <span className="font-semibold text-[#0F172A]">{activeSeason.name}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-medium text-[#64748B]">{formatWeekLabel(activeWeek?.label) || "Aktif Hafta Yok"}</span>
                        </div>

                        {activeWeek && (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-semibold border ${
                              activeWeek.isPublished
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : allUsersHavePredicted
                                  ? "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
                                  : "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              activeWeek.isPublished ? "bg-blue-500" : allUsersHavePredicted ? "bg-[#047857]" : "bg-[#D97706] animate-pulse"
                            }`} />
                            {activeWeek.isPublished
                              ? "Tahminler yayında"
                              : allUsersHavePredicted
                                ? "Tahminler tamamlandı"
                                : "Tahminler açık"}
                          </span>
                        )}
                      </div>

                      {/* Başlık ve Editoryal Hikâye */}
                      <div>
                        <h1 className="font-serif text-[26px] sm:text-[32px] font-bold leading-tight tracking-tight text-[#0F172A]">
                          {activeWeek ? `${formatWeekLabel(activeWeek.label)} Tahminleri & Maç Dengesi` : "5. Hafta Tahminleri & Maç Dengesi"}
                        </h1>

                        <p className="font-serif mt-2.5 max-w-xl text-sm sm:text-[15px] italic leading-relaxed text-[#475569]">
                          On yazar. Bir sezon. Her hafta yeniden kurulan bir futbol hikâyesi.
                          Skoru yaz, riskini al, masanın zirvesine adını bırak.
                        </p>
                      </div>

                      {/* 4 Ayrı, Bağımsız Mini Kart */}
                      <div className="mt-6 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
                        <StatTile
                          icon={<Calendar className="h-3.5 w-3.5 text-[#1E3A8A]" />}
                          label="Aktif Hafta"
                          value={formatWeekLabel(activeWeek?.label) || "Yok"}
                          helper={activeSeason?.name || "Sezon bekleniyor"}
                        />

                        <StatTile
                          icon={<Users className="h-3.5 w-3.5 text-[#2563EB]" />}
                          label="Katılım"
                          value={`${existingPredictors.length}/${users.length}`}
                          helper={`%${participationPercent} tamamlandı`}
                        />

                        <StatTile
                          icon={<Clock className="h-3.5 w-3.5 text-[#D97706]" />}
                          label="Bekleyen Maç"
                          value={pendingMatchesCount}
                          helper={`${playedMatchesCount} maç sonuçlandı`}
                        />

                        <StatTile
                          icon={<Trophy className="h-3.5 w-3.5 text-[#059669]" />}
                          label="Lider"
                          value={leader?.name || "Yok"}
                          helper={leader ? `${leader.totalPoints || 0} puan` : "Puan bekleniyor"}
                        />
                      </div>
                    </div>

                    {/* Aksiyon Butonları */}
                    <div className="mt-7 flex flex-wrap items-center gap-2.5 border-t border-[#E2E8F0] pt-5">
                      <button
                        type="button"
                        onClick={() => setActiveTab("tahminler")}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-2.5 text-xs font-semibold tracking-wide text-white shadow-[0_2px_8px_rgba(15,23,42,0.3)] transition-all duration-150 hover:bg-[#1E293B] active:scale-[0.99]"
                      >
                        <ArrowRight className="h-4 w-4 stroke-[2]" />
                        <span>Haftayı Gör</span>
                      </button>

                      <button
                        onClick={() => setIsPredictionModalOpen(true)}
                        disabled={predictionLocked}
                        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-5 py-2.5 text-xs font-semibold tracking-wide text-[#0F172A] shadow-2xs transition-all duration-150 hover:border-slate-400 hover:bg-[#F8FAFC] active:scale-[0.99] ${
                          predictionLocked ? "cursor-not-allowed opacity-75" : ""
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#059669] stroke-[1.75]" />
                        <span>{allUsersHavePredicted ? "Tahminler Tamamlandı" : "Tahmin Yap"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={openAdmin}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-5 py-2.5 text-xs font-semibold tracking-wide text-[#0F172A] shadow-2xs transition-all duration-150 hover:border-slate-400 hover:bg-[#F8FAFC] active:scale-[0.99]"
                      >
                        <Settings className="h-4 w-4 text-[#0F172A] stroke-[1.75]" />
                        <span>Yönetim</span>
                      </button>
                    </div>
                  </div>

                  {/* SAĞ KART: Haftanın Nabzı */}
                  <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 text-[#0F172A] shadow-sm transition-all duration-200 hover:border-slate-300">
                    {/* Üst Rekabet & Prestij Vurgusu */}
                    <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-[#1E3A8A] via-[#D97706] to-[#059669]" />

                    <div>
                      {/* Başlık & Durum */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#1E3A8A]">
                            <Flame className="h-3.5 w-3.5 text-[#D97706]" />
                            <span>Haftanın Nabzı</span>
                          </div>

                          <div className="font-serif mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
                            {formatWeekLabel(activeWeek?.label) || "Beklemede"}
                          </div>
                        </div>

                        <div
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${
                            activeWeek?.isPublished
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : allUsersHavePredicted
                                ? "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
                                : "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                          }`}
                        >
                          {activeWeek?.isPublished
                            ? "Yayında"
                            : allUsersHavePredicted
                              ? "Kilitlendi"
                              : "Tahmin Açık"}
                        </div>
                      </div>

                      {/* Haftalık Editoryal Maç Özeti & Katılım Barı */}
                      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] p-4 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Katılım:</span>
                            <span className="font-mono text-xl sm:text-2xl font-black text-[#0F172A]">
                              %{participationPercent}
                            </span>
                            {allUsersHavePredicted && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#047857]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#047857]" />
                                Tamamlandı
                              </span>
                            )}
                          </div>

                          <span className="text-xs font-semibold text-[#64748B]">
                            {allUsersHavePredicted
                              ? "Tüm yazarlar tamamladı"
                              : `${existingPredictors.length}/${users.length} yazar tamamladı`}
                          </span>
                        </div>

                        {/* İnce zarif ilerleme çubuğu */}
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${participationPercent}%`,
                              background: allUsersHavePredicted
                                ? "linear-gradient(90deg, #059669 0%, #10B981 100%)"
                                : "linear-gradient(90deg, #1E3A8A 0%, #2563EB 100%)"
                            }}
                          />
                        </div>

                        <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-[#E2E8F0] pt-3 text-center">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Maç</div>
                            <div className="font-mono mt-0.5 text-xs sm:text-sm font-bold text-[#0F172A]">{activeWeekMatches.length}</div>
                          </div>
                          <div className="border-x border-[#E2E8F0]">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Sonuç</div>
                            <div className="font-mono mt-0.5 text-xs sm:text-sm font-bold text-[#0F172A]">{playedMatchesCount}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Bekleyen</div>
                            <div className="font-mono mt-0.5 text-xs sm:text-sm font-bold text-[#0F172A]">{pendingMatchesCount}</div>
                          </div>
                        </div>
                      </div>

                      {/* Liderlik Durumu: Altın / Zirve Rozetiyle Vurgulanan Editoryal Kart */}
                      {leader && (
                        <div className="mt-3.5 relative overflow-hidden rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 p-3.5 shadow-2xs">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-xs font-bold text-[#0F172A] shadow-xs">
                                {leader.clubLogo || flagUrlForEmoji(leader.flagEmoji, 80) ? (
                                  <img
                                    src={leader.clubLogo || flagUrlForEmoji(leader.flagEmoji, 80)!}
                                    alt={leader.name}
                                    referrerPolicy="no-referrer"
                                    className="h-6 w-6 object-contain drop-shadow-2xs"
                                    loading="lazy"
                                  />
                                ) : (
                                  <UserFlag flagEmoji={leader.flagEmoji} className="h-6 w-6 text-base" />
                                )}
                                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-white ring-2 ring-white">
                                  ★
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate text-xs font-bold text-[#0F172A]">
                                    {leader.name}
                                  </span>
                                  <span className="inline-flex items-center rounded-md border border-amber-300 bg-amber-100/80 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider text-amber-800">
                                    Lider
                                  </span>
                                </div>
                                <div className="text-[11px] font-medium text-[#64748B]">
                                  {leader.totalPoints || 0} puan ile zirvede
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-mono text-sm font-bold text-[#0F172A]">
                                +{leaderGap}
                              </div>
                              <div className="text-[9px] font-bold uppercase tracking-wider text-[#64748B]">
                                fark
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Yazarlar: Editoryal Kartuş Formatında Kulüp Armaları */}
                      <div className="mt-4">
                        <div className="mb-2.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                          <span className="font-semibold text-[#0F172A]">Yazarlar ({existingPredictors.length}/${users.length})</span>
                          <span className="text-[10px] text-[#94A3B8]">
                            {allUsersHavePredicted ? "Tümü hazır" : `${users.length - existingPredictors.length} bekliyor`}
                          </span>
                        </div>

                        <div className="grid grid-cols-5 gap-3.5 place-items-center">
                          {users.map((user) => {
                            const hasPredicted = existingPredictors.includes(user.id);

                            return (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => setSelectedUserForProfile(user)}
                                title={`${user.name}: ${hasPredicted ? "Tahminini girdi" : "Tahmin bekleniyor"}`}
                                className="group relative flex flex-col items-center gap-1.5 w-full cursor-pointer select-none text-center focus:outline-none transition-transform duration-200 hover:-translate-y-[2px]"
                              >
                                <AuthorClubLens user={user} hasPredicted={hasPredicted} />

                                <span
                                  className="w-full truncate text-center font-medium leading-tight"
                                  style={{
                                    fontSize: "11px",
                                    letterSpacing: "-0.01em",
                                    color: "#0F172A"
                                  }}
                                  title={user.name}
                                >
                                  {formatAuthorName(user.name)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bekleyenler: Dikkat Çeken Editoryal Bilgi Şeridi */}
                    {!allUsersHavePredicted && activeWeek && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs leading-relaxed shadow-2xs">
                        <div className="flex items-center gap-1.5 mb-1 font-bold text-amber-900">
                          <Clock3 className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                          <span>Tahmini Beklenen Yazarlar:</span>
                        </div>
                        <span className="text-amber-950 font-semibold">
                          {waitingUsers.map((user) => user.name).join(", ") || "Bekleyen yok"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "tahminler" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <section id="mac-takvimi" className="scroll-mt-28">
                  <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Hafta Seçimi</div>
                        <h2 className="mt-1 font-serif text-xl font-bold tracking-tight text-[#0F172A]">
                          Haftalar ve Maç Detayı
                        </h2>
                      </div>

                      <History className="h-5 w-5 text-[#1E3A8A]" />
                    </div>

                    {/* Desktop/Tablet Week Buttons - Modern White/Navy Pills */}
                    <div className="hidden sm:flex mb-5 gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {weeks.map((week) => (
                        <button
                          key={week.id}
                          type="button"
                          onClick={() => setSelectedWeekId(week.id)}
                          className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 ${
                            selectedWeekId === week.id
                              ? "border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-sm"
                              : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-slate-300 hover:bg-[#F8FAFC]"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{formatWeekLabel(week.label)}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                selectedWeekId === week.id
                                  ? "bg-white/20 text-white"
                                  : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]"
                              }`}
                            >
                              {week.isActive
                                ? "Aktif"
                                : week.pointsPublished
                                  ? "Puanlandı"
                                  : week.isPublished
                                    ? "Yayında"
                                    : "Geçmiş"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Mobile Week Select Dropdown */}
                    <div className="block sm:hidden mb-5">
                      <label htmlFor="week-select-mobile" className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
                        Hafta Seçin:
                      </label>
                      <select
                        id="week-select-mobile"
                        value={selectedWeekId}
                        onChange={(e) => setSelectedWeekId(e.target.value)}
                        className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] outline-none focus:border-[#1E3A8A]"
                      >
                        {weeks.map((week) => (
                          <option key={week.id} value={week.id}>
                            {formatWeekLabel(week.label)} ({week.isActive ? "Aktif" : week.pointsPublished ? "Puanlandı" : week.isPublished ? "Yayında" : "Geçmiş"})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedWeek ? (
                      <WeekMatches
                        label={formatWeekLabel(selectedWeek.label)}
                        matches={selectedWeekMatches}
                        predictions={selectedWeekPredictions}
                        users={users}
                        isPublished={selectedWeek.isPublished || selectedWeek.id !== activeWeek?.id}
                        pointsPublished={selectedWeek.pointsPublished}
                        isAdmin={isAdmin}
                      />
                    ) : (
                      <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-8 text-center">
                        <p className="font-semibold text-gray-500">
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

            {activeTab === "hafiza" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Üst Bilgi Kartı */}
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center rounded-2xl bg-white p-5 sm:p-6 shadow-xs border border-[#E2E8F0]">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                      <Archive className="h-4 w-4 stroke-[1.5]" />
                      Lig Hafızası
                    </div>
                    <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#0F172A]">
                      Geçmiş Sezonlar & Arşiv
                    </h2>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Eski liglerin şampiyonları, puan tabloları ve haftalık maç detayları burada saklanır.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3.5 py-1.5 text-xs font-semibold text-[#047857]">
                      <span className="h-2 w-2 rounded-full bg-[#059669]" />
                      {finishedSeasons.length} Kayıtlı Sezon
                    </span>
                  </div>
                </div>

                {/* 2 Sütunlu Sezon Kartları Izgarası */}
                {finishedSeasons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          className="group rounded-2xl bg-white p-5 text-left border border-[#E2E8F0] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 cursor-pointer"
                        >
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-serif text-base font-bold text-[#0F172A] transition group-hover:text-[#1E3A8A]">
                                {season.name}
                              </h3>
                              <p className="mt-0.5 text-xs text-[#64748B]">
                                Tamamlanan Sezon
                              </p>
                            </div>

                            <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                              Arşiv
                            </span>
                          </div>

                          {champion ? (
                            <div className="mb-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                              <div className="mb-1.5 text-[10px] font-medium text-[#64748B]">
                                Şampiyon
                              </div>

                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white p-0.5 shadow-2xs border border-[#E2E8F0]">
                                    {champion.clubLogo || flagUrlForEmoji(champion.flagEmoji, 80) ? (
                                      <img
                                        src={champion.clubLogo || flagUrlForEmoji(champion.flagEmoji, 80)!}
                                        alt={champion.name}
                                        referrerPolicy="no-referrer"
                                        className="h-6 w-6 object-contain"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <UserFlag flagEmoji={champion.flagEmoji} className="h-6 w-6 text-base" />
                                    )}
                                  </div>
                                  <span className="text-sm font-bold text-[#0F172A]">
                                    {champion.name}
                                  </span>
                                </div>

                                <span className="rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-1 text-xs font-bold text-[#1D4ED8] shadow-2xs">
                                  {champion.score} Puan
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="mb-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs text-[#64748B]">
                              Şampiyon bilgisi bekleniyor.
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-xs font-semibold text-[#1E3A8A]">
                            <span>Sezon Detayları</span>
                            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1 stroke-[1.75]" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-12 text-center shadow-xs">
                    <Archive className="mx-auto h-10 w-10 text-slate-400 stroke-[1.5]" />
                    <h3 className="mt-3 text-base font-bold text-[#0F172A]">Henüz Arşivlenmiş Sezon Yok</h3>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Aktif sezon tamamlandığında lig verileri buraya otomatik olarak arşivlenir.
                    </p>
                  </div>
                )}
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
                      <h3 className="text-2xl font-black text-slate-850">
                        {lastChampion.name}
                      </h3>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                        {lastFinishedSeason.name}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 text-center">
                      <div className="text-2xl font-black text-orange-600">
                        {lastChampion.score}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Puan
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 text-center">
                      <div className="text-2xl font-black text-slate-850">
                        {lastChampion.exacts}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Tam
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 text-center">
                      <div className="text-2xl font-black text-slate-850">
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
                            <h3 className="text-lg font-bold text-[#1A1A1A] transition group-hover:text-[#D96B43]">
                              {season.name}
                            </h3>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#6B6760]">
                              Tamamlanan sezon
                            </p>
                          </div>

                          <span className="rounded-full border border-[#EAE6DF] bg-[#FAF8F5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B6760]">
                            Arşiv
                          </span>
                        </div>

                        {champion ? (
                          <div className="mb-5 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-3">
                            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#6B6760]">
                              Şampiyon
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <UserFlag flagEmoji={champion.flagEmoji} className="h-6 w-6 text-2xl" />
                                <span className="font-bold text-[#1A1A1A]">
                                  {champion.name}
                                </span>
                              </div>

                              <span className="rounded-xl bg-[#FDF4F0] border border-[#F3DCD2] px-3 py-1.5 text-sm font-black text-[#D96B43]">
                                {champion.score} Puan
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-5 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-3 text-sm font-semibold text-[#6B6760]">
                            Şampiyon bilgisi bekleniyor.
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-[#EAE6DF] pt-4 text-xs font-bold uppercase tracking-wider text-[#D96B43]">
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

      <footer className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-center gap-4 border-t border-[#EAE6DF] pb-12 pt-8">
        <p className="text-xs text-[#6B6760]">
          &copy; {new Date().getFullYear()} Skor Yazarları. Özel tahmin ligi merkezi.
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={openAdmin}
            className="rounded-full p-2 text-[#6B6760] transition duration-200 hover:bg-[#FAF8F5] hover:text-[#1A1A1A]"
            title={isAdmin ? "Yönetici Panelini Aç" : "Yönetici Girişi (Şifre İster)"}
            id="admin-footer-btn-login"
          >
            {isAdmin ? <Unlock className="h-4 w-4 text-[#2D8A66]" /> : <Lock className="h-4 w-4" />}
          </button>

          <button
            onClick={async () => {
              await signOut(auth);
            }}
            className="rounded-full p-2 text-[#6B6760] transition duration-200 hover:bg-[#FAF8F5] hover:text-rose-500"
            title="Yönetici Çıkışı"
            id="admin-footer-btn-logout"
          >
            <Lock className="h-4 w-4 text-[#6B6760] hover:text-rose-500" />
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
              className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-md"
              onClick={() => setIsAdminPanelOpen(false)}
            />

            <div className="relative max-h-[90vh] w-full max-w-6xl">
              <button
                onClick={() => setIsAdminPanelOpen(false)}
                className="absolute -top-10 right-0 flex items-center gap-2 rounded-full border border-[#EAE6DF] bg-white/95 px-3 py-1 text-xs font-bold text-[#1A1A1A] shadow-sm transition hover:bg-white"
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
