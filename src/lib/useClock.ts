import { useEffect, useMemo, useRef, useState } from "react";

export type UseClockOptions = {
    locale?: string;

    timeZone?: string;

    hour12?: boolean;

    withSeconds?: boolean;

};

export default function useClock(opts: UseClockOptions = {}){
        const {
        locale = typeof navigator !== "undefined" ? navigator.language : "en-US",
        timeZone,
        hour12 = false,
        withSeconds = true,
    } = opts;

    const [now, setNow] = useState<Date>(() => new Date());
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
    const tick = () => setNow(new Date());

    // Alinea el primer tick al inicio del próximo segundo exacto
    const msToNextSecond = 1000 - (Date.now() % 1000);
    const timeout = window.setTimeout(() => {
      tick();
      intervalRef.current = window.setInterval(tick, 1000) as unknown as number;
    }, msToNextSecond);

    return () => {
      window.clearTimeout(timeout);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: withSeconds ? "2-digit" : undefined,
        hour12,
        timeZone,
      }),
    [locale, hour12, withSeconds, timeZone]
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        timeZone,
      }),
    [locale, timeZone]
  );

  const time = timeFormatter.format(now);
  const date = dateFormatter.format(now);

  const tz = useMemo(() => {
    try {
      return new Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  return { now, time, date, tz };


}