import React, { useEffect, useMemo, useRef, useState } from "react";
import { Match, Prediction, Season, User, Week } from "../types";
import { calculateWeekPoints } from "../utils/calculatePoints";
import { flagUrlForEmoji, flagUrlForTeam } from "../flags";
import Statistics from "./Statistics";

/* ---------- Palet ---------- */
const C = {
  bg: "#0B0907", card: "#15100C", ink: "#F6EFE7", soft: "#D9CBBD", mute: "#A89A8C", dim: "#7D7064",
  line: "rgba(255,190,140,.10)", line2: "rgba(255,190,140,.14)",
  fire: "#FF6A1F", fire2: "#FF8A3D", gold: "#F2B632", green: "#3FD483", red: "#E5484D"
};
const DISPLAY = "'Anton', sans-serif";
const COND = "'Barlow Condensed', sans-serif";
const RANK = [C.gold, "#D9D4CC", "#D08A4E"];
const rankColor = (i: number) => RANK[i] || C.dim;
const BLOCKED = ["🔴", "🔵", "🟡", "🟢", "🟣", "🟠", "⚫", "⚪"];

const label = (t: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: COND, fontWeight: 800, fontSize: 13, letterSpacing: ".26em", textTransform: "uppercase", ...t
});
const card: React.CSSProperties = { borderRadius: 22, border: `1px solid ${C.line}`, background: C.card };

const played = (m: Match) => m.actualHome !== null && m.actualHome !== undefined && m.actualAway !== null && m.actualAway !== undefined;
const res = (h: number, a: number) => (h > a ? "home" : h < a ? "away" : "draw");
const ms = (d: any) => { if (!d) return 0; if (typeof d.toDate === "function") return d.toDate().getTime(); if (d.seconds) return d.seconds * 1000; if (d instanceof Date) return d.getTime(); if (typeof d === "string") return new Date(d).getTime(); return 0; };
const weekLabel = (l?: string | null) => (l || "").replace(/hatfa/gi, "Hafta");
const shortName = (n?: string) => { if (!n) return ""; const p = n.trim().split(/\s+/); return p.length === 1 ? p[0] : `${p[0]} ${p[p.length - 1][0].toLocaleUpperCase("tr-TR")}.`; };

