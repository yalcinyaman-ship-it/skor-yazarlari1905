import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CloudDownload,
  KeyRound,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck
} from "lucide-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  writeBatch
} from "firebase/firestore";
import { db } from "./src/firebase";
import { Season, Week } from "./src/types";

type ApiFixture = {
  fixture: {
    id: number;
    date: string;
    status?: { short?: string; long?: string };
  };
  league: { id: number; name: string; round?: string };
  teams: {
    home: { id: number; name: string; logo?: string };
    away: { id: number; name: string; logo?: string };
  };
};

const API_BASE = "https://v3.football.api-sports.io";
const SUPER_LIG_ID = 203;

const defaultSeason = () => {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
};

const formatFixtureDate = (value: string) =>
  new Date(value).toLocaleDateString("tr-TR", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
    day: "numeric",
    month: "short"
  });

const FixtureImporter: React.FC<{
  activeSeason: Season;
  selectedWeek: Week;
}> = ({ activeSeason, selectedWeek }) => {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [season, setSeason] = useState(defaultSeason());
  const [fixtures, setFixtures] = useState<ApiFixture[]>([]);
  const [round, setRound] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadKey = async () => {
      const snapshot = await getDoc(doc(db, "integrations", "apiFootball"));
      const key = snapshot.data()?.apiKey || "";
      setSavedKey(key);
      setApiKey(key);
    };

    loadKey().catch(() => setMessage("API anahtarı henüz kaydedilmemiş."));
  }, []);

  const rounds = useMemo(
    () => Array.from(new Set(fixtures.map((item) => item.league.round).filter(Boolean))) as string[],
    [fixtures]
  );

  const visibleFixtures = useMemo(
    () => fixtures.filter((item) => !round || item.league.round === round),
    [fixtures, round]
  );

  const saveKey = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "integrations", "apiFootball"), {
        apiKey: apiKey.trim(),
        updatedAt: serverTimestamp()
      });
      setSavedKey(apiKey.trim());
      setMessage("API anahtarı güvenli admin alanına kaydedildi.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFixtures = async () => {
    const key = savedKey || apiKey.trim();
    if (!key) {
      setMessage("Önce API anahtarını kaydet.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        `${API_BASE}/fixtures?league=${SUPER_LIG_ID}&season=${season}&timezone=Europe%2FIstanbul`,
        { headers: { "x-apisports-key": key } }
      );
      if (!response.ok) throw new Error(`API yanıtı: ${response.status}`);
      const data = await response.json();
      if (data.errors && Object.keys(data.errors).length > 0) {
        throw new Error(Object.values(data.errors).join(", "));
      }
      const items = (data.response || []) as ApiFixture[];
      setFixtures(items);

      const upcoming = items.find((item) => new Date(item.fixture.date).getTime() > Date.now());
      const preferredRound = upcoming?.league.round || items[0]?.league.round || "";
      setRound(preferredRound || "");
      setSelectedIds([]);
      setMessage(`${items.length} Süper Lig maçı getirildi.`);
    } catch (error: any) {
      setMessage(error?.message || "Maçlar getirilemedi.");
    } finally {
      setLoading(false);
    }
  };

  const addSelectedFixtures = async () => {
    const selected = fixtures.filter((item) => selectedIds.includes(item.fixture.id));
    if (selected.length === 0) {
      setMessage("Önce en az bir maç seç.");
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);
      selected.forEach((item) => {
        const matchRef = doc(
          db,
          "seasons",
          activeSeason.id,
          "weeks",
          selectedWeek.id,
          "matches",
          `api_${item.fixture.id}`
        );
        batch.set(
          matchRef,
          {
            homeTeam: item.teams.home.name,
            awayTeam: item.teams.away.name,
            homeTeamLogo: item.teams.home.logo || "",
            awayTeamLogo: item.teams.away.logo || "",
            matchDate: Timestamp.fromDate(new Date(item.fixture.date)),
            actualHome: null,
            actualAway: null,
            externalFixtureId: item.fixture.id,
            externalStatus: item.fixture.status?.short || "NS",
            source: "api-football",
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      });
      await batch.commit();
      setMessage(`${selected.length} maç “${selectedWeek.label}” haftasına eklendi.`);
      setSelectedIds([]);
    } catch (error: any) {
      setMessage(error?.message || "Maçlar eklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const refreshImportedTimes = async () => {
    const key = savedKey || apiKey.trim();
    if (!key) return;
    setLoading(true);
    try {
      const matchSnapshot = await getDocs(
        collection(db, "seasons", activeSeason.id, "weeks", selectedWeek.id, "matches")
      );
      const imported = matchSnapshot.docs
        .map((item) => ({ ref: item.ref, ...item.data() }))
        .filter((item: any) => item.externalFixtureId);

      const batch = writeBatch(db);
      for (const item of imported as any[]) {
        const response = await fetch(`${API_BASE}/fixtures?id=${item.externalFixtureId}`, {
          headers: { "x-apisports-key": key }
        });
        const data = await response.json();
        const current = data.response?.[0] as ApiFixture | undefined;
        if (!current) continue;
        batch.update(item.ref, {
          matchDate: Timestamp.fromDate(new Date(current.fixture.date)),
          externalStatus: current.fixture.status?.short || item.externalStatus || "NS",
          updatedAt: serverTimestamp()
        });
      }
      await batch.commit();
      setMessage(`${imported.length} maçın tarih ve saati yenilendi.`);
    } catch (error: any) {
      setMessage(error?.message || "Saatler yenilenemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card-base mb-6 overflow-hidden border-[#EAE6DF]">
      <div className="border-b border-[#EAE6DF] bg-[#FAF8F6] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D96B43]">
              <CloudDownload className="h-4 w-4" /> API-Football Maç Havuzu
            </div>
            <p className="mt-1 text-sm font-semibold text-[#6E6B65]">
              Süper Lig fikstürünü getir, maçları seç ve haftaya ekle.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#D0EADB] bg-[#EDF7F2] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#2D8A66]">
            <ShieldCheck className="h-4 w-4" /> Admin özel
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {!savedKey && (
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E6B65]" />
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                className="input-field w-full pl-11"
                placeholder="API-Football anahtarı"
              />
            </div>
            <button type="button" onClick={saveKey} disabled={loading} className="btn-secondary">
              <Save className="h-4 w-4" /> Anahtarı Kaydet
            </button>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
          <input
            type="number"
            value={season}
            onChange={(event) => setSeason(Number(event.target.value))}
            className="input-field w-full"
            min="2020"
            max="2100"
            aria-label="Sezon başlangıç yılı"
          />
          <select value={round} onChange={(event) => setRound(event.target.value)} className="input-field w-full">
            <option value="">Tüm haftalar</option>
            {rounds.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="button" onClick={fetchFixtures} disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudDownload className="h-4 w-4" />}
            Maçları Getir
          </button>
        </div>

        {visibleFixtures.length > 0 && (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              {visibleFixtures.map((item) => {
                const selected = selectedIds.includes(item.fixture.id);
                return (
                  <button
                    type="button"
                    key={item.fixture.id}
                    onClick={() => setSelectedIds((current) =>
                      selected ? current.filter((id) => id !== item.fixture.id) : [...current, item.fixture.id]
                    )}
                    className={`rounded-2xl border p-4 text-left transition ${selected ? "border-[#D96B43] bg-[#FDF4F0] ring-2 ring-[#D96B43]/15" : "border-[#EAE6DF] bg-white hover:border-[#D96B43]/40"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 font-bold text-[#1F2024]">
                        <div className="truncate">{item.teams.home.name}</div>
                        <div className="truncate">{item.teams.away.name}</div>
                      </div>
                      <CheckCircle2 className={`h-5 w-5 shrink-0 ${selected ? "text-[#D96B43]" : "text-[#EAE6DF]"}`} />
                    </div>
                    <div className="mt-3 text-xs font-semibold text-[#6E6B65]">{formatFixtureDate(item.fixture.date)}</div>
                  </button>
                );
              })}
            </div>

            <button type="button" onClick={addSelectedFixtures} disabled={loading || selectedIds.length === 0} className="btn-primary w-full">
              <Save className="h-4 w-4" /> Seçilen {selectedIds.length} Maçı Haftaya Ekle
            </button>
          </>
        )}

        <button type="button" onClick={refreshImportedTimes} disabled={loading} className="btn-secondary w-full">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Eklenen Maçların Saatlerini Yenile
        </button>

        {message && <div className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F6] p-3 text-sm font-semibold text-[#1F2024]">{message}</div>}
      </div>
    </section>
  );
};

export default FixtureImporter;
