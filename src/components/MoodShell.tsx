import { useMemo } from "react";
import type { PropsWithChildren, CSSProperties } from "react";
import useGeolocation from "../lib/useGeoLocation";
import useWeather from "../lib/useWeather";
import useClock from "../lib/useClock";
import { getMood } from "../lib/mood";
import { applyPaletteOverride } from "../lib/palettes";
import { usePalette } from "../lib/PaletteContext";

export default function MoodShell({ children }: PropsWithChildren) {
  const { choice } = usePalette();
  const { position } = useGeolocation({ getOnMount: false });
  const { now } = useClock({ withSeconds: false });

  const lat = position?.latitude ?? 0;
  const lon = position?.longitude ?? 0;

  const { current } = useWeather(
    position ? { latitude: lat, longitude: lon } : undefined
  );

  const condition = current?.condition ?? "cloudy";
  const isDay = current?.isDay ?? (now.getHours() >= 7 && now.getHours() < 19);

  const mood = useMemo(
    () => getMood({ condition, isDay, date: now, latitude: lat }),
    [condition, isDay, now, lat]
  );

  const finalMood = useMemo(() => applyPaletteOverride(mood, choice), [mood, choice]);

  const styleVars = {
    "--bg1": finalMood.colors.bg1,
    "--bg2": finalMood.colors.bg2,
    "--accent": finalMood.colors.accent,
    "--text": finalMood.colors.text,
  } as CSSProperties;

  return (
    <div style={styleVars} className="relative min-h-screen">
      {children}
    </div>
  );
}
