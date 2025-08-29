// src/lib/palettes.ts
import type { Mood } from "./mood";

export type PaletteChoice = "auto" | "warm" | "cool" | "neutral" | "crazy" | "pastel";

type PaletteColors = { bg1: string; bg2: string; accent: string; text: string };

export const FIXED_PALETTES: Record<Exclude<PaletteChoice, "auto">, PaletteColors> = {
  warm: {
    // cálidos
    bg1: "#f97316", // orange-500
    bg2: "#fdba74", // orange-300
    accent: "#fde047", // yellow-300
    text: "#0b132b",
  },
  cool: {
    // fríos
    bg1: "#0ea5e9", // sky-500
    bg2: "#6366f1", // indigo-500
    accent: "#22d3ee", // cyan-300
    text: "#e5e7eb",
  },
  neutral: {
    // neutros oscuros
    bg1: "#1f2937", // gray-800
    bg2: "#111827", // gray-900
    accent: "#9ca3af", // gray-400
    text: "#e5e7eb",
  },
  crazy: {
    // colores “locos”
    bg1: "#f472b6", // pink-400
    bg2: "#a78bfa", // violet-400
    accent: "#22d3ee", // cyan-300
    text: "#0b132b",
  },
  pastel: {
    // pasteles
    bg1: "#fde68a", // amber-200
    bg2: "#a7f3d0", // emerald-200
    accent: "#93c5fd", // blue-300
    text: "#0b132b",
  },
};

export function applyPaletteOverride(mood: Mood, choice: PaletteChoice): Mood {
  if (choice === "auto") return mood;
  const fixed = FIXED_PALETTES[choice];
  return {
    ...mood,
    colors: { ...fixed },
    name: `${mood.meta.condition} • ${mood.meta.period} • ${mood.meta.season} • ${choice}`,
  };
}
