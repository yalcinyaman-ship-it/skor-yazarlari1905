import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Users,
  Calendar,
  List,
  Trophy,
  CheckSquare,
  Plus,
  Trash2,
  Save,
  Power,
  Eye,
  Play,
  AlertTriangle,
  Check,
  Edit,
  Target,
  Upload,
  Medal
} from "lucide-react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  getDocs,
  writeBatch,
  Timestamp,
  where
} from "firebase/firestore";
import { db } from "../firebase";
import { User, Season, Week, Match, Prediction, sanitizeFlagEmoji } from "../types";
import { calculateWeekPoints } from "../utils/calculatePoints";

const FLAG_OPTIONS = ["⚽", "🏆", "🦁", "🦅", "🐺", "⚡", "🔥", "👑", "🌟", "⚔️", "🎯", "💎", "🇹🇷"];

type AdminTab = "users" | "seasons" | "weeks" | "matches" | "results" | "predictions" | "standings";

const getDateMs = (date: any) => {
  if (!date) return 0;
  if (typeof date.toDate === "function") return date.toDate().getTime();
  if (date.seconds) return date.seconds * 1000;
  if (date instanceof Date) return date.getTime();
  if (typeof date === "string") return new Date(date).getTime();
  return 0;
};

const getTodayString = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(false);

  const [userName, setUserName] = useState("");
  const [userFlag, setUserFlag] = useState("⚽");
  const [userColorCount, setUserColorCount] = useState<2 | 3>(2);
  const [userColors, setUserColors] = useState<string[]>(["#0a6b3d", "#0058bc", "#ffffff"]);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editingUserPoints, setEditingUserPoints] = useState<string | null>(null);
  const [tempUserPoints, setTempUserPoints] = useState<number | string>(0);

  const [seasonName, setSeasonName] = useState("");
  const [weekLabel, setWeekLabel] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [matchDate, setMatchDate] = useState(getTodayString());

  useEffect(() => {
    const unsubUsers = onSnapshot(query(collection(db, "users"), orderBy("name")), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as User)));
    });

    const unsubSeasons = onSnapshot(query(collection(db, "seasons"), orderBy("startedAt", "desc")), (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Season));
      setSeasons(items);
      setActiveSeason(items.find((x) => x.status === "active") || null);
    });

    return () => {
      unsubUsers();
      unsubSeasons();
    };
  }, []);

  useEffect(() => {
    if (!activeSeason) {
      setWeeks([]);
      setSelectedWeek(null);
      return;
    }

    const unsubWeeks = onSnapshot(
      query(collection(db, "seasons", activeSeason.id, "weeks"), orderBy("weekNumber")),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Week));
        setWeeks(items);

        if (!selectedWeek && items.length > 0) {
          const active = items.find((x) => x.isActive);
          setSelectedWeek(active || items[items.length - 1]);
        }
      }
    );

    return () => unsubWeeks();
  }, [activeSeason, selectedWeek]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setLoading(true);

    try {
      await addDoc(collection(db, "users"), {
        name: userName.trim(),
        flagEmoji: userFlag,
        colors: userColors.slice(0, userColorCount),
        createdAt: serverTimestamp(),
        totalPoints: 0,
        totalExacts: 0,
        totalResults: 0
      });

      setUserName("");
      setUserColors(["#0a6b3d", "#0058bc", "#ffffff"]);
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      setDeletingUserId(null);
    } catch (err) {
      alert(err);
    }
  };

  const handleSaveUserPoints = async (userId: string) => {
    try {
      const points = parseInt(tempUserPoints as string, 10) || 0;
      await updateDoc(doc(db, "users", userId), { 
        totalPoints: points
      });
      setEditingUserPoints(null);
    } catch (err) {
      alert(err);
    }
  };

  const handleStartSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seasonName.trim()) return;

    setLoading(true);

    try {
      await addDoc(collection(db, "seasons"), {
        name: seasonName.trim(),
        status: "active",
        startedAt: serverTimestamp(),
        finishedAt: null
      });

      setSeasonName("");
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSeason = async () => {
    if (!activeSeason) return;
    if (!confirm("Bu sezonu kapatmak istiyor musunuz? Sezon arşive taşınacak.")) return;

    setLoading(true);

    try {
      const sortedUsers = [...users].sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0));

      const finalStandings = sortedUsers.map((u: any, index) => ({
        rank: index + 1,
        name: u.name,
        flagEmoji: u.flagEmoji,
        totalPoints: u.totalPoints || 0
      }));

      await updateDoc(doc(db, "seasons", activeSeason.id), {
        status: "finished",
        finishedAt: serverTimestamp(),
        finalStandings
      });
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeason || !weekLabel.trim()) return;

    setLoading(true);

    try {
      const nextNum = weeks.length + 1;

      await addDoc(collection(db, "seasons", activeSeason.id, "weeks"), {
        label: weekLabel.trim(),
        weekNumber: nextNum,
        isActive: false,
        isPublished: false,
        pointsPublished: false
      });

      setWeekLabel("");
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetActiveWeek = async (weekId: string) => {
    if (!activeSeason) return;

    const batch = writeBatch(db);

    weeks.forEach((week) => {
      const ref = doc(db, "seasons", activeSeason.id, "weeks", week.id);
      batch.update(ref, {
        isActive: week.id === weekId,
        ...(week.id === weekId ? { isPublished: false } : {})
      });
    });

    try {
      await batch.commit();
    } catch (err) {
      alert(err);
    }
  };

  const toggleWeekStatus = async (weekId: string, field: "isPublished" | "pointsPublished", value: boolean) => {
    if (!activeSeason) return;

    try {
      await updateDoc(doc(db, "seasons", activeSeason.id, "weeks", weekId), { [field]: value });
    } catch (err) {
      alert(err);
    }
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeason || !selectedWeek || !homeTeam.trim() || !awayTeam.trim() || !matchDate) return;

    setLoading(true);

    try {
      const [year, month, day] = matchDate.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);

      await addDoc(collection(db, "seasons", activeSeason.id, "weeks", selectedWeek.id, "matches"), {
        homeTeam: homeTeam.trim(),
        awayTeam: awayTeam.trim(),
        matchDate: Timestamp.fromDate(dateObj),
        actualHome: null,
        actualAway: null
      });

      setHomeTeam("");
      setAwayTeam("");
      // Do not clear matchDate to allow the user to easily adjust it back and forth
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[85vh] max-h-[820px] w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-50 md:flex md:flex-col">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-black uppercase tracking-[0.08em] text-slate-950">
                Admin Panel
              </h3>
              <p className="text-xs font-bold text-slate-400">
                Skor Yazarları
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <TabButton id="users" label="Kullanıcılar" active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users className="h-4 w-4" />} />
          <TabButton id="seasons" label="Sezonlar" active={activeTab === "seasons"} onClick={() => setActiveTab("seasons")} icon={<Calendar className="h-4 w-4" />} />
          <TabButton id="weeks" label="Haftalar" active={activeTab === "weeks"} onClick={() => setActiveTab("weeks")} icon={<List className="h-4 w-4" />} />
          <TabButton id="matches" label="Maçlar" active={activeTab === "matches"} onClick={() => setActiveTab("matches")} icon={<CheckSquare className="h-4 w-4" />} />
          <TabButton id="results" label="Sonuçlar" active={activeTab === "results"} onClick={() => setActiveTab("results")} icon={<Check className="h-4 w-4" />} />
          <TabButton id="predictions" label="Tahminler" active={activeTab === "predictions"} onClick={() => setActiveTab("predictions")} icon={<Edit className="h-4 w-4" />} />
          <TabButton id="standings" label="Puan Durumu" active={activeTab === "standings"} onClick={() => setActiveTab("standings")} icon={<Trophy className="h-4 w-4" />} />
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-slate-200 bg-white p-4 md:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as AdminTab)}
            className="input-field w-full"
          >
            <option value="users">Kullanıcılar</option>
            <option value="seasons">Sezonlar</option>
            <option value="weeks">Haftalar</option>
            <option value="matches">Maçlar</option>
            <option value="results">Sonuçlar</option>
            <option value="predictions">Tahminler</option>
            <option value="standings">Puan Durumu</option>
          </select>
        </div>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-5 sm:p-6">
          {activeTab === "users" && (
            <UsersTab
              users={users}
              loading={loading}
              userName={userName}
              setUserName={setUserName}
              userFlag={userFlag}
              setUserFlag={setUserFlag}
              userColorCount={userColorCount}
              setUserColorCount={setUserColorCount}
              userColors={userColors}
              setUserColors={setUserColors}
              deletingUserId={deletingUserId}
              setDeletingUserId={setDeletingUserId}
              editingUserPoints={editingUserPoints}
              setEditingUserPoints={setEditingUserPoints}
              tempUserPoints={tempUserPoints}
              setTempUserPoints={setTempUserPoints}
              handleAddUser={handleAddUser}
              handleDeleteUser={handleDeleteUser}
              handleSaveUserPoints={handleSaveUserPoints}
            />
          )}

          {activeTab === "seasons" && (
            <SeasonsTab
              seasons={seasons}
              activeSeason={activeSeason}
              seasonName={seasonName}
              setSeasonName={setSeasonName}
              loading={loading}
              handleStartSeason={handleStartSeason}
              handleFinishSeason={handleFinishSeason}
            />
          )}

          {activeTab === "weeks" && (
            <WeeksTab
              activeSeason={activeSeason}
              weeks={weeks}
              weekLabel={weekLabel}
              setWeekLabel={setWeekLabel}
              loading={loading}
              handleAddWeek={handleAddWeek}
              handleSetActiveWeek={handleSetActiveWeek}
              toggleWeekStatus={toggleWeekStatus}
            />
          )}

          {activeTab === "matches" && (
            <MatchesTab
              activeSeason={activeSeason}
              weeks={weeks}
              selectedWeek={selectedWeek}
              setSelectedWeek={setSelectedWeek}
              homeTeam={homeTeam}
              setHomeTeam={setHomeTeam}
              awayTeam={awayTeam}
              setAwayTeam={setAwayTeam}
              matchDate={matchDate}
              setMatchDate={setMatchDate}
              handleAddMatch={handleAddMatch}
            />
          )}

          {activeTab === "results" && (
            !activeSeason ? <NoActiveSeason /> : (
              <ResultsTab activeSeason={activeSeason} weeks={weeks} users={users} selectedWeekInitial={selectedWeek} />
            )
          )}

          {activeTab === "predictions" && (
            !activeSeason ? <NoActiveSeason /> : (
              <PredictionsTab activeSeason={activeSeason} weeks={weeks} users={users} />
            )
          )}

          {activeTab === "standings" && (
            <StandingsTab seasons={seasons} users={users} />
          )}
        </main>
      </div>
    </div>
  );
};

