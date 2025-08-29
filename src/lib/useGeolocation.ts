import { useCallback, useEffect, useState } from "react";

export type GeoSource = "device" | "manual";
export type GeoStatus = "idle" | "prompt" | "granted" | "denied" | "unsupported" | "error";

export type GeoPosition = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  label?: string;
};

type Options = {
  /** Si el permiso está concedido, ¿pedir posición al montar? */
  getOnMount?: boolean;
  /** Fallback inicial si no hay nada guardado */
  initialManual?: GeoPosition;
  /** Persistir setManual() en localStorage */
  persist?: boolean;
  /** Clave de localStorage */
  storageKey?: string;
  /** Intentar arrancar con lo guardado (si existe) */
  startWithSaved?: boolean;

  // Opciones de geoloc del navegador
  highAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
};

const DEFAULT_MANUAL: GeoPosition = {
  latitude: -31.4201, // Córdoba, AR
  longitude: -64.1888,
  label: "Córdoba, AR",
};

function isValidPos(x: any): x is GeoPosition {
  return (
    x &&
    typeof x.latitude === "number" &&
    typeof x.longitude === "number" &&
    Math.abs(x.latitude) <= 90 &&
    Math.abs(x.longitude) <= 180
  );
}

export default function useGeolocation({
  getOnMount = true,
  initialManual = DEFAULT_MANUAL,
  persist = true,
  storageKey = "geo:manual:v1",
  startWithSaved = true,
  highAccuracy = false,
  timeoutMs = 10_000,
  maximumAgeMs = 60_000,
}: Options = {}) {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<GeoSource>("manual");
  const [position, setPosition] = useState<GeoPosition | null>(initialManual);
  const [hasSaved, setHasSaved] = useState<boolean>(false);

  // cargar guardado si existe
  useEffect(() => {
    if (!startWithSaved) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (isValidPos(saved)) {
        setPosition(saved);
        setSource("manual");
        setStatus("granted");
        setHasSaved(true);
      }
    } catch {
      // ignorar errores de parse/permiso
    }
  }, [startWithSaved, storageKey]);

  const gotPosition = useCallback((pos: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = pos.coords;
    setPosition({ latitude, longitude, accuracy });
    setSource("device");
    setStatus("granted");
    setError(null);
  }, []);

  const gotError = useCallback((err: GeolocationPositionError) => {
    if (err.code === err.PERMISSION_DENIED) setStatus("denied");
    else setStatus("error");
    setSource("manual");
    setError(err.message || "Geolocation error");
  }, []);

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      setSource("manual");
      setError("Geolocation no soportada por este navegador.");
      return;
    }
    setStatus("prompt");
    setError(null);
    navigator.geolocation.getCurrentPosition(gotPosition, gotError, {
      enableHighAccuracy: highAccuracy,
      timeout: timeoutMs,
      maximumAge: maximumAgeMs,
    });
  }, [gotError, gotPosition, highAccuracy, timeoutMs, maximumAgeMs]);

  // Chequear permiso (no fuerza a pedir la posición si getOnMount=false)
  useEffect(() => {
    let cancelled = false;
    const checkPermission = async () => {
      if (!("geolocation" in navigator)) {
        if (!cancelled) {
          setStatus("unsupported");
          setSource("manual");
        }
        return;
      }
      try {
        
        const p = await navigator.permissions?.query?.({ name: "geolocation" });
        const state = p?.state as PermissionState | undefined;
        if (state === "granted") {
          if (getOnMount) request();
          else setStatus("granted");
        } else if (state === "denied") {
          setStatus("denied");
          setSource("manual");
        } else {
          setStatus("idle");
        }
      } catch {
        setStatus("idle");
      }
    };
    checkPermission();
    return () => {
      cancelled = true;
    };
  }, [getOnMount, request]);

  const setManual = useCallback(
    (lat: number, lon: number, label?: string) => {
      const pos = { latitude: lat, longitude: lon, label };
      setPosition(pos);
      setSource("manual");
      setStatus("granted");
      setError(null);

      if (persist) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(pos));
          setHasSaved(true);
        } catch {
          // puede fallar en private mode; no rompemos la app
        }
      }
    },
    [persist, storageKey]
  );

  const clearManual = useCallback(() => {
    setPosition(null);
    setSource("manual");
    setStatus("idle");
  }, []);

  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    setHasSaved(false);
  }, [storageKey]);

  return { status, error, source, position, hasSaved, request, setManual, clearManual, clearSaved };
}
