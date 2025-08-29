// src/lib/weatherCodes.ts

export type Condition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunder";

const summaryES: Record<number, string> = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna débil",
  53: "Llovizna",
  55: "Llovizna fuerte",
  56: "Llovizna helada débil",
  57: "Llovizna helada",
  61: "Lluvia débil",
  63: "Lluvia",
  65: "Lluvia fuerte",
  66: "Lluvia helada débil",
  67: "Lluvia helada",
  71: "Nevada débil",
  73: "Nevada",
  75: "Nevada fuerte",
  77: "Granos de nieve",
  80: "Chubascos débiles",
  81: "Chubascos",
  82: "Chubascos fuertes",
  85: "Chubascos de nieve débiles",
  86: "Chubascos de nieve",
  95: "Tormenta",
  96: "Tormenta con granizo débil",
  99: "Tormenta con granizo",
};

export function codeToCondition(code: number): Condition {
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";

  if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "thunder";

  // fallback seguro
  return "cloudy";
}

export function codeToSummaryES(code: number): string {
  return summaryES[code] ?? "Condición desconocida";
}