const PanelTitle = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
  <div className="mb-6 flex items-start justify-between gap-4">
    <div>
      <h3 className="font-display flex items-center gap-2 text-xl font-black uppercase tracking-[-0.01em] text-slate-950">
        {icon}
        {title}
      </h3>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        {description}
      </p>
    </div>
  </div>
);

const TabButton = ({ label, active, onClick, icon }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${
      active
        ? "bg-slate-950 text-white shadow-sm"
        : "text-slate-500 hover:bg-white hover:text-slate-950"
    }`}
  >
    {icon}
    {label}
  </button>
);

const NoActiveSeason = () => (
  <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
    <AlertTriangle className="h-14 w-14 text-amber-500" />
    <div>
      <h3 className="font-display text-xl font-black uppercase tracking-[-0.01em] text-slate-950">
        Aktif sezon yok
      </h3>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        Önce Sezonlar sekmesinden yeni bir sezon başlat.
      </p>
    </div>
  </div>
);

const UsersTab = ({
  users,
  loading,
  userName,
  setUserName,
  userFlag,
  setUserFlag,
  userColorCount,
  setUserColorCount,
  userColors,
  setUserColors,
  deletingUserId,
  setDeletingUserId,
  editingUserPoints,
  setEditingUserPoints,
  tempUserPoints,
  setTempUserPoints,
  handleAddUser,
  handleDeleteUser,
  handleSaveUserPoints
}: any) => {
  return (
    <div>
      <PanelTitle title="Kullanıcılar" description="Yazar ekle, renklerini seç, puanları yönet." icon={<Users className="h-5 w-5 text-emerald-700" />} />

      <form onSubmit={handleAddUser} className="card-base mb-6 space-y-5 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Ad soyad
            </label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="input-field w-full"
              placeholder="Ör: Burak Yılmaz"
            />
          </div>

          <button disabled={loading} className="btn-primary self-end justify-center h-[46px]">
            <Plus className="h-4 w-4" />
            Ekle
          </button>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">
            Bayrak / ikon
          </label>
          <div className="flex flex-wrap gap-2">
            {FLAG_OPTIONS.map((flag) => (
              <button
                key={flag}
                type="button"
                onClick={() => setUserFlag(flag)}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-lg transition ${
                  userFlag === flag
                    ? "border-emerald-700 bg-emerald-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Renk sayısı
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUserColorCount(2)}
                className={`rounded-2xl border px-4 py-2 text-xs font-black ${
                  userColorCount === 2 ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                2 renk
              </button>
              <button
                type="button"
                onClick={() => setUserColorCount(3)}
                className={`rounded-2xl border px-4 py-2 text-xs font-black ${
                  userColorCount === 3 ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                3 renk
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Renkler
            </label>
            <div className="flex gap-2">
              {Array.from({ length: userColorCount }).map((_, index) => (
                <input
                  key={index}
                  type="color"
                  value={userColors[index]}
                  onChange={(e) => {
                    const next = [...userColors];
                    next[index] = e.target.value;
                    setUserColors(next);
                  }}
                  className="h-10 w-12 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Hızlı seçim
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                ["#a32638", "#fdb912"],
                ["#00113f", "#fded00"],
                ["#000000", "#ffffff"],
                ["#8c001a", "#44a0d1"],
                ["#0a6b3d", "#0058bc"]
              ].map((palette, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUserColorCount(palette.length as 2 | 3);
                    setUserColors([...palette, "#ffffff"]);
                  }}
                  className="flex h-10 overflow-hidden rounded-xl border border-slate-200 transition hover:-translate-y-0.5"
                >
                  {palette.map((color, colorIndex) => (
                    <div key={colorIndex} className="h-full w-6" style={{ backgroundColor: color }} />
                  ))}
                </button>
              ))}
            </div>
            </div>
        </div>
      </form>

      <div className="space-y-3">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
          Sistemdeki kullanıcılar ({users.length})
        </div>

        {users.map((user: any) => (
          <div key={user.id} className="card-base flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-3xl">{sanitizeFlagEmoji(user.flagEmoji)}</span>
              <div className="min-w-0">
                <div className="truncate font-black text-slate-950">{user.name}</div>
                <div className="flex items-center gap-3 mt-1">
                  {user.colors && user.colors.length > 0 && (
                    <div className="flex gap-1">
                      {user.colors.map((color: string, index: number) => (
                        <div key={index} className="h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {editingUserPoints === user.id ? (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">Puan:</span>
                    <input
                      type="number"
                      value={tempUserPoints}
                      onChange={(e) => setTempUserPoints(e.target.value)}
                      className="input-field w-16 text-right"
                    />
                  </div>
                  <button onClick={() => handleSaveUserPoints(user.id)} className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-black text-white">
                    Kaydet
                  </button>
                  <button onClick={() => setEditingUserPoints(null)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-500">
                    İptal
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Puan
                    </div>
                    <div className="stat-number text-lg font-black text-slate-950">
                      {user.totalPoints || 0}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setTempUserPoints(user.totalPoints || 0);
                      setEditingUserPoints(user.id);
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-500 hover:bg-slate-50"
                  >
                    Düzenle
                  </button>
                </div>
              )}

              {deletingUserId === user.id ? (
                <div className="flex gap-2">
                  <button onClick={() => setDeletingUserId(null)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-500">
                    İptal
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white">
                    Sil
                  </button>
                </div>
              ) : (
                <button onClick={() => setDeletingUserId(user.id)} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SeasonsTab = ({ seasons, activeSeason, seasonName, setSeasonName, loading, handleStartSeason, handleFinishSeason }: any) => (
  <div>
    <PanelTitle title="Sezonlar" description="Yeni sezon başlat veya aktif sezonu arşive taşı." icon={<Calendar className="h-5 w-5 text-emerald-700" />} />

    {activeSeason ? (
      <div className="card-base mb-6 border-l-4 border-emerald-700 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-display text-2xl font-black uppercase tracking-[-0.01em] text-slate-950">{activeSeason.name}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {activeSeason.startedAt?.toDate?.()?.toLocaleDateString("tr-TR") || "Tarih bekleniyor"} tarihinde başladı.
            </p>
          </div>
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700">
            Aktif
          </span>
        </div>

        <button onClick={handleFinishSeason} disabled={loading} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-red-700">
          <Power className="h-4 w-4" />
          Sezonu Tamamla
        </button>
      </div>
    ) : (
      <form onSubmit={handleStartSeason} className="card-base mb-6 space-y-4 p-6">
        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
            Sezon adı
          </label>
          <input
            value={seasonName}
            onChange={(e) => setSeasonName(e.target.value)}
            className="input-field w-full text-lg"
            placeholder="Ör: 2026 Bahar Ligi"
          />
        </div>
        <button disabled={loading} className="btn-primary w-full justify-center py-4">
          <Play className="h-5 w-5" />
          Sezonu Başlat
        </button>
      </form>
    )}

    <div className="space-y-3">
      <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
        Geçmiş sezonlar
      </div>

      {seasons.filter((s: Season) => s.status === "finished").map((season: Season) => (
        <div key={season.id} className="card-base flex items-center justify-between p-4">
          <div>
            <div className="font-black text-slate-950">{season.name}</div>
            <div className="text-xs font-semibold text-slate-400">
              {(season.startedAt as any)?.toDate?.()?.getFullYear() || "..."} - {(season.finishedAt as any)?.toDate?.()?.getFullYear() || "..."}
            </div>
          </div>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">
            Arşiv
          </span>
        </div>
      ))}
    </div>
  </div>
);

const WeeksTab = ({ activeSeason, weeks, weekLabel, setWeekLabel, loading, handleAddWeek, handleSetActiveWeek, toggleWeekStatus }: any) => {
  if (!activeSeason) return <NoActiveSeason />;

  return (
    <div>
      <PanelTitle title="Haftalar" description="Hafta oluştur, aktif haftayı seç ve yayın durumunu yönet." icon={<List className="h-5 w-5 text-emerald-700" />} />

      <form onSubmit={handleAddWeek} className="card-base mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
            Hafta adı
          </label>
          <input
            value={weekLabel}
            onChange={(e) => setWeekLabel(e.target.value)}
            className="input-field w-full"
            placeholder={`Ör: ${weeks.length + 1}. Hafta`}
          />
        </div>
        <button disabled={loading} className="btn-primary justify-center">
          Hafta Ekle
        </button>
      </form>

      <div className="space-y-3">
        {weeks.map((week: Week) => (
          <div key={week.id} className="card-base flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-xs font-black text-slate-600">
                {week.weekNumber}
              </span>
              <div>
                <div className="font-black text-slate-950">{week.label}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {week.isActive && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">Aktif</span>}
                  {week.isPublished && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">Yayında</span>}
                  {week.pointsPublished && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">Puanlandı</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {!week.isActive && (
                <button onClick={() => handleSetActiveWeek(week.id)} className="btn-secondary px-3 py-2 text-xs">
                  Aktif Yap
                </button>
              )}
              <button
                onClick={() => toggleWeekStatus(week.id, "isPublished", !week.isPublished)}
                className={`rounded-xl border px-3 py-2 text-xs font-black ${
                  week.isPublished
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {week.isPublished ? "Yayından Kaldır" : "Yayınla"}
              </button>
              <button
                onClick={async () => {
                  if (confirm("Bu haftayı silmek istiyor musunuz?")) {
                    await deleteDoc(doc(db, "seasons", activeSeason.id, "weeks", week.id));
                  }
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MatchesTab = ({
  activeSeason,
  weeks,
  selectedWeek,
  setSelectedWeek,
  homeTeam,
  setHomeTeam,
  awayTeam,
  setAwayTeam,
  matchDate,
  setMatchDate,
  handleAddMatch
}: any) => {
  if (!activeSeason) return <NoActiveSeason />;

  return (
    <div>
      <PanelTitle title="Maçlar" description="Seçili haftaya maç ekle veya maçları sil." icon={<CheckSquare className="h-5 w-5 text-emerald-700" />} />

      <div className="card-base mb-6 p-5">
        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
          Hafta seç
        </label>
        <select
          value={selectedWeek?.id || ""}
          onChange={(e) => setSelectedWeek(weeks.find((w: Week) => w.id === e.target.value) || null)}
          className="input-field w-full"
        >
          <option value="">Hafta seçiniz...</option>
          {weeks.map((week: Week) => (
            <option key={week.id} value={week.id}>{week.label}</option>
          ))}
        </select>
      </div>

      {selectedWeek && (
        <>
          <form onSubmit={handleAddMatch} className="card-base mb-6 grid grid-cols-1 gap-4 p-5 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">Ev sahibi</label>
              <input value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} className="input-field w-full" required />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">Deplasman</label>
              <input value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} className="input-field w-full" required />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">Tarih</label>
              <input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className="input-field w-full" required />
            </div>
            <button className="btn-primary self-end justify-center">
              Maç Ekle
            </button>
          </form>

          <MatchList seasonId={activeSeason.id} weekId={selectedWeek.id} />
        </>
      )}
    </div>
  );
};

const MatchList = ({ seasonId, weekId }: { seasonId: string; weekId: string }) => {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "seasons", seasonId, "weeks", weekId, "matches"), (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
      items.sort((a, b) => getDateMs(a.matchDate) - getDateMs(b.matchDate));
      setMatches(items);
    });

    return () => unsub();
  }, [seasonId, weekId]);

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <div key={match.id} className="card-base flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-black text-slate-950">
              {match.homeTeam} <span className="text-slate-300">vs</span> {match.awayTeam}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-400">
              {match.matchDate?.toDate?.()?.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "long" }) || "Tarih yok"}
            </div>
          </div>
          <button
            onClick={async () => {
              if (confirm("Maçı silmek istiyor musunuz?")) {
                await deleteDoc(doc(db, "seasons", seasonId, "weeks", weekId, "matches", match.id));
              }
            }}
            className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

