// Vercel sunucu fonksiyonu: ESPN Süper Lig verisini API-Football formatında döndürür.
// Anahtar gerekmez. Tarayıcı ESPN'e doğrudan erişemediği için bu köprü kullanılır.
const BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1";

const statusShort = (s = {}) => {
  const t = s.type || {};
  const n = t.name || "";
  if (t.completed) return "FT";
  if (/POSTPONED/.test(n)) return "PST";
  if (/CANCEL/.test(n)) return "CANC";
  if (/HALFTIME/.test(n)) return "HT";
  if (t.state === "in") return "LIVE";
  return "NS";
};

const roundLabel = (iso) => {
  const d = new Date(iso);
  const tr = new Date(d.getTime() + 3 * 3600 * 1000); // İstanbul saati
  const back = (tr.getUTCDay() + 2) % 7; // Cuma = 0
  const fri = new Date(tr.getTime() - back * 86400000);
  const p = (x) => String(x).padStart(2, "0");
  return `${p(fri.getUTCDate())}.${p(fri.getUTCMonth() + 1)}.${fri.getUTCFullYear()} haftası`;
};

const logoOf = (team = {}) => team.logo || (team.logos && team.logos[0] && team.logos[0].href) || "";
const num = (v) => (v === undefined || v === null || v === "" ? null : Number(v));

const toFixture = (id, comp) => {
  const home = comp.competitors.find((c) => c.homeAway === "home") || comp.competitors[0];
  const away = comp.competitors.find((c) => c.homeAway === "away") || comp.competitors[1];
  const short = statusShort(comp.status);
  const done = short === "FT";
  return {
    fixture: { id: Number(id), date: comp.date, status: { short, long: comp.status?.type?.description || "" } },
    league: { id: 203, name: "Süper Lig", round: roundLabel(comp.date) },
    teams: {
      home: { id: Number(home.team?.id), name: home.team?.displayName || home.team?.name, logo: logoOf(home.team) },
      away: { id: Number(away.team?.id), name: away.team?.displayName || away.team?.name, logo: logoOf(away.team) }
    },
    score: { fulltime: { home: done ? num(home.score) : null, away: done ? num(away.score) : null } }
  };
};

export default async function handler(req, res) {
  const { id, season, from, to } = req.query || {};
  try {
    let out = [];
    if (id) {
      const j = await (await fetch(`${BASE}/summary?event=${encodeURIComponent(id)}`)).json();
      const comp = j.header && j.header.competitions && j.header.competitions[0];
      if (comp) out = [toFixture(j.header.id || id, comp)];
    } else {
      const now = new Date();
      const y = Number(season) || (now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1);
      const range = from && to ? `${from}-${to}` : `${y}0701-${y + 1}0630`;
      const j = await (await fetch(`${BASE}/scoreboard?dates=${range}&limit=1000`)).json();
      out = (j.events || []).map((e) => toFixture(e.id, e.competitions[0]));
    }
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).json({ errors: {}, response: out });
  } catch (e) {
    res.status(200).json({ errors: { kaynak: "Maç verisi alınamadı: " + (e && e.message ? e.message : e) }, response: [] });
  }
}
