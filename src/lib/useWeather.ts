import { useCallback, useEffect, useMemo, useState } from "react";
import { codeToCondition, codeToSummaryES, type Condition } from "./weatherCodes";

export type WeatherStatus = "idle" | "loading" | "success" | "error";

export type WeatherNow = {
  tempC: number;
  feelsLikeC?: number;
  humidity?: number;
  windKmh?: number;
  windDeg?: number;
  isDay?: boolean;
  precipMm?: number;
  cloudCover?: number;
  code: number;
  condition: Condition;
  summary: string;
  at: string;
};

export type UseWeatherOptions = {
  latitude: number;
  longitude: number;
  timeZone?: string;
  ttlMs?: number;
};

type ApiResponse = {
  current?: {
    time: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    is_day?: number;
    precipitation?: number;
    rain?: number;
    showers?: number;
    snowfall?: number;
    weather_code?: number;
    cloud_cover?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    relative_humidity_2m?: number;
  };
};

// cache en memoria y promesas en curso (dedupe)
const memoryCache = new Map<string, { at: number; data: WeatherNow }>();
const pending = new Map<string, Promise<WeatherNow>>();

export default function useWeather(opts?: UseWeatherOptions) {
  const { latitude, longitude, timeZone, ttlMs = 5 * 60_000 } = opts ?? ({} as UseWeatherOptions);

  const [status, setStatus] = useState<WeatherStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<WeatherNow | null>(null);

  const key = useMemo(() => {
    if (typeof latitude !== "number" || typeof longitude !== "number") return null;
    const lat = Number(latitude.toFixed(3));
    const lon = Number(longitude.toFixed(3));
    const tz = timeZone ?? "auto";
    return `${lat},${lon}@${tz}`;
  }, [latitude, longitude, timeZone]);

  const buildUrl = () => {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      timezone: timeZone ?? "auto",
      current: [
        "temperature_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "rain",
        "showers",
        "snowfall",
        "weather_code",
        "cloud_cover",
        "wind_speed_10m",
        "wind_direction_10m",
        "relative_humidity_2m",
      ].join(","),
      temperature_unit: "celsius",
      wind_speed_unit: "kmh",
      precipitation_unit: "mm",
    });
    return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  };

  const normalize = (r: ApiResponse): WeatherNow | null => {
    const c = r.current;
    if (!c || typeof c.weather_code !== "number" || typeof c.temperature_2m !== "number") return null;
    const code = c.weather_code;
    return {
      tempC: c.temperature_2m,
      feelsLikeC: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      windKmh: c.wind_speed_10m,
      windDeg: c.wind_direction_10m,
      isDay: c.is_day === 1,
      precipMm: c.precipitation ?? c.rain ?? c.showers ?? c.snowfall,
      cloudCover: c.cloud_cover,
      code,
      condition: codeToCondition(code),
      summary: codeToSummaryES(code),
      at: c.time,
    };
  };

  const fetchNow = useCallback(async () => {
    if (key == null) return;
    setStatus("loading");
    setError(null);

    const cached = memoryCache.get(key);
    const now = Date.now();
    if (cached && now - cached.at < ttlMs) {
      setCurrent(cached.data);
      setStatus("success");
      return;
    }

    // dedupe si ya hay una promesa en curso
    const existing = pending.get(key);
    if (existing) {
      try {
        const data = await existing;
        setCurrent(data);
        setStatus("success");
      } catch (e: any) {
        setError(e?.message ?? "Error de red");
        setStatus("error");
      }
      return;
    }

    // crear promesa compartida
    const p = (async () => {
      const res = await fetch(buildUrl());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ApiResponse;
      const norm = normalize(json);
      if (!norm) throw new Error("Respuesta inesperada del clima");
      memoryCache.set(key, { at: now, data: norm });
      return norm;
    })();

    pending.set(key, p);
    try {
      const data = await p;
      setCurrent(data);
      setStatus("success");
    } catch (e: any) {
      setError(e?.message ?? "Error de red");
      setStatus("error");
    } finally {
      pending.delete(key);
    }
  }, [key, ttlMs, latitude, longitude, timeZone]);

  useEffect(() => {
    if (key) fetchNow();
  }, [key, fetchNow]);

  return { status, error, current, refresh: fetchNow };
}