const PredictionsTab = ({ activeSeason, weeks, users }: any) => {
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [localScores, setLocalScores] = useState<Record<string, { home: number | null; away: number | null }>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [entryMode, setEntryMode] = useState<"single" | "bulk">("single");
  const [bulkText, setBulkText] = useState("");
  const [bulkPreview, setBulkPreview] = useState<{
    userId: string;
    userName: string;
    userFlag: string;
    preds: { matchId: string; homeTeam: string; awayTeam: string; home: number; away: number }[];
  }[]>([]);

  useEffect(() => {
    if (!activeSeason || !selectedWeek) return;

    const unsub = onSnapshot(
      collection(db, "seasons", activeSeason.id, "weeks", selectedWeek.id, "matches"),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
        items.sort((a, b) => getDateMs(a.matchDate) - getDateMs(b.matchDate));
        setMatches(items);
      }
    );

    return () => unsub();
  }, [activeSeason, selectedWeek]);

  useEffect(() => {
    if (!activeSeason || !selectedWeek || !selectedUser) return;

    const qPreds = query(
      collection(db, "seasons", activeSeason.id, "predictions"),
      where("weekId", "==", selectedWeek.id)
    );

    const unsub = onSnapshot(qPreds, (snap) => {
      const items = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Prediction))
        .filter((prediction) => prediction.userId === selectedUser.id);

      setPredictions(items);

      const nextScores: Record<string, { home: number | null; away: number | null }> = {};

      items.forEach((prediction) => {
        nextScores[prediction.matchId] = {
          home: prediction.predictedHome,
          away: prediction.predictedAway
        };
      });

      setLocalScores(nextScores);
    });

    return () => unsub();
  }, [activeSeason, selectedWeek, selectedUser]);

  const handleParseBulk = () => {
    if (!selectedWeek || matches.length === 0) {
      alert("Önce hafta seç ve o haftaya maç ekle.");
      return;
    }

    const lines = bulkText.split("\n").map((line) => line.trim()).filter(Boolean);
    const parsed: any[] = [];

    for (const line of lines) {
      let namePart = "";
      let scoresPart = "";

      if (line.includes(":")) {
        const parts = line.split(":");
        namePart = parts[0].trim();
        scoresPart = parts.slice(1).join(":").trim();
      } else {
        const matchNum = line.match(/\d/);

        if (matchNum && matchNum.index) {
          namePart = line.substring(0, matchNum.index).trim();
          scoresPart = line.substring(matchNum.index).trim();
        } else {
          continue;
        }
      }

      const matchedUser = users.find((user: any) => {
        const userName = user.name.toLowerCase().replace(/\s+/g, "");
        const incomingName = namePart.toLowerCase().replace(/\s+/g, "");

        return (
          userName === incomingName ||
          user.name.toLowerCase().includes(namePart.toLowerCase()) ||
          namePart.toLowerCase().includes(user.name.toLowerCase())
        );
      });

      if (!matchedUser) {
        alert(`Kullanıcı eşleştirilemedi: "${namePart}"`);
        return;
      }

      const scoreRegex = /(\d+)\s*[-_:]\s*(\d+)/g;
      const scoreMatches = [];
      let scoreMatch;

      while ((scoreMatch = scoreRegex.exec(scoresPart)) !== null) {
        scoreMatches.push({
          home: parseInt(scoreMatch[1], 10),
          away: parseInt(scoreMatch[2], 10)
        });
      }

      if (scoreMatches.length === 0) continue;

      const userPreds: any[] = [];

      for (let index = 0; index < matches.length; index++) {
        if (index < scoreMatches.length) {
          userPreds.push({
            matchId: matches[index].id,
            homeTeam: matches[index].homeTeam,
            awayTeam: matches[index].awayTeam,
            home: scoreMatches[index].home,
            away: scoreMatches[index].away
          });
        }
      }

      parsed.push({
        userId: matchedUser.id,
        userName: matchedUser.name,
        userFlag: matchedUser.flagEmoji || "⚽",
        preds: userPreds
      });
    }

    if (parsed.length === 0) {
      alert("Hiçbir tahmin çözümlenemedi. Örnek: Ahmet: 2-1 1-0 0-0");
      return;
    }

    setBulkPreview(parsed);
  };

  const handleSaveBulk = async () => {
    if (!activeSeason || !selectedWeek || bulkPreview.length === 0) return;

    setIsSaving(true);

    try {
      const batch = writeBatch(db);

      const qPreds = query(
        collection(db, "seasons", activeSeason.id, "predictions"),
        where("weekId", "==", selectedWeek.id)
      );

      const predSnap = await getDocs(qPreds);
      const existingPreds = predSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Prediction));

      for (const userPack of bulkPreview) {
        for (const item of userPack.preds) {
          const targetId = `${userPack.userId}_${item.matchId}`;
          const ref = doc(db, "seasons", activeSeason.id, "predictions", targetId);

          batch.set(ref, {
            userId: userPack.userId,
            weekId: selectedWeek.id,
            matchId: item.matchId,
            predictedHome: item.home,
            predictedAway: item.away,
            createdAt: serverTimestamp()
          });

          const extraPreds = existingPreds.filter(
            (prediction) =>
              prediction.userId === userPack.userId &&
              prediction.matchId === item.matchId &&
              prediction.id !== targetId
          );

          extraPreds.forEach((prediction) => {
            const extraRef = doc(db, "seasons", activeSeason.id, "predictions", prediction.id);
            batch.delete(extraRef);
          });
        }
      }

      await batch.commit();

      alert("Toplu tahminler kaydedildi.");
      setBulkPreview([]);
      setBulkText("");
    } catch (err) {
      alert("Hata oluştu: " + err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!activeSeason || !selectedUser || !selectedWeek) return;

    setIsSaving(true);

    try {
      const batch = writeBatch(db);

      for (const match of matches) {
        const score = localScores[match.id];

        if (!score || typeof score.home !== "number" || typeof score.away !== "number") continue;

        const targetId = `${selectedUser.id}_${match.id}`;
        const ref = doc(db, "seasons", activeSeason.id, "predictions", targetId);

        batch.set(ref, {
          userId: selectedUser.id,
          weekId: selectedWeek.id,
          matchId: match.id,
          predictedHome: score.home,
          predictedAway: score.away,
          createdAt: serverTimestamp()
        });

        const extraPreds = predictions.filter((prediction) => prediction.matchId === match.id && prediction.id !== targetId);

        extraPreds.forEach((prediction) => {
          const extraRef = doc(db, "seasons", activeSeason.id, "predictions", prediction.id);
          batch.delete(extraRef);
        });
      }

      await batch.commit();
      alert("Tahminler güncellendi.");
    } catch (err) {
      alert(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PanelTitle title="Tahminler" description="Tek kişi veya toplu tahmin girişi yap." icon={<Target className="h-5 w-5 text-emerald-700" />} />

      <div className="card-base mb-6 p-5">
        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
          Sezon haftası
        </label>
        <select
          className="input-field w-full"
          value={selectedWeek?.id || ""}
          onChange={(e) => {
            const week = weeks.find((item: Week) => item.id === e.target.value);
            setSelectedWeek(week || null);
            setSelectedUser(null);
            setBulkPreview([]);
          }}
        >
          <option value="">Hafta seçiniz...</option>
          {weeks.map((week: Week) => (
            <option key={week.id} value={week.id}>
              {week.label}
            </option>
          ))}
        </select>
      </div>

      {selectedWeek && (
        <div className="space-y-6">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setEntryMode("single")}
              className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider ${
                entryMode === "single" ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
            Tekil giriş
            </button>
            <button
              type="button"
              onClick={() => setEntryMode("bulk")}
              className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider ${
                entryMode === "bulk" ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Toplu giriş
            </button>
          </div>

          {entryMode === "single" && (
            <div className="space-y-4">
              <div className="card-base p-5">
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Yazar seç
                </label>
                <select
                  className="input-field w-full"
                  value={selectedUser?.id || ""}
                  onChange={(e) => {
                    const user = users.find((item: User) => item.id === e.target.value);
                    setSelectedUser(user || null);
                  }}
                >
                  <option value="">Seçiniz...</option>
                  {users.map((user: User) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              {matches.length > 0 && selectedUser ? (
                <div className="card-base overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="border-b border-slate-200 p-4">Maç</th>
                          <th className="w-48 border-b border-slate-200 p-4 text-center">Tahmin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches.map((match) => (
                          <tr key={match.id} className="border-b border-slate-100">
                            <td className="p-4">
                              <div className="flex items-center gap-3 font-black text-slate-950">
                                <span>{match.homeTeam}</span>
                                <span className="text-[10px] uppercase text-slate-300">vs</span>
                                <span>{match.awayTeam}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={localScores[match.id]?.home ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? null : parseInt(e.target.value, 10);
                                    setLocalScores((prev) => ({
                                      ...prev,
                                      [match.id]: {
                                        ...prev[match.id],
                                        home: Number.isNaN(value) ? null : value
                                      }
                                    }));
                                  }}
                                  className="input-field h-11 w-16 text-center"
                                />
                                <span className="font-black text-slate-300">-</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={localScores[match.id]?.away ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? null : parseInt(e.target.value, 10);
                                    setLocalScores((prev) => ({
                                      ...prev,
                                      [match.id]: {
                                        ...prev[match.id],
                                        away: Number.isNaN(value) ? null : value
                                      }
                                    }));
                                  }}
                                  className="input-field h-11 w-16 text-center"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50 p-4">
                    <button onClick={handleSaveAll} disabled={isSaving} className="btn-primary w-full justify-center">
                      <Save className="h-4 w-4" />
                      {isSaving ? "Kaydediliyor..." : "Tahminleri Kaydet"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-400">
                  Tahmin girmek için yazar seç.
                </div>
              )}
            </div>
          )}

          {entryMode === "bulk" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-sm font-semibold leading-6 text-emerald-900">
                <div className="mb-2 font-black">Toplu tahmin formatı</div>
                <div className="rounded-2xl bg-white p-3 font-mono text-xs text-slate-600 ring-1 ring-emerald-100">
                  Ahmet: 2-1 1-0 0-0<br />
                  Mehmet: 1-1 0-2 3-1
                </div>
              </div>

              <textarea
                rows={8}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"Ahmet: 2-1 1-1 0-2\nMehmet: 1-0 2-2 3-1"}
                className="input-field w-full font-mono text-sm"
              />

              <button type="button" onClick={handleParseBulk} className="btn-secondary">
                <Upload className="h-4 w-4" />
                Tahminleri analiz et
              </button>

              {bulkPreview.length > 0 && (
                <div className="space-y-4 border-t border-slate-200 pt-4">
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                    Önizleme
                  </div>

                  {bulkPreview.map((userPack, index) => (
                    <div key={index} className="card-base p-4">
                      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="text-xl">{userPack.userFlag}</span>
                        <span className="font-black text-slate-950">{userPack.userName}</span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                          Eşleşti
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {userPack.preds.map((prediction, predictionIndex) => (
                          <div key={predictionIndex} className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 p-3 text-xs">
                            <span className="truncate font-bold text-slate-500">
                              {prediction.homeTeam} vs {prediction.awayTeam}
                            </span>
                            <span className="shrink-0 rounded-xl bg-white px-2 py-1 font-black text-slate-950 ring-1 ring-slate-200">
                              {prediction.home} - {prediction.away}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button onClick={handleSaveBulk} disabled={isSaving} className="btn-primary w-full justify-center py-4">
                    {isSaving ? "Kaydediliyor..." : "Toplu tahminleri kaydet"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ResultsTab = ({ activeSeason, weeks, users, selectedWeekInitial }: any) => {
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(selectedWeekInitial);
  const [matches, setMatches] = useState<Match[]>([]);
  const [localScores, setLocalScores] = useState<Record<string, { home: number | null; away: number | null }>>({});
  const [previewData, setPreviewData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!selectedWeek) return;

    const unsub = onSnapshot(
      collection(db, "seasons", activeSeason.id, "weeks", selectedWeek.id, "matches"),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
        items.sort((a, b) => getDateMs(a.matchDate) - getDateMs(b.matchDate));
        setMatches(items);

        const scores: any = {};
        items.forEach((item) => {
          scores[item.id] = {
            home: item.actualHome,
            away: item.actualAway
          };
        });
        setLocalScores(scores);
      }
    );

    return () => unsub();
  }, [selectedWeek, activeSeason]);

  const handleScoreUpdate = async (matchId: string) => {
    const score = localScores[matchId];
    if (score.home === null || score.away === null || !selectedWeek) return;

    try {
      await updateDoc(doc(db, "seasons", activeSeason.id, "weeks", selectedWeek.id, "matches", matchId), {
        actualHome: score.home,
        actualAway: score.away
      });
    } catch (err) {
      alert(err);
    }
  };

  const handleCalculatePreview = async () => {
    if (!selectedWeek) return;

    setIsSaving(true);

    try {
      const predSnap = await getDocs(collection(db, "seasons", activeSeason.id, "predictions"));
      const allPredictions = predSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Prediction))
        .filter((prediction) => prediction.weekId === selectedWeek.id);

      const weekResults = calculateWeekPoints(matches, allPredictions, users);
      setPreviewData(weekResults);
    } catch (err) {
      alert(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndPublish = async () => {
    if (!selectedWeek || !previewData) return;

    setIsSaving(true);

    try {
      const batch = writeBatch(db);

      Object.entries(previewData).forEach(([userId, data]: [string, any]) => {
        const pointsRef = doc(db, "seasons", activeSeason.id, "weekPoints", selectedWeek.id, "userPoints", userId);
        batch.set(pointsRef, data);
      });

      const weekRef = doc(db, "seasons", activeSeason.id, "weeks", selectedWeek.id);
      batch.update(weekRef, { pointsPublished: true });

      await batch.commit();

      const weeksSnap = await getDocs(collection(db, "seasons", activeSeason.id, "weeks"));
      const allWeeks = weeksSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      const publishedWeeks = allWeeks.filter((week) => week.pointsPublished || week.id === selectedWeek.id);

      const userTotals: Record<string, { points: number; exacts: number; results: number }> = {};

      users.forEach((user: any) => {
        userTotals[user.id] = { points: 0, exacts: 0, results: 0 };
      });

      for (const week of publishedWeeks) {
        const userPointsSnap = await getDocs(collection(db, "seasons", activeSeason.id, "weekPoints", week.id, "userPoints"));
        userPointsSnap.docs.forEach((document) => {
          if (userTotals[document.id]) {
            const data = document.data();
            userTotals[document.id].points += data.totalWeekPoints || 0;
            userTotals[document.id].exacts += data.exacts || 0;
            userTotals[document.id].results += data.results || 0;
          }
        });
      }

      const updateBatch = writeBatch(db);

      users.forEach((user: any) => {
        const totals = userTotals[user.id] || { points: 0, exacts: 0, results: 0 };

        const otherSeasonsPoints = Object.entries(user.seasonPoints || {})
          .filter(([seasonId]) => seasonId !== activeSeason.id)
          .reduce((sum, [_, value]) => sum + (value as number), 0);

        const otherSeasonsExacts = Object.entries(user.seasonExacts || {})
          .filter(([seasonId]) => seasonId !== activeSeason.id)
          .reduce((sum, [_, value]) => sum + (value as number), 0);

        const otherSeasonsResults = Object.entries(user.seasonResults || {})
          .filter(([seasonId]) => seasonId !== activeSeason.id)
          .reduce((sum, [_, value]) => sum + (value as number), 0);

        const userRef = doc(db, "users", user.id);

        updateBatch.update(userRef, {
          [`seasonPoints.${activeSeason.id}`]: totals.points,
          [`seasonExacts.${activeSeason.id}`]: totals.exacts,
          [`seasonResults.${activeSeason.id}`]: totals.results,
          totalPoints: otherSeasonsPoints + totals.points,
          totalExacts: otherSeasonsExacts + totals.exacts,
          totalResults: otherSeasonsResults + totals.results
        });
      });

      await updateBatch.commit();

      alert("Puanlar kaydedildi ve yayınlandı.");
      setPreviewData(null);
    } catch (err) {
      alert("Puanlar kaydedilirken hata oluştu: " + err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PanelTitle title="Sonuçlar" description="Maç sonuçlarını gir, haftalık puanları hesapla ve yayınla." icon={<Check className="h-5 w-5 text-emerald-700" />} />

      <div className="card-base mb-6 p-5">
        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
          Hafta seç
        </label>
        <select
          value={selectedWeek?.id || ""}
          onChange={(e) => setSelectedWeek(weeks.find((week: Week) => week.id === e.target.value) || null)}
          className="input-field w-full"
        >
          <option value="">Hafta seçiniz...</option>
          {weeks.map((week: Week) => (
            <option key={week.id} value={week.id}>{week.label}</option>
          ))}
        </select>
      </div>

      {selectedWeek && (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="card-base flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
              <div className="flex-1 text-right font-black text-slate-950">{match.homeTeam}</div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={localScores[match.id]?.home ?? ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : parseInt(e.target.value, 10);
                    setLocalScores((prev) => ({
                      ...prev,
                      [match.id]: {
                        ...prev[match.id],
                        home: Number.isNaN(value) ? null : value
                      }
                    }));
                  }}
                  className="input-field h-11 w-16 text-center"
                />
                <span className="font-black text-slate-300">-</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={localScores[match.id]?.away ?? ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : parseInt(e.target.value, 10);
                    setLocalScores((prev) => ({
                      ...prev,
                      [match.id]: {
                        ...prev[match.id],
                        away: Number.isNaN(value) ? null : value
                      }
                    }));
                  }}
                  className="input-field h-11 w-16 text-center"
                />

                <button onClick={() => handleScoreUpdate(match.id)} className="btn-secondary px-3 py-2">
                  <Save className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 text-left font-black text-slate-950">{match.awayTeam}</div>
            </div>
          ))}

          <button
            onClick={handleCalculatePreview}
            disabled={isSaving || matches.some((match) => match.actualHome === null)}
            className="btn-primary w-full justify-center py-4"
          >
            <Eye className="h-5 w-5" />
            Puanları Hesapla ve Önizle
          </button>

          {previewData && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base space-y-4 p-6">
              <h4 className="text-center text-sm font-black uppercase tracking-[0.22em] text-slate-950">
                Haftalık puan önizleme
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 text-slate-400 uppercase">
                    <tr>
                      <th className="py-2">Kullanıcı</th>
                      <th className="py-2 text-center">Puan</th>
                      <th className="py-2 text-center">Bonus</th>
                      <th className="py-2 text-center">Toplam</th>
                      <th className="py-2 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(previewData).map(([uid, data]: [string, any]) => {
                      const user = users.find((item: any) => item.id === uid);

                      return (
                        <tr key={uid} className="border-b border-slate-100">
                          <td className="py-2">
                            <span>{sanitizeFlagEmoji(user?.flagEmoji)}</span> <span>{user?.name}</span>
                          </td>
                          <td className="py-2 text-center">{data.points}</td>
                          <td className="py-2 text-center">{data.bonus}</td>
                          <td className="py-2 text-center font-black text-emerald-700">+{data.totalWeekPoints}</td>
                          <td className="py-2 text-right">
                            <button
                              onClick={async () => {
                                if (confirm("Bu kullanıcının bu haftaki tüm tahminlerini silmek istiyor musunuz?")) {
                                  const q = query(
                                    collection(db, "seasons", activeSeason.id, "predictions"),
                                    where("userId", "==", uid),
                                    where("weekId", "==", selectedWeek.id)
                                  );
                                  const snap = await getDocs(q);
                                  const batch = writeBatch(db);
                                  snap.docs.forEach((document) => batch.delete(document.ref));
                                  await batch.commit();
                                  alert("Tahminler sıfırlandı.");
                                }
                              }}
                              className="text-[10px] font-black text-red-600 hover:underline"
                            >
                              Sıfırla
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button onClick={handleSaveAndPublish} disabled={isSaving} className="btn-primary w-full justify-center py-4">
                <Check className="h-5 w-5" />
                Puanları Yayınla ve Kaydet
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

const StandingsTab = ({ seasons, users }: { seasons: Season[]; users: User[] }) => {
  const activeSeason = seasons.find((s) => s.status === "active");
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempPoints, setTempPoints] = useState<number | string>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeSeason && !selectedSeasonId) {
      setSelectedSeasonId(activeSeason.id);
    }
  }, [activeSeason, selectedSeasonId]);

  const handleSavePoints = async (userId: string) => {
    if (!selectedSeasonId) return;

    setLoading(true);

    try {
      const points = parseInt(tempPoints as string, 10) || 0;

      await updateDoc(doc(db, "users", userId), {
        [`seasonPoints.${selectedSeasonId}`]: points
      });

      setEditingUserId(null);
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const ptsA = (a.seasonPoints && a.seasonPoints[selectedSeasonId]) || 0;
    const ptsB = (b.seasonPoints && b.seasonPoints[selectedSeasonId]) || 0;

    if (ptsB !== ptsA) return ptsB - ptsA;

    const exactA = (a.seasonExacts && a.seasonExacts[selectedSeasonId]) || 0;
    const exactB = (b.seasonExacts && b.seasonExacts[selectedSeasonId]) || 0;

    if (exactB !== exactA) return exactB - exactA;

    const resultsA = (a.seasonResults && a.seasonResults[selectedSeasonId]) || 0;
    const resultsB = (b.seasonResults && b.seasonResults[selectedSeasonId]) || 0;

    if (resultsB !== resultsA) return resultsB - resultsA;

    return (a.name || "").localeCompare(b.name || "");
  });

  return (
    <div>
      <PanelTitle title="Puan Durumu" description="Sezon puanlarını manuel olarak düzenle." icon={<Medal className="h-5 w-5 text-emerald-700" />} />

      <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-xs leading-5 text-blue-800">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-blue-600 mt-0.5" />
          <div>
            <p className="font-bold mb-1">💡 Canlı Puan Durumu vs Kayıtlı Puanlar Hakkında</p>
            <p className="opacity-90">
              Bu panel, veritabanına <strong>kesinleşip kaydedilen</strong> statik sezon puanlarını gösterir ve bunları manuel düzeltmenizi sağlar.
            </p>
            <p className="mt-1.5 opacity-90">
              Ana sayfadaki canlı sıralama ise <strong>yayınlanmamış aktif haftanın maç sonuçlarını ve tahminleri canlı olarak anında hesaplar</strong> (örneğin Yalçın bu yüzden canlıda lider görünebilir).
            </p>
            <p className="mt-1.5 opacity-90">
              Canlı puanları veritabanına işlemek için lütfen sol menüdeki <strong>"Sonuçlar"</strong> sekmesine gidin, ilgili haftayı seçip <strong>"Puanları Yayınla ve Kaydet"</strong> butonuna basın.
            </p>
          </div>
        </div>
      </div>

      <div className="card-base mb-6 p-5">
        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
          Sezon seç
        </label>
        <select
          value={selectedSeasonId}
          onChange={(e) => setSelectedSeasonId(e.target.value)}
          className="input-field w-full"
        >
          <option value="">Sezon seçiniz...</option>
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name} {season.status === "active" ? "(Aktif)" : ""}
            </option>
          ))}
        </select>
      </div>

      {selectedSeasonId && (
        <div className="space-y-3">
          {sortedUsers.map((user, index) => {
            const points = (user.seasonPoints && user.seasonPoints[selectedSeasonId]) || 0;

            return (
              <div key={user.id} className="card-base flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
                    {index + 1}
                  </div>
                  <span className="text-2xl">{sanitizeFlagEmoji(user.flagEmoji)}</span>
                  <div>
                    <div className="font-black text-slate-950">{user.name}</div>
                    <div className="text-xs font-semibold text-slate-400">Sezon puanı</div>
                  </div>
                </div>

                {editingUserId === user.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={tempPoints}
                      onChange={(e) => setTempPoints(e.target.value)}
                      className="input-field w-24 text-center"
                    />
                    <button onClick={() => handleSavePoints(user.id)} disabled={loading} className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-black text-white">
                      Kaydet
                    </button>
                    <button onClick={() => setEditingUserId(null)} disabled={loading} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-500">
                      İptal
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <div className="stat-number text-3xl font-black text-slate-950">{points}</div>
                    </div>
                    <button
                      onClick={() => {
                        setTempPoints(points);
                        setEditingUserId(user.id);
                      }}
                      className="rounded-xl border border-slate-200 p-3 text-slate-400 hover:bg-slate-50 hover:text-slate-950"
                    >
                      <Trophy className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;