const Avatar: React.FC<{ user: any; size?: number; ring?: string; radius?: number }> = ({ user, size = 36, ring = C.line2, radius }) => {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [user?.flagEmoji, user?.clubLogo]);
  const logo = !err ? (user?.clubLogo || user?.logo || flagUrlForEmoji(user?.flagEmoji, 80)) : null;
  const emoji = !user?.flagEmoji || BLOCKED.includes(user.flagEmoji) ? "⚽" : user.flagEmoji;
  return (
    <div style={{ width: size, height: size, flexShrink: 0, borderRadius: radius ?? size * 0.28, background: C.bg, border: `1.5px solid ${ring}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {logo
        ? <img src={logo} alt="" referrerPolicy="no-referrer" loading="lazy" onError={() => setErr(true)} style={{ width: size * 0.62, height: size * 0.62, objectFit: "contain" }} />
        : <span style={{ fontSize: size * 0.48, lineHeight: 1 }}>{emoji}</span>}
    </div>
  );
};

const TeamImg: React.FC<{ name: string; logo?: string }> = ({ name, logo }) => {
  const [err, setErr] = useState(false);
  const src = logo || flagUrlForTeam(name, 80);
  if (!src || err) return null;
  return <img src={src} alt="" referrerPolicy="no-referrer" onError={() => setErr(true)} style={{ width: 34, height: 34, objectFit: "contain", flexShrink: 0 }} />;
};

type Tab = "ozet" | "mac" | "puan" | "istatistik" | "hafiza";

export interface FlameHomeProps {
  activeSeason: Season | null;
  activeWeek: Week | null;
  weeks: Week[];
  users: User[];
  sortedUserStats: any[];
  allMatches: Record<string, Match[]>;
  predictions: Prediction[];
  existingPredictors: string[];
  allUsersHavePredicted: boolean;
  participationPercent: number;
  leaderGap: number;
  predictionLocked: boolean;
  finishedSeasons: Season[];
  isAdmin: boolean;
  error: string | null;
  selectedWeekId: string;
  setSelectedWeekId: (id: string) => void;
  onPredict: () => void;
  onAdmin: () => void;
  onLogout: () => void;
  onUserClick: (u: any) => void;
  onArchiveClick: (s: Season) => void;
}

const FlameHome: React.FC<FlameHomeProps> = (p) => {
  const { activeSeason, activeWeek, weeks, users, sortedUserStats, allMatches, predictions, existingPredictors, allUsersHavePredicted } = p;
  const [tab, setTab] = useState<Tab>(() => (localStorage.getItem("sy_tab") as Tab) || "ozet");
  const go = (t: Tab) => { localStorage.setItem("sy_tab", t); setTab(t); };

  const calc = useMemo(() => {
    const r: Record<string, any> = {};
    weeks.forEach((w) => { r[w.id] = calculateWeekPoints(allMatches[w.id] || [], predictions.filter((x) => x.weekId === w.id), users); });
    return r;
  }, [weeks, allMatches, predictions, users]);

  const L = sortedUserStats[0], S2 = sortedUserStats[1];
  const maxPts = Math.max(1, ...sortedUserStats.map((u) => u.totalPoints || 0));
  const awMatches = activeWeek ? allMatches[activeWeek.id] || [] : [];
  const awPlayed = awMatches.filter(played).length;
  const predSet = new Set(existingPredictors);

  const weekStatus = !activeWeek ? "Beklemede" : activeWeek.isPublished ? "Yayında" : allUsersHavePredicted ? "Kilitlendi" : "Tahmin açık";
  const weekStatusColor = !activeWeek ? C.dim : activeWeek.isPublished ? C.green : allUsersHavePredicted ? C.gold : C.fire2;

  const tabs: [Tab, string][] = [["ozet", "Genel Özet"], ["mac", "Maçlar & Tahminler"], ["puan", "Puan Durumu"], ["istatistik", "İstatistikler"], ["hafiza", "Lig Hafızası"]];

  /* ---------- Hafta şeridi ---------- */
  const selId = p.selectedWeekId || activeWeek?.id || weeks[weeks.length - 1]?.id || "";
  const selIdx = weeks.findIndex((w) => w.id === selId);
  const sw = weeks[selIdx] || null;
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = strip.current; if (!el || selIdx < 0) return;
    const b = el.children[selIdx] as HTMLElement | undefined; if (!b) return;
    el.scrollTo({ left: b.offsetLeft - el.offsetLeft - el.clientWidth / 2 + 22, behavior: "smooth" });
  }, [selIdx, tab, weeks.length]);
  const step = (d: number) => { const w = weeks[selIdx + d]; if (w) p.setSelectedWeekId(w.id); };

  const swMatches = sw ? allMatches[sw.id] || [] : [];
  const swPreds = sw ? predictions.filter((x) => x.weekId === sw.id) : [];
  const swCalc = sw ? calc[sw.id] || {} : {};
  const byUser: Record<string, User> = {}; users.forEach((u) => (byUser[u.id] = u));
  const formWeeks = weeks.filter((w) => predictions.some((x) => x.weekId === w.id) && (allMatches[w.id] || []).some(played)).slice(-6);

  const pill = (text: string, color: string) => (
    <span style={{ ...label({ fontSize: 13, letterSpacing: ".16em" }), whiteSpace: "nowrap", padding: "6px 12px", borderRadius: 999, color, border: `1px solid ${color}` }}>{text}</span>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, backgroundImage: "radial-gradient(900px 420px at 50% -120px, rgba(255,90,20,.20), transparent 70%)", color: C.ink, fontFamily: "'Barlow', system-ui, sans-serif", paddingBottom: 80 }}>
      <style>{`@keyframes syPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,106,31,.6)}50%{box-shadow:0 0 0 7px rgba(255,106,31,0)}}`}</style>

      {/* HEADER */}
      <header style={{ position: "relative", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 3, background: `linear-gradient(90deg,#E23B1B,${C.fire} 45%,${C.gold})` }} />
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "22px 20px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={label({ fontWeight: 700, fontSize: 12, letterSpacing: ".3em", color: C.gold })}>{activeSeason?.name || "Süper Lig masası"}</div>
            <h1 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(34px,5vw,56px)", lineHeight: 0.95, textTransform: "uppercase" }}>Skor <span style={{ color: C.fire }}>Yazarları</span></h1>
            <div style={{ fontSize: 13, color: C.mute, fontWeight: 500 }}>Farklı renklerin dostça mücadelesini birlikte yaşayalım</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 12px", border: `1px solid ${C.line2}`, borderRadius: 999, ...label({ fontWeight: 700, fontSize: 12, letterSpacing: ".18em", color: C.soft }), whiteSpace: "nowrap" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.error ? C.dim : C.fire, animation: p.error ? "none" : "syPulse 1.8s ease-in-out infinite" }} />
              {p.error ? "Bağlantı yok" : "Canlı veri"}
            </span>
            <button onClick={p.onAdmin} style={{ height: 40, padding: "0 14px", borderRadius: 999, cursor: "pointer", background: p.isAdmin ? "rgba(63,212,131,.12)" : "transparent", border: `1px solid ${p.isAdmin ? C.green : C.line2}`, color: p.isAdmin ? C.green : C.soft, ...label({ fontWeight: 700, fontSize: 13, letterSpacing: ".14em" }), whiteSpace: "nowrap" }}>
              {p.isAdmin ? "Yönetici paneli" : "Yönetici"}
            </button>
            {p.isAdmin && (
              <button onClick={p.onLogout} title="Yönetici çıkışı" style={{ height: 40, padding: "0 12px", borderRadius: 999, cursor: "pointer", background: "transparent", border: `1px solid rgba(229,72,77,.4)`, color: "#FFB4B6", ...label({ fontWeight: 700, fontSize: 13, letterSpacing: ".14em" }) }}>Çıkış</button>
            )}
            {!p.predictionLocked && (
              <button onClick={p.onPredict} style={{ height: 40, padding: "0 18px", borderRadius: 999, border: 0, cursor: "pointer", background: C.fire, color: "#140A04", ...label({ fontSize: 15, letterSpacing: ".12em" }), whiteSpace: "nowrap" }}>Tahmin Yap →</button>
            )}
          </div>
        </div>
        <nav style={{ maxWidth: 1320, margin: "0 auto", padding: "0 20px", display: "flex", gap: 4, overflowX: "auto" }}>
          {tabs.map(([id, t]) => (
            <button key={id} onClick={() => go(id)} style={{ flexShrink: 0, whiteSpace: "nowrap", border: 0, background: "transparent", cursor: "pointer", padding: "12px 16px 14px", ...label({ fontWeight: 700, fontSize: 15, letterSpacing: ".14em" }), color: tab === id ? C.ink : C.dim, borderBottom: `3px solid ${tab === id ? C.fire : "transparent"}` }}>{t}</button>
          ))}
        </nav>
      </header>

      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 20px 0", display: "flex", flexDirection: "column", gap: 28 }}>
        {p.error && (
          <div style={{ border: "1px solid rgba(229,72,77,.35)", background: "rgba(229,72,77,.08)", borderRadius: 14, padding: "14px 16px", color: "#FFB4B6", fontSize: 14 }}>
            <b style={label({ fontSize: 14, letterSpacing: ".14em" })}>Veritabanı uyarısı</b> — {p.error}
          </div>
        )}

        {!activeSeason && tab !== "hafiza" && (
          <div style={{ ...card, padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 40, textTransform: "uppercase" }}>Aktif sezon yok</div>
            <div style={{ color: C.mute, marginTop: 8 }}>Yeni sezon başladığında masa burada yeniden kurulacak.</div>
          </div>
        )}

        {/* ÖZET */}
        {activeSeason && tab === "ozet" && (
          <>
            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,460px),1fr))", gap: 18 }}>
              <div onClick={() => L && p.onUserClick(L)} style={{ cursor: L ? "pointer" : "default", position: "relative", overflow: "hidden", borderRadius: 22, border: "1px solid rgba(255,140,60,.28)", background: "#140E0A", backgroundImage: "radial-gradient(520px 320px at 85% 110%, rgba(255,90,20,.35), transparent 70%),radial-gradient(360px 220px at 100% 0%, rgba(242,182,50,.14), transparent 70%)", padding: 28, display: "flex", flexDirection: "column", gap: 18, minHeight: 360 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <span style={label({ color: C.gold, letterSpacing: ".28em" })}>Zirvenin sahibi</span>
                  <span style={{ ...label({ fontWeight: 700, letterSpacing: ".14em", color: C.soft }), whiteSpace: "nowrap", padding: "5px 10px", borderRadius: 999, border: "1px solid rgba(242,182,50,.35)", background: "rgba(242,182,50,.08)" }}>+{p.leaderGap} fark</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
                  <Avatar user={L} size={72} ring={C.gold} radius={20} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: DISPLAY, fontSize: "clamp(34px,4.4vw,54px)", lineHeight: 1, textTransform: "uppercase", overflowWrap: "anywhere" }}>{L?.name || "—"}</div>
                    <div style={{ marginTop: 6, color: C.soft, fontSize: 14, fontWeight: 500 }}>{L?.exacts || 0} tam skor · {L?.results || 0} doğru sonuç</div>
                  </div>
                </div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                    <span style={{ fontFamily: DISPLAY, fontSize: "clamp(96px,13vw,168px)", lineHeight: 0.82, color: C.fire, textShadow: "0 0 60px rgba(255,90,20,.45)" }}>{L?.totalPoints || 0}</span>
                    <span style={{ ...label({ fontSize: 20, letterSpacing: ".2em", color: C.ink }), paddingBottom: 10 }}>Puan</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 10, textAlign: "right" }}>
                    <span style={label({ fontWeight: 700, fontSize: 12, letterSpacing: ".22em", color: C.mute })}>Takipçi</span>
                    <span style={{ fontFamily: COND, fontWeight: 800, fontSize: 22, whiteSpace: "nowrap" }}>{S2 ? `${shortName(S2.name)} · ${S2.totalPoints || 0}` : "—"}</span>
                  </div>
                </div>
              </div>

              <div style={{ ...card, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={label({ color: C.fire2, letterSpacing: ".28em" })}>Haftanın nabzı</div>
                    <div style={{ fontFamily: DISPLAY, fontSize: 40, lineHeight: 1.05, textTransform: "uppercase", marginTop: 4 }}>{activeWeek ? weekLabel(activeWeek.label) : "Beklemede"}</div>
                  </div>
                  {pill(weekStatus, weekStatusColor)}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <span style={{ fontFamily: DISPLAY, fontSize: 64, lineHeight: 1 }}>%{p.participationPercent}</span>
                      <span style={label({ fontWeight: 700, fontSize: 14, letterSpacing: ".2em", color: C.mute })}>Katılım</span>
                    </div>
                    <span style={{ fontSize: 14, color: C.soft, fontWeight: 600 }}>{existingPredictors.length}/{users.length} yazar tamamladı</span>
                  </div>
                  <div style={{ marginTop: 12, height: 10, borderRadius: 999, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p.participationPercent}%`, borderRadius: 999, background: `linear-gradient(90deg,#E23B1B,${C.fire},${C.gold})`, boxShadow: "0 0 16px rgba(255,106,31,.5)", transition: "width .5s" }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
                  {[["Maç", awMatches.length, C.ink], ["Sonuç", awPlayed, C.green], ["Bekleyen", Math.max(awMatches.length - awPlayed, 0), C.gold]].map(([t, v, c], i) => (
                    <div key={t as string} style={{ padding: "14px 0", textAlign: "center", borderLeft: i === 1 ? `1px solid ${C.line}` : undefined, borderRight: i === 1 ? `1px solid ${C.line}` : undefined }}>
                      <div style={label({ fontWeight: 700, fontSize: 12, letterSpacing: ".22em", color: C.mute })}>{t}</div>
                      <div style={{ fontFamily: DISPLAY, fontSize: 34, marginTop: 2, color: c as string }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", ...label({ fontWeight: 700, letterSpacing: ".2em", color: C.mute }), marginBottom: 12 }}>
                    <span style={{ color: C.ink }}>Yazarlar</span>
                    <span>{allUsersHavePredicted ? "Tümü hazır" : `${users.length - existingPredictors.length} bekliyor`}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(64px,1fr))", gap: 12 }}>
                    {users.map((u) => {
                      const ok = predSet.has(u.id);
                      return (
                        <div key={u.id} title={u.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: ok ? 1 : 0.7 }}>
                          <div style={{ position: "relative" }}>
                            <Avatar user={u} size={46} ring={ok ? C.green : C.gold} radius={14} />
                            <span style={{ position: "absolute", right: -4, bottom: -4, width: 15, height: 15, borderRadius: "50%", background: ok ? C.green : C.gold, border: `2px solid ${C.card}` }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.soft, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shortName(u.name)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section style={{ ...card, padding: "26px 26px 18px" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 400, fontSize: 34, textTransform: "uppercase" }}>Zirve yarışı</h2>
                <button onClick={() => go("puan")} style={{ border: 0, background: "transparent", cursor: "pointer", color: C.fire2, ...label({ fontSize: 14, letterSpacing: ".16em" }), whiteSpace: "nowrap" }}>Tüm puan durumu →</button>
              </div>
              {sortedUserStats.map((u, i) => (
                <div key={u.id} onClick={() => p.onUserClick(u)} style={{ cursor: "pointer", display: "grid", gridTemplateColumns: "36px 34px minmax(0,1fr) 56px", alignItems: "center", gap: 12, padding: "9px 0", borderTop: `1px solid rgba(255,190,140,.07)` }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 22, color: rankColor(i), textAlign: "center" }}>{i + 1}</span>
                  <Avatar user={u} size={34} radius={10} />
                  <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</span>
                    <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,.05)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${((u.totalPoints || 0) / maxPts) * 100}%`, borderRadius: 999, background: i === 0 ? `linear-gradient(90deg,#E23B1B,${C.fire},${C.gold})` : i < 3 ? C.fire : "rgba(255,138,61,.45)" }} />
                    </div>
                  </div>
                  <span style={{ fontFamily: DISPLAY, fontSize: 28, textAlign: "right" }}>{u.totalPoints || 0}</span>
                </div>
              ))}
            </section>
          </>
        )}

        {/* MAÇLAR & TAHMİNLER */}
        {activeSeason && tab === "mac" && (
          <section style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => step(-1)} title="Önceki hafta" style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, border: `1px solid ${C.line2}`, background: C.card, color: C.ink, cursor: "pointer", fontSize: 18 }}>←</button>
              <div ref={strip} style={{ flex: 1, minWidth: 0, display: "flex", gap: 5, overflowX: "auto", scrollbarWidth: "none", padding: "2px 0" }}>
                {weeks.map((w) => {
                  const on = w.id === selId;
                  const wm = allMatches[w.id] || [];
                  const done = wm.length > 0 && wm.every(played);
                  return (
                    <button key={w.id} onClick={() => p.setSelectedWeekId(w.id)} title={`${weekLabel(w.label)} · ${done ? "Bitti" : w.isActive ? "Aktif" : "Bekliyor"}`}
                      style={{ position: "relative", flexShrink: 0, cursor: "pointer", width: 44, height: 44, borderRadius: 12, border: `1px solid ${on ? C.fire : w.isActive ? "rgba(255,106,31,.55)" : C.line2}`, background: on ? C.fire : C.card, color: on ? "#140A04" : C.soft, fontFamily: DISPLAY, fontSize: 18, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {w.weekNumber}
                      <span style={{ position: "absolute", bottom: 5, left: "50%", marginLeft: -3, width: 6, height: 6, borderRadius: "50%", background: on ? "#140A04" : done ? C.green : w.isActive ? C.fire : C.dim }} />
                    </button>
                  );
                })}
              </div>
              <button onClick={() => step(1)} title="Sonraki hafta" style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, border: `1px solid ${C.line2}`, background: C.card, color: C.ink, cursor: "pointer", fontSize: 18 }}>→</button>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={label({ color: C.fire2, letterSpacing: ".28em" })}>Maç takvimi</div>
                <h2 style={{ margin: "4px 0 0", fontFamily: DISPLAY, fontWeight: 400, fontSize: 44, lineHeight: 1, textTransform: "uppercase" }}>{sw ? weekLabel(sw.label) : "Hafta yok"}</h2>
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", ...label({ fontWeight: 700, letterSpacing: ".14em", color: C.mute }) }}>
                {[[C.green, "Tam skor +2"], [C.fire2, "Sonuç +1"], [C.gold, "Tek bilen +1"]].map(([c, t]) => (
                  <span key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{t}</span>
                ))}
              </div>
            </div>

            {sw && !sw.isPublished && !p.isAdmin && swMatches.length > 0 && (
              <div style={{ border: "1px dashed rgba(255,190,140,.2)", borderRadius: 14, padding: "12px 16px", color: C.soft, fontSize: 14 }}>Bu haftanın tahminleri henüz yayınlanmadı — hafta yayınlandığında herkesin skoru burada açılır.</div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,520px),1fr))", gap: 14 }}>
              {swMatches.map((m) => {
                const pl = played(m);
                const mp = swPreds.filter((x) => x.matchId === m.id);
                let nH = 0, nD = 0, nA = 0;
                mp.forEach((x) => { const r = res(x.predictedHome, x.predictedAway); r === "home" ? nH++ : r === "draw" ? nD++ : nA++; });
                const tot = Math.max(mp.length, 1);
                const d = ms(m.matchDate);
                const chips = mp.map((x) => {
                  const bd = (swCalc[x.userId]?.breakdown || []).find((b: any) => b.matchId === m.id);
                  const t = bd ? bd.earned + bd.bonus : 0;
                  let color = C.ink, bg = "rgba(255,255,255,.03)", border = C.line;
                  if (pl && bd) {
                    if (bd.isExact) { color = C.green; bg = "rgba(63,212,131,.10)"; border = "rgba(63,212,131,.45)"; }
                    else if (bd.isResult) { color = C.fire2; bg = "rgba(255,138,61,.08)"; border = "rgba(255,138,61,.40)"; }
                    else color = C.dim;
                    if (bd.bonus) border = C.gold;
                  } else if (pl) color = C.dim;
                  return { x, color, bg, border, t, pts: pl ? (t ? `+${t}` : "0") : "" };
                }).sort((a, b) => b.t - a.t);
                return (
                  <div key={m.id} style={{ borderRadius: 20, border: `1px solid ${pl ? "rgba(255,106,31,.30)" : C.line}`, background: C.card, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid rgba(255,190,140,.07)", ...label({ fontWeight: 700, fontSize: 12, letterSpacing: ".18em", color: C.mute }) }}>
                      <span>{d ? new Date(d).toLocaleString("tr-TR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Tarih bekleniyor"}</span>
                      <span style={{ color: pl ? C.green : C.gold }}>{pl ? "Sonuçlandı" : m.externalStatus || "Bekliyor"}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", alignItems: "center", gap: 12, padding: "18px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end", textAlign: "right", minWidth: 0 }}>
                        <span style={{ fontWeight: 700, fontSize: 16, overflowWrap: "anywhere" }}>{m.homeTeam}</span>
                        <TeamImg name={m.homeTeam} logo={m.homeTeamLogo} />
                      </div>
                      <div style={{ minWidth: 96, height: 56, padding: "0 12px", borderRadius: 12, background: pl ? C.fire : "rgba(255,255,255,.04)", color: pl ? "#140A04" : C.dim, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: 34 }}>{pl ? `${m.actualHome} - ${m.actualAway}` : "vs"}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <TeamImg name={m.awayTeam} logo={m.awayTeamLogo} />
                        <span style={{ fontWeight: 700, fontSize: 16, overflowWrap: "anywhere" }}>{m.awayTeam}</span>
                      </div>
                    </div>
                    {mp.length > 0 && (
                      <>
                        <div style={{ padding: "0 16px 12px" }}>
                          <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", gap: 2 }}>
                            <div style={{ width: `${(nH / tot) * 100}%`, background: C.fire }} />
                            <div style={{ width: `${(nD / tot) * 100}%`, background: C.dim }} />
                            <div style={{ width: `${(nA / tot) * 100}%`, background: C.gold }} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, ...label({ fontWeight: 700, fontSize: 12, letterSpacing: ".14em", color: C.mute }) }}>
                            <span style={{ whiteSpace: "nowrap" }}>Ev {nH}</span><span style={{ whiteSpace: "nowrap" }}>Beraberlik {nD}</span><span style={{ whiteSpace: "nowrap" }}>Deplasman {nA}</span>
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(112px,1fr))", gap: 6, padding: "12px 16px 16px", borderTop: "1px solid rgba(255,190,140,.07)" }}>
                          {chips.map((c) => (
                            <div key={c.x.id} title={byUser[c.x.userId]?.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, padding: "6px 8px", borderRadius: 10, border: `1px solid ${c.border}`, background: c.bg }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: C.soft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shortName(byUser[c.x.userId]?.name)}</span>
                              <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                                <span style={{ fontFamily: DISPLAY, fontSize: 16, color: c.color }}>{c.x.predictedHome}-{c.x.predictedAway}</span>
                                <span style={{ fontFamily: COND, fontWeight: 800, fontSize: 11, color: c.color }}>{c.pts}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {sw && swPreds.length > 0 && swMatches.some(played) && (
              <div style={{ ...card, borderRadius: 20, padding: "22px 22px 10px", overflowX: "auto" }}>
                <h3 style={{ margin: "0 0 12px", fontFamily: DISPLAY, fontWeight: 400, fontSize: 28, textTransform: "uppercase" }}>{weekLabel(sw.label)} karnesi</h3>
                <div style={{ minWidth: 460 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "34px minmax(0,1fr) 64px 64px 64px 64px", gap: 10, padding: "8px 0", ...label({ fontWeight: 700, fontSize: 12, letterSpacing: ".18em", color: C.dim }) }}>
                    <span>#</span><span>Yazar</span><span style={{ textAlign: "center" }}>Tam</span><span style={{ textAlign: "center" }}>Sonuç</span><span style={{ textAlign: "center" }}>Bonus</span><span style={{ textAlign: "right" }}>Puan</span>
                  </div>
                  {users.map((u) => ({ u, d: swCalc[u.id] || {} }))
                    .sort((a, b) => (b.d.totalWeekPoints || 0) - (a.d.totalWeekPoints || 0) || (b.d.exacts || 0) - (a.d.exacts || 0))
                    .map(({ u, d }, i) => (
                      <div key={u.id} style={{ display: "grid", gridTemplateColumns: "34px minmax(0,1fr) 64px 64px 64px 64px", gap: 10, alignItems: "center", padding: "9px 0", borderTop: "1px solid rgba(255,190,140,.07)" }}>
                        <span style={{ fontFamily: DISPLAY, fontSize: 18, color: rankColor(i) }}>{i + 1}</span>
                        <span style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</span>
                        <span style={{ textAlign: "center", fontFamily: COND, fontWeight: 800, fontSize: 18, color: C.green }}>{d.exacts || 0}</span>
                        <span style={{ textAlign: "center", fontFamily: COND, fontWeight: 800, fontSize: 18, color: C.fire2 }}>{d.results || 0}</span>
                        <span style={{ textAlign: "center", fontFamily: COND, fontWeight: 800, fontSize: 18, color: C.gold }}>{d.bonus || 0}</span>
                        <span style={{ textAlign: "right", fontFamily: DISPLAY, fontSize: 24 }}>{d.totalWeekPoints || 0}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* PUAN DURUMU */}
        {activeSeason && tab === "puan" && (
          <section style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 14, alignItems: "end" }}>
              {sortedUserStats.slice(0, 3).map((u, i) => (
                <div key={u.id} onClick={() => p.onUserClick(u)} style={{ cursor: "pointer", order: [2, 1, 3][i], borderRadius: 20, border: `1px solid ${RANK[i]}`, background: C.card, padding: 22, display: "flex", flexDirection: "column", gap: 10, minHeight: [300, 250, 220][i] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: DISPLAY, fontSize: 44, lineHeight: 1, color: RANK[i] }}>{i + 1}</span>
                    <Avatar user={u} size={48} radius={14} />
                  </div>
                  <div style={{ marginTop: "auto", fontFamily: DISPLAY, fontSize: 28, lineHeight: 1.05, textTransform: "uppercase", overflowWrap: "anywhere" }}>{u.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: DISPLAY, fontSize: 56, lineHeight: 1, color: RANK[i] }}>{u.totalPoints || 0}</span>
                    <span style={label({ fontWeight: 700, fontSize: 14, letterSpacing: ".2em", color: C.mute })}>Puan</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...card, borderRadius: 20, padding: "10px 22px", overflowX: "auto" }}>
              <div style={{ minWidth: 760 }}>
                <div style={{ display: "grid", gridTemplateColumns: "40px minmax(0,1fr) 70px 70px 70px 80px minmax(180px,1.1fr)", gap: 12, padding: "14px 0 10px", ...label({ fontWeight: 700, fontSize: 12, letterSpacing: ".18em", color: C.dim }) }}>
                  <span>#</span><span>Yazar</span><span style={{ textAlign: "center" }}>Tam</span><span style={{ textAlign: "center" }}>Sonuç</span><span style={{ textAlign: "center" }}>Ort.</span><span style={{ textAlign: "right" }}>Puan</span><span>Son haftalar</span>
                </div>
                {sortedUserStats.map((u, i) => (
                  <div key={u.id} onClick={() => p.onUserClick(u)} style={{ cursor: "pointer", display: "grid", gridTemplateColumns: "40px minmax(0,1fr) 70px 70px 70px 80px minmax(180px,1.1fr)", gap: 12, alignItems: "center", padding: "12px 0", borderTop: "1px solid rgba(255,190,140,.07)" }}>
                    <span style={{ fontFamily: DISPLAY, fontSize: 24, color: rankColor(i) }}>{i + 1}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <Avatar user={u} size={36} radius={10} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: C.mute }}>Bu hafta +{u.weekPoints || 0}</div>
                      </div>
                    </div>
                    <span style={{ textAlign: "center", fontFamily: COND, fontWeight: 800, fontSize: 20, color: C.green }}>{u.exacts || 0}</span>
                    <span style={{ textAlign: "center", fontFamily: COND, fontWeight: 800, fontSize: 20, color: C.fire2 }}>{u.results || 0}</span>
                    <span style={{ textAlign: "center", fontFamily: COND, fontWeight: 700, fontSize: 18, color: C.soft }}>{(u.avgPoints || 0).toFixed(1).replace(".", ",")}</span>
                    <span style={{ textAlign: "right", fontFamily: DISPLAY, fontSize: 32 }}>{u.totalPoints || 0}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {formWeeks.map((w) => {
                        const v = calc[w.id]?.[u.id]?.totalWeekPoints || 0;
                        return <span key={w.id} title={weekLabel(w.label)} style={{ flex: 1, maxWidth: 34, height: 30, borderRadius: 7, background: v >= 4 ? C.fire : v >= 2 ? "rgba(255,106,31,.35)" : v > 0 ? "rgba(255,106,31,.14)" : "rgba(255,255,255,.04)", color: v >= 4 ? "#140A04" : C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: COND, fontWeight: 800, fontSize: 15 }}>{v}</span>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 13, color: C.dim }}>Sıralama: puan → tam skor → doğru sonuç → isim. Satıra tıkla, yazarın profilini aç.</div>
          </section>
        )}

        {/* İSTATİSTİKLER — mevcut bileşen korunur */}
        {activeSeason && tab === "istatistik" && (
          <Statistics users={sortedUserStats} onUserClick={(u: any) => p.onUserClick(u)} />
        )}

        {/* LİG HAFIZASI */}
        {tab === "hafiza" && (
          <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 400, fontSize: 44, textTransform: "uppercase" }}>Lig hafızası</h2>
            {p.finishedSeasons.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed rgba(255,190,140,.18)", borderRadius: 20, color: C.mute }}>Henüz tamamlanmış sezon yok. İlk şampiyon bu sezon belli olacak.</div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: 14 }}>
              {p.finishedSeasons.map((se) => {
                let rows = (se.finalStandings || []).map((r) => ({ name: r.name, pts: r.totalPoints }));
                if (!rows.length) rows = users.map((u) => ({ name: u.name, pts: u.seasonPoints?.[se.id] || 0, ex: u.seasonExacts?.[se.id] || 0 }))
                  .filter((x) => x.pts > 0).sort((a: any, b: any) => b.pts - a.pts || b.ex - a.ex);
                return (
                  <div key={se.id} onClick={() => p.onArchiveClick(se)} style={{ cursor: "pointer", borderRadius: 20, border: "1px solid rgba(242,182,50,.22)", background: C.card, padding: 22 }}>
                    <div style={label({ fontSize: 12, color: C.gold })}>Tamamlandı</div>
                    <div style={{ fontFamily: DISPLAY, fontSize: 32, textTransform: "uppercase", lineHeight: 1.1, marginTop: 4 }}>{se.name}</div>
                    <div style={{ marginTop: 14 }}>
                      {rows.map((r, i) => (
                        <div key={r.name + i} style={{ display: "grid", gridTemplateColumns: "30px minmax(0,1fr) 60px", gap: 10, alignItems: "center", padding: "8px 0", borderTop: "1px solid rgba(255,190,140,.07)" }}>
                          <span style={{ fontFamily: DISPLAY, fontSize: 18, color: rankColor(i) }}>{i + 1}</span>
                          <span style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
                          <span style={{ textAlign: "right", fontFamily: DISPLAY, fontSize: 20 }}>{r.pts}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default FlameHome;
