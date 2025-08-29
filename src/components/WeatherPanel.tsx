import useWeather from "../lib/useWeather";
import useGeolocation from "../lib/useGeoLocation";
import Skeleton from "./Skeleton";

export default function WeatherPanel({ bare = false }: { bare?: boolean }) {
  const { position, status: geoStatus, request } = useGeolocation({ getOnMount: false });
  const lat = position?.latitude;
  const lon = position?.longitude;

  const { status, error, current, refresh } = useWeather(
    lat != null && lon != null ? { latitude: lat, longitude: lon } : undefined
  );

  const label =
    position?.label ??
    (lat != null && lon != null ? `${lat.toFixed(3)}, ${lon.toFixed(3)}` : "Sin coordenadas");

  const EmptyState = (
    <div className="rounded-xl bg-black/20 p-3 ring-1 ring-white/10">
      <p className="text-sm text-zinc-300">
        Para ver el clima, necesitamos tu ubicación.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => request()}
          className="rounded-lg px-3 py-2 bg-white/10 hover:bg-white/15 text-white ring-1 ring-white/15 text-sm"
        >
          Usar mi ubicación (GPS)
        </button>
        <span className="text-xs text-zinc-400">
          Estado: <strong className="text-zinc-200">{geoStatus}</strong>
        </span>
      </div>
    </div>
  );

  const LoadingSkeleton = (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="col-span-2 space-y-2">
        <div className="text-zinc-400 text-xs">Condición</div>
        <Skeleton className="h-6" />
      </div>
      <div className="space-y-2">
        <div className="text-zinc-400 text-xs">Temp</div>
        <Skeleton className="h-8" />
      </div>
      <div className="space-y-2">
        <div className="text-zinc-400 text-xs">Sensación</div>
        <Skeleton className="h-6" />
      </div>
      <div className="space-y-2">
        <div className="text-zinc-400 text-xs">Humedad</div>
        <Skeleton className="h-6" />
      </div>
      <div className="space-y-2">
        <div className="text-zinc-400 text-xs">Viento</div>
        <Skeleton className="h-6" />
      </div>
      <div className="space-y-2">
        <div className="text-zinc-400 text-xs">Nubosidad</div>
        <Skeleton className="h-6" />
      </div>
      <div className="space-y-2">
        <div className="text-zinc-400 text-xs">Precipitación</div>
        <Skeleton className="h-6" />
      </div>
      <div className="space-y-2">
        <div className="text-zinc-400 text-xs">Día / Noche</div>
        <Skeleton className="h-6" />
      </div>
    </div>
  );

  const Inner = (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
        </div>
        <button
          onClick={refresh}
          className="rounded-lg px-3 py-2 bg-white/10 hover:bg-white/15 text-white ring-1 ring-white/15 text-sm"
        >
          Refrescar
        </button>
      </div>

      {/* Estado vacío (sin coords aún) */}
      {status === "idle" && EmptyState}

      {/* Cargando */}
      {status === "loading" && LoadingSkeleton}

      {/* Error */}
      {status === "error" && (
        <p className="text-rose-300">Error al cargar el clima: {error}</p>
      )}

      {/* Éxito */}
      {status === "success" && current && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="col-span-2">
            <div className="text-zinc-400 text-sm">Condición</div>
            <div className="text-lg">{current.summary}</div>
          </div>
          <div>
            <div className="text-zinc-400 text-sm">Temp</div>
            <div className="text-2xl font-title">{current.tempC.toFixed(1)}°C</div>
          </div>
          <div>
            <div className="text-zinc-400 text-sm">Sensación</div>
            <div className="text-lg">{current.feelsLikeC?.toFixed(1) ?? "—"}°C</div>
          </div>
          <div>
            <div className="text-zinc-400 text-sm">Humedad</div>
            <div className="text-lg">{current.humidity ?? "—"}%</div>
          </div>
          <div>
            <div className="text-zinc-400 text-sm">Viento</div>
            <div className="text-lg">
              {current.windKmh?.toFixed(0) ?? "—"} km/h {typeof current.windDeg === "number" ? `(${current.windDeg}°)` : ""}
            </div>
          </div>
          <div>
            <div className="text-zinc-400 text-sm">Nubosidad</div>
            <div className="text-lg">{current.cloudCover ?? "—"}%</div>
          </div>
          <div>
            <div className="text-zinc-400 text-sm">Precipitación</div>
            <div className="text-lg">{current.precipMm ?? 0} mm</div>
          </div>
          <div>
            <div className="text-zinc-400 text-sm">Día / Noche</div>
            <div className="text-lg">{current.isDay ? "Día" : "Noche"}</div>
          </div>
        </div>
      )}
    </div>
  );

  if (bare) return Inner;
  return <div className="rounded-2xl p-4 bg-zinc-900/60 ring-1 ring-white/10">{Inner}</div>;
}
