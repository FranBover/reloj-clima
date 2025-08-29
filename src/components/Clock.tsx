import useClock from "../lib/useClock";

export default function Clock() {
  // Ajustá hour12 según preferencia; withSeconds true para ver el tick
  const { time, date, tz } = useClock({ hour12: false, withSeconds: true });

  return (
    <div className="space-y-1">
      <div className="font-title text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight">
        {time}
      </div>
      <div className="text-zinc-400">
        {date} — {tz}
      </div>
    </div>
  );
}