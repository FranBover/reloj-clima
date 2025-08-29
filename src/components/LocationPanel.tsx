import useGeolocation from "../lib/useGeoLocation";

function toFixed(n: number | undefined, d = 5) {
  return typeof n === "number" ? n.toFixed(d) : "-";
}

export default function LocationPanel({ bare = false }: { bare?: boolean }) {
  // sin persistencia ni manuales
  const { status, error, source, position, request } = useGeolocation({
    getOnMount: false,
    persist: false,
    startWithSaved: false,
  });

  const Inner = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-400">
          Estado: <span className="font-semibold text-zinc-200">{status}</span> · Fuente:{" "}
          <span className="font-semibold text-zinc-200">{source}</span>
        </p>
        <button
          onClick={() => request()}
          className="rounded-lg px-3 py-2 bg-white/10 hover:bg-white/15 text-white ring-1 ring-white/15 text-sm"
        >
          Usar mi ubicación (GPS)
        </button>
      </div>

      <div className="rounded-xl bg-black/20 p-3 ring-1 ring-white/10">
        <div className="text-xs text-zinc-400">Coordenadas actuales</div>
        <div className="text-base">
          lat <span className="font-mono">{toFixed(position?.latitude)}</span> · lon{" "}
          <span className="font-mono">{toFixed(position?.longitude)}</span>{" "}
          {position?.accuracy ? (
            <span className="text-zinc-400 text-sm"> (±{Math.round(position.accuracy)} m)</span>
          ) : null}
          {position?.label ? <span className="text-zinc-400"> — {position.label}</span> : null}
        </div>
      </div>

      {error && <p className="text-sm text-rose-300">Error: {error}</p>}
    </div>
  );

  if (bare) return Inner;
  return <div className="rounded-2xl p-4 bg-zinc-900/60 ring-1 ring-white/10">{Inner}</div>;
}
