import type { CSSProperties } from "react";
import useGeolocation from "../lib/useGeoLocation";
import useWeather from "../lib/useWeather";
import useClock from "../lib/useClock";
import { getMood } from "../lib/mood";
import { FIXED_PALETTES, type PaletteChoice } from "../lib/palettes";
import { usePalette } from "../lib/PaletteContext";
import { useMemo, useRef, useState, useEffect } from "react";

const CHOICES: { id: PaletteChoice; label: string; desc: string }[] = [
  { id: "auto",    label: "Auto (clima)", desc: "Usa estación, franja y condición" },
  { id: "warm",    label: "Cálido",       desc: "Naranjas/ámbar" },
  { id: "cool",    label: "Frío",         desc: "Azules/violetas" },
  { id: "neutral", label: "Neutro",       desc: "Grises sobrios" },
  { id: "crazy",   label: "Locos",        desc: "Pink + Violet + Cyan" },
  { id: "pastel",  label: "Pastel",       desc: "Suave y tenue" },
];

export default function MoodPanel({ bare = false }: { bare?: boolean }) {
  const { choice, setChoice } = usePalette();

  const { position } = useGeolocation({ getOnMount: false });
  const lat = position?.latitude ?? 0;

  const { now } = useClock({ withSeconds: false });
  const { current, status } = useWeather(
    position ? { latitude: position.latitude, longitude: position.longitude } : undefined
  );

  const condition = current?.condition ?? "cloudy";
  const isDay = current?.isDay ?? (now.getHours() >= 7 && now.getHours() < 19);

  const mood = getMood({ condition, isDay, date: now, latitude: lat });

  const effective =
    choice === "auto" ? mood.colors : FIXED_PALETTES[choice];

  const styleVars = {
    "--bg1": effective.bg1,
    "--bg2": effective.bg2,
    "--accent": effective.accent,
    "--text": effective.text,
  } as CSSProperties;

  const content = (
    <div className="space-y-3" style={styleVars}>
      <PaletteCombo value={choice} onChange={setChoice} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Swatch label="bg1" value={effective.bg1} />
        <Swatch label="bg2" value={effective.bg2} />
        <Swatch label="accent" value={effective.accent} />
        <Swatch label="text" value={effective.text} darkText />
      </div>
      <p className="text-xs text-zinc-400">
        {mood.name} {choice !== "auto" ? `• override: ${choice}` : ""} ·{" "}
        {status === "success" ? "Datos del clima ✓" : "Sin clima (fallback)"}
      </p>
    </div>
  );

  if (bare) return content;
  // (si en algún lado quisieras usar la versión con gradiente, podés hacerlo aparte)
  return content;
}

function Swatch({ label, value, darkText = false }: { label: string; value: string; darkText?: boolean }) {
  return (
    <div className="rounded-xl overflow-hidden ring-1 ring-white/10">
      <div className="px-3 py-5" style={{ backgroundColor: value, color: darkText ? "#0b132b" : "#e5e7eb" }} />
      <div className="px-3 py-2 text-xs bg-black/30 flex justify-between">
        <span className="opacity-80">{label}</span>
        <span className="font-mono">{value}</span>
      </div>
    </div>
  );
}

// Combobox accesible (versión compacta)
function PaletteCombo({
  value,
  onChange,
}: {
  value: PaletteChoice;
  onChange: (v: PaletteChoice) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(
    Math.max(0, CHOICES.findIndex((c) => c.id === value))
  );
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const label = CHOICES.find((c) => c.id === value)?.label ?? "Auto (clima)";
  const activedId = `opt-${(CHOICES[active] ?? CHOICES[0]).id}`;

  // Mini swatches
  const mini = useMemo(() => {
    const map: Record<
      Exclude<PaletteChoice, "auto">,
      { bg1: string; bg2: string; accent: string }
    > = {
      warm: FIXED_PALETTES.warm,
      cool: FIXED_PALETTES.cool,
      neutral: FIXED_PALETTES.neutral,
      crazy: FIXED_PALETTES.crazy,
      pastel: FIXED_PALETTES.pastel,
    };
    return map;
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!listRef.current || !btnRef.current) return;
      if (listRef.current.contains(t) || btnRef.current.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onBtnKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      setActive(Math.max(0, CHOICES.findIndex((c) => c.id === value)));
      queueMicrotask(() => listRef.current?.focus());
    }
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      btnRef.current?.focus();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % CHOICES.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + CHOICES.length) % CHOICES.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = CHOICES[active]?.id ?? value;
      onChange(pick);
      setOpen(false);
      btnRef.current?.focus();
    }
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Elegir paleta de colores"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onBtnKey}
        className="w-full justify-between rounded-lg px-3 py-2 bg-black/30 hover:bg-black/40 text-white ring-1 ring-white/15 flex items-center gap-3 text-sm"
      >
        <span className="font-medium">{label}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-80">
          <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={activedId}
          onKeyDown={onListKey}
          className="absolute z-10 mt-2 w-full rounded-xl bg-zinc-950/95 ring-1 ring-white/15 shadow-lg backdrop-blur-sm p-1"
        >
          {CHOICES.map((opt, i) => {
            const isSelected = value === opt.id;
            const isActive = i === active;
            const isAuto = opt.id === "auto";
            const sw = !isAuto ? mini[opt.id as Exclude<PaletteChoice, "auto">] : null;

            return (
              <div
                id={`opt-${opt.id}`}
                role="option"
                aria-selected={isSelected}
                key={opt.id}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                  btnRef.current?.focus();
                }}
                className={[
                  "flex items-center justify-between gap-3 rounded-lg px-3 py-2 cursor-pointer",
                  isActive ? "bg-white/10" : "hover:bg-white/5",
                  isSelected ? "ring-1 ring-white/20" : "",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className="text-xs text-zinc-400">{opt.desc}</div>
                </div>
                <div className="flex items-center gap-1">
                  {isAuto ? (
                    <span className="text-xs text-zinc-400">clima</span>
                  ) : (
                    <>
                      <span className="h-4 w-4 rounded" style={{ backgroundColor: sw!.bg1 }} />
                      <span className="h-4 w-4 rounded" style={{ backgroundColor: sw!.bg2 }} />
                      <span className="h-4 w-4 rounded ring-1 ring-white/20" style={{ backgroundColor: sw!.accent }} />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
