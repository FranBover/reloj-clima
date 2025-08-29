// src/lib/PaletteContext.tsx
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import type { PropsWithChildren } from "react";
import type { PaletteChoice } from "./palettes";

type PaletteCtx = {
  choice: PaletteChoice;
  setChoice: (c: PaletteChoice) => void;
};

const Ctx = createContext<PaletteCtx | null>(null);
const KEY = "palette-choice:v1";

export function PaletteProvider({ children }: PropsWithChildren) {
  const [choice, _setChoice] = useState<PaletteChoice>("auto");

  // cargar preferencia guardada
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as PaletteChoice | null;
      if (saved && ["auto", "warm", "cool", "neutral", "crazy", "pastel"].includes(saved)) {
        _setChoice(saved as PaletteChoice);
      }
    } catch {}
  }, []);

  // setter que persiste
  const setChoice = useCallback((c: PaletteChoice) => {
    _setChoice(c);
    try { localStorage.setItem(KEY, c); } catch {}
  }, []);

  const value = useMemo(() => ({ choice, setChoice }), [choice, setChoice]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePalette() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePalette debe usarse dentro de <PaletteProvider>");
  return v;
}
