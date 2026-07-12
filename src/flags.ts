const REGIONAL_INDICATOR_BASE = 0x1f1e6;

export function emojiFlagToIso(emoji: string | undefined | null): string | null {
  if (!emoji) return null;

  const chars = [...emoji];
  if (chars.length !== 2) return null;

  const codes = chars.map((char) => char.codePointAt(0) ?? 0);
  const isRegionalPair = codes.every(
    (code) => code >= REGIONAL_INDICATOR_BASE && code <= REGIONAL_INDICATOR_BASE + 25
  );

  if (!isRegionalPair) return null;

  return codes
    .map((code) => String.fromCharCode(code - REGIONAL_INDICATOR_BASE + 65))
    .join("")
    .toLowerCase();
}

const TURKISH_COUNTRY_TO_ISO: Record<string, string> = {
  turkiye: "tr",
  turkiyecumhuriyeti: "tr",
  fransa: "fr",
  almanya: "de",
  ispanya: "es",
  ingiltere: "gb-eng",
  belcika: "be",
  hollanda: "nl",
  italya: "it",
  portekiz: "pt",
  brezilya: "br",
  arjantin: "ar",
  fas: "ma",
  cezayir: "dz",
  tunus: "tn",
  misir: "eg",
  senegal: "sn",
  nijerya: "ng",
  gana: "gh",
  kamerun: "cm",
  fildisisahili: "ci",
  japonya: "jp",
  guneykore: "kr",
  suudiarabistan: "sa",
  iran: "ir",
  katar: "qa",
  avustralya: "au",
  meksika: "mx",
  amerika: "us",
  abd: "us",
  kanada: "ca",
  uruguay: "uy",
  kolombiya: "co",
  ekvador: "ec",
  peru: "pe",
  sili: "cl",
  paraguay: "py",
  venezuela: "ve",
  bolivya: "bo",
  hirvatistan: "hr",
  sirbistan: "rs",
  polonya: "pl",
  ukrayna: "ua",
  isvicre: "ch",
  avusturya: "at",
  danimarka: "dk",
  isvec: "se",
  norvec: "no",
  galler: "gb-wls",
  iskocya: "gb-sct",
  irlanda: "ie",
  yunanistan: "gr",
  rusya: "ru",
  cekya: "cz",
  slovakya: "sk",
  macaristan: "hu",
  romanya: "ro",
  bulgaristan: "bg",
  izlanda: "is",
  finlandiya: "fi",
  cin: "cn",
  yenizelanda: "nz",
  panama: "pa",
  kostarika: "cr",
  honduras: "hn",
  jamaika: "jm",
  hindistan: "in"
};

const normalizeTeamName = (name: string) =>
  name
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");

export function teamNameToIso(teamName: string | undefined | null): string | null {
  if (!teamName) return null;
  return TURKISH_COUNTRY_TO_ISO[normalizeTeamName(teamName)] ?? null;
}

export function flagUrlForIso(iso: string | null, width: 24 | 48 | 80 = 48): string | null {
  if (!iso) return null;
  return `https://flagcdn.com/w${width}/${iso}.png`;
}

export function flagUrlForTeam(teamName: string | undefined | null, width: 24 | 48 | 80 = 48): string | null {
  return flagUrlForIso(teamNameToIso(teamName), width);
}

const SOCCER_TEAM_LOGOS: Record<string, string> = {
  GS: "https://images.fotmob.com/image_resources/logo/team/10263.png",
  FB: "https://images.fotmob.com/image_resources/logo/team/8695.png",
  BJK: "https://images.fotmob.com/image_resources/logo/team/10188.png",
  TS: "https://images.fotmob.com/image_resources/logo/team/10185.png",
  BŞK: "https://images.fotmob.com/image_resources/logo/team/6153.png",
  ADS: "https://images.fotmob.com/image_resources/logo/team/9806.png",
  GÖZ: "https://images.fotmob.com/image_resources/logo/team/10186.png",
  KSK: "https://images.fotmob.com/image_resources/logo/team/246538.png",
  ESES: "https://images.fotmob.com/image_resources/logo/team/10183.png",
  BURSA: "https://images.fotmob.com/image_resources/logo/team/10181.png",
  SAMSUN: "https://images.fotmob.com/image_resources/logo/team/9801.png"
};

export function flagUrlForEmoji(emoji: string | undefined | null, width: 24 | 48 | 80 = 48): string | null {
  if (!emoji) return null;
  const upper = emoji.trim().toUpperCase();
  if (SOCCER_TEAM_LOGOS[upper]) {
    return SOCCER_TEAM_LOGOS[upper];
  }
  return flagUrlForIso(emojiFlagToIso(emoji), width);
}
