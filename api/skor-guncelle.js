// Skor botu: aktif sezonun yayınlanmamış haftalarındaki maçları ESPN ile eşler.
// - Tarih/saat yoksa veya değiştiyse günceller (geri sayım + otomatik kilit bunu kullanır)
// - Logo yoksa ekler
// - Biten maçın skoru BOŞSA yazar. Elle girilmiş skora ASLA dokunmaz.
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./_firebase.js";

const ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1";
const THROTTLE_MS = 8 * 60 * 1000;

const tokens = (s) =>
  (s || "")
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/spor$/, ""))
    .filter((t) => t.length >= 3 && !["istanbul", "fk", "sk", "jk", "kulubu", "futbol", "as", "bb", "club", "the"].includes(t));

const sameTeam = (a, b) => {
  const A = tokens(a), B = tokens(b);
  return A.some((x) => B.some((y) => x === y || (x.length >= 5 && y.length >= 5 && x.slice(0, 5) === y.slice(0, 5))));
};

const toMs = (d) => {
  if (!d) return 0;
  if (typeof d.toMillis === "function") return d.toMillis();
  if (d._seconds) return d._seconds * 1000;
  if (d.seconds) return d.seconds * 1000;
  if (typeof d === "string") return new Date(d).getTime() || 0;
  return 0;
};
const ymd = (t) => new Date(t).toISOString().slice(0, 10).replace(/-/g, "");
const logoOf = (team = {}) => team.logo || (team.logos && team.logos[0] && team.logos[0].href) || "";

export default async function handler(req, res) {
  const force = req.query && req.query.zorla === "evet";
  try {
    const db = adminDb();
    const botRef = db.doc("integrations/skorBot");
    const bot = (await botRef.get()).data() || {};
    if (!force && bot.lastRun && Date.now() - toMs(bot.lastRun) < THROTTLE_MS) {
      return res.status(200).json({ atlandi: true, son: bot.lastSummary || null });
    }

    const seasons = await db.collection("seasons").where("status", "==", "active").limit(1).get();
    if (seasons.empty) return res.status(200).json({ mesaj: "Aktif sezon yok" });
    const season = seasons.docs[0];

    const now = Date.now();
    const sb = await (await fetch(`${ESPN}/scoreboard?dates=${ymd(now - 45 * 864e5)}-${ymd(now + 21 * 864e5)}&limit=1000`)).json();
    const events = (sb.events || []).map((e) => {
      const c = e.competitions[0];
      const h = c.competitors.find((x) => x.homeAway === "home");
      const a = c.competitors.find((x) => x.homeAway === "away");
      return {
        id: Number(e.id), date: new Date(c.date || e.date).getTime(), done: !!c.status?.type?.completed,
        state: c.status?.type?.completed ? "FT" : c.status?.type?.state === "in" ? "LIVE" : "NS",
        home: h.team.displayName, away: a.team.displayName, homeLogo: logoOf(h.team), awayLogo: logoOf(a.team),
        hs: h.score === undefined || h.score === "" ? null : Number(h.score), as: a.score === undefined || a.score === "" ? null : Number(a.score)
      };
    });

    const weeks = await season.ref.collection("weeks").get();
    const summary = { eslesen: 0, saat: 0, skor: 0, logo: 0, eslesmeyen: [] };
    const batch = db.batch();
    let writes = 0;

    for (const w of weeks.docs) {
      if (w.data().pointsPublished) continue;
      const matches = await w.ref.collection("matches").get();
      for (const m of matches.docs) {
        const d = m.data();
        const mDate = toMs(d.matchDate);
        let cands = events.filter((e) => sameTeam(d.homeTeam, e.home) && sameTeam(d.awayTeam, e.away));
        if (d.externalFixtureId) cands = events.filter((e) => e.id === Number(d.externalFixtureId)).concat(cands);
        if (mDate) cands = cands.filter((e) => Math.abs(e.date - mDate) < 5 * 864e5);
        cands.sort((x, y) => Math.abs(x.date - (mDate || now)) - Math.abs(y.date - (mDate || now)));
        const ev = cands[0];
        if (!ev) { summary.eslesmeyen.push(`${d.homeTeam} - ${d.awayTeam}`); continue; }
        summary.eslesen++;

        const up = {};
        if (!mDate || Math.abs(ev.date - mDate) > 60 * 1000) { up.matchDate = Timestamp.fromMillis(ev.date); summary.saat++; }
        if (!d.homeTeamLogo && ev.homeLogo) { up.homeTeamLogo = ev.homeLogo; summary.logo++; }
        if (!d.awayTeamLogo && ev.awayLogo) up.awayTeamLogo = ev.awayLogo;
        if (!d.externalFixtureId) up.externalFixtureId = ev.id;
        if (d.externalStatus !== ev.state) up.externalStatus = ev.state;
        const empty = d.actualHome === null || d.actualHome === undefined || d.actualAway === null || d.actualAway === undefined;
        if (ev.done && empty && ev.hs !== null && ev.as !== null) { up.actualHome = ev.hs; up.actualAway = ev.as; summary.skor++; }
        if (Object.keys(up).length) { up.updatedAt = FieldValue.serverTimestamp(); batch.update(m.ref, up); writes++; }
      }
    }

    batch.set(botRef, { lastRun: FieldValue.serverTimestamp(), lastSummary: summary }, { merge: true });
    await batch.commit();
    res.status(200).json({ tamam: true, guncellenen: writes, ...summary });
  } catch (e) {
    res.status(200).json({ hata: String(e && e.message ? e.message : e) });
  }
}
