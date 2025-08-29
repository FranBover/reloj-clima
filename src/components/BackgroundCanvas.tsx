import { useEffect, useRef } from "react";

type Props = { className?: string };

export default function BackgroundCanvas({ className }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let raf = 0;
    let running = true;

    const MOTION_SCALE = 0.35; // <— ajustable
    const FPS_CAP = 45;        // <— limitá a 30–60 según gusto
    const FRAME_MIN = 1000 / FPS_CAP;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // resize “suave” (1 rAF por lote)
    let resizeRAF = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRAF);
      resizeRAF = requestAnimationFrame(resize);
    };
    window.addEventListener("resize", onResize);

    const getVar = (name: string, fallback: string) => {
      const c = getComputedStyle(canvas).getPropertyValue(name).trim();
      return c || fallback;
    };

    const blobs = [
      { r: 220, speed: 0.12, phase: 0.0 },
      { r: 260, speed: 0.09, phase: 1.3 },
      { r: 180, speed: 0.15, phase: 2.1 },
    ];

    let timeSec = 0;
    let last = performance.now();
    let lastDraw = last;

    const draw = (ts: number) => {
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;

      if (!prefersReduced) {
        timeSec += dt * MOTION_SCALE;
      }

      // cap de FPS
      if (ts - lastDraw < FRAME_MIN) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastDraw = ts;

      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      const bg1 = getVar("--bg1", "#0ea5e9");
      const bg2 = getVar("--bg2", "#22d3ee");
      const accent = getVar("--accent", "#fde047");

      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, bg1);
      g.addColorStop(1, bg2);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      if (!prefersReduced) {
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < blobs.length; i++) {
          const b = blobs[i];
          const x = w * (0.5 + 0.35 * Math.sin(b.phase + timeSec * b.speed));
          const y = h * (0.5 + 0.35 * Math.cos(b.phase + timeSec * b.speed * 1.2));
          const r = b.r;

          const rg = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
          rg.addColorStop(0.0, accent + "CC");
          rg.addColorStop(1.0, accent + "00");
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      }

      if (!running) return;
      raf = requestAnimationFrame(draw);
    };

    const onVis = () => {
      running = !document.hidden;
      if (running) {
        last = lastDraw = performance.now();
        raf = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(raf);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={["fixed inset-0 -z-10 pointer-events-none select-none", className].filter(Boolean).join(" ")}
    />
  );
}
