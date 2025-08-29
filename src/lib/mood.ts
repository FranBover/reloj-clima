// src/lib/mood.ts
import type { Condition } from "./weatherCodes";

export type Season = "summer" | "autumn" | "winter" | "spring";
export type DayPeriod = "dawn" | "morning" | "afternoon" | "evening" | "night";

export type Mood = {
  name: string; // ej: "clear • afternoon • summer"
  colors: {
    bg1: string;
    bg2: string;
    accent: string;
    text: string;
  };
  meta: {
    season: Season;
    period: DayPeriod;
    condition: Condition;
    isDay: boolean;
  };
};

/** Determina estación según mes y hemisferio (lat < 0 => sur). */
export function getSeason(d: Date, latitude: number): Season {
  const m = d.getMonth(); // 0=Ene..11=Dic
  const north = latitude >= 0;
  if (north) {
    if (m <= 1 || m === 11) return "winter";         // Dic-Ene-Feb
    if (m >= 2 && m <= 4) return "spring";           // Mar-Abr-May
    if (m >= 5 && m <= 7) return "summer";           // Jun-Jul-Ago
    return "autumn";                                 // Sep-Oct-Nov
  } else {
    // Hemisferio sur: estaciones invertidas 6 meses
    if (m <= 1 || m === 11) return "summer";         // Dic-Ene-Feb
    if (m >= 2 && m <= 4) return "autumn";           // Mar-Abr-May
    if (m >= 5 && m <= 7) return "winter";           // Jun-Jul-Ago
    return "spring";                                 // Sep-Oct-Nov
  }
}

/** Franja simple por hora local (si no tenés sunrise/sunset). */
export function getDayPeriod(hour: number): DayPeriod {
  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

/** Paletas base por condición + día/noche. */
function basePalette(condition: Condition, isDay: boolean) {
  // Elegí colores sobrios para el Canvas; afinaremos luego.
  const P = {
    clear_day:    { bg1: "#0ea5e9", bg2: "#22d3ee", accent: "#fde047", text: "#0b132b" },
    clear_night:  { bg1: "#0b132b", bg2: "#1b2a41", accent: "#a78bfa", text: "#e5e7eb" },
    partly_day:   { bg1: "#60a5fa", bg2: "#22d3ee", accent: "#f59e0b", text: "#0b132b" },
    partly_night: { bg1: "#0f172a", bg2: "#1f2937", accent: "#93c5fd", text: "#e5e7eb" },
    cloudy_day:   { bg1: "#475569", bg2: "#334155", accent: "#a3e635", text: "#e5e7eb" },
    cloudy_night: { bg1: "#0b0f19", bg2: "#111827", accent: "#86efac", text: "#e5e7eb" },
    drizzle_day:  { bg1: "#7dd3fc", bg2: "#38bdf8", accent: "#c084fc", text: "#0b132b" },
    drizzle_night:{ bg1: "#0ea5e9", bg2: "#164e63", accent: "#a78bfa", text: "#e5e7eb" },
    rain_day:     { bg1: "#0ea5e9", bg2: "#0369a1", accent: "#67e8f9", text: "#e5e7eb" },
    rain_night:   { bg1: "#0b132b", bg2: "#1e3a8a", accent: "#67e8f9", text: "#e5e7eb" },
    thunder_day:  { bg1: "#6d28d9", bg2: "#0ea5e9", accent: "#fde047", text: "#f1f5f9" },
    thunder_night:{ bg1: "#581c87", bg2: "#1e293b", accent: "#fde047", text: "#f1f5f9" },
    fog_day:      { bg1: "#94a3b8", bg2: "#64748b", accent: "#e2e8f0", text: "#0b132b" },
    fog_night:    { bg1: "#334155", bg2: "#1e293b", accent: "#cbd5e1", text: "#e5e7eb" },
    snow_day:     { bg1: "#e2e8f0", bg2: "#94a3b8", accent: "#60a5fa", text: "#0b132b" },
    snow_night:   { bg1: "#cbd5e1", bg2: "#64748b", accent: "#93c5fd", text: "#0b132b" },
  } as const;

  const key =
    condition === "clear" ? (isDay ? "clear_day" : "clear_night") :
    condition === "partly-cloudy" ? (isDay ? "partly_day" : "partly_night") :
    condition === "cloudy" ? (isDay ? "cloudy_day" : "cloudy_night") :
    condition === "drizzle" ? (isDay ? "drizzle_day" : "drizzle_night") :
    condition === "rain" ? (isDay ? "rain_day" : "rain_night") :
    condition === "thunder" ? (isDay ? "thunder_day" : "thunder_night") :
    condition === "fog" ? (isDay ? "fog_day" : "fog_night") :
    /* snow */           (isDay ? "snow_day" : "snow_night");

  return P[key];
}

/** Tweak liviano por estación/periodo para dar carácter sin librerías. */
function seasonPeriodTweak(colors: { bg1: string; bg2: string; accent: string; text: string }, season: Season, period: DayPeriod) {
  // Usamos filtros CSS variables luego en el Canvas; acá sólo pequeñas variaciones.
  // Para mantenerlo simple, cambiamos el accent según estación.
  const accentBySeason: Record<Season, string> = {
    summer: "#fbbf24",  // ámbar
    autumn: "#f97316",  // naranja
    winter: "#60a5fa",  // azul
    spring: "#22c55e",  // verde
  };
  const accent = accentBySeason[season] || colors.accent;

  // En la noche, subimos contraste del texto en fondos claros
  const text = (period === "night" || period === "evening") ? "#e5e7eb" : colors.text;

  return { ...colors, accent, text };
}

/** API principal: arma el mood desde parámetros. */
export function getMood(params: {
  condition: Condition;
  isDay: boolean;
  date: Date;
  latitude: number;
}): Mood {
  const season = getSeason(params.date, params.latitude);
  const period = getDayPeriod(params.date.getHours());
  const base = basePalette(params.condition, params.isDay);
  const colors = seasonPeriodTweak(base, season, period);

  const name = `${params.condition} • ${period} • ${season}`;
  return { name, colors, meta: { season, period, condition: params.condition, isDay: params.isDay } };
}
