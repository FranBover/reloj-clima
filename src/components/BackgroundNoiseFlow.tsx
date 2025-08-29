import { useEffect, useRef } from "react";
import { curl2 } from "../lib/noise";

type Props = { className?: string };

/**
 * Noise Flow "Smoky"
 * - Trazos blancos muy suaves, con blur y fade hacia el fondo.
 * - Inspirado en streamlines/curl-noise con estelas largas.
 */
export default function BackgroundNoiseFlow({ className }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let raf = 0;
    let running = true;

    // ===== Parámetros ajustables =====
    const FPS_CAP = 45;
    const MOTION_SCALE = 0.35;   // velocidad global (0.2 a 0.6)
    const NOISE_SCALE = 0.0012;  // escala espacial del campo (más chico = remolinos más grandes)
    const FLOW_SPEED = 52;       // px/seg base
    const SUBSTEPS = 3;          // sub-integraciones por frame (curvas más suaves)
    const SMOKE_ALPHA = 0.045;   // opacidad del trazo (0.03–0.07)
    const LINE_WIDTH = 1.1;      // grosor del trazo
    const BLUR_PX = 0.7;         // blur del trazo (≈ humo)
    const FADE_ALPHA = 0.055;    // cuánto “se lava” hacia el fondo cada frame (0.04–0.10)
    // =================================

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    // Resize + DPR
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
    let resizeRAF = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRAF);
      resizeRAF = requestAnimationFrame(resize);
      // reseed al cambiar tamaño
      makeParticles();
      paintBackground(1);
    };
    window.addEventListener("resize", onResize);

    // Lee variables CSS del mood (usamos el gradiente de fondo; los trazos son blancos)
    const getVar = (name: string, fallback: string) => {
      const c = getComputedStyle(canvas).getPropertyValue(name).trim();
      return c || fallback;
    };

    // Partículas
    type Particle = { x: number; y: number; px: number; py: number; speed: number; life: number };
    let particles: Particle[] = [];
    const makeParticles = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const area = w * h;
      // densidad ajustada: subí el divisor para menos partículas
      const target = Math.round(Math.min(1600, Math.max(250, area / 12000)));
      particles = new Array(target).fill(0).map(() => {
        const x = Math.random() * w, y = Math.random() * h;
        return {
          x, y, px: x, py: y,
          speed: FLOW_SPEED * (0.7 + Math.random() * 0.6),
          life: 200 + Math.random() * 250,
        };
      });
    };
    makeParticles();

    // Fondo: gradiente oscuro del mood
    const paintBackground = (alpha = 1) => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const bg1 = getVar("--bg1", "#0b1220");
      const bg2 = getVar("--bg2", "#0f1628");
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, bg1);
      g.addColorStop(1, bg2);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = alpha;
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    };

    // Pintado inicial
    paintBackground(1);

    // Redibujar el fondo al cambiar la paleta
    const paletteObserver = new MutationObserver(() => {
      paintBackground(1);
    });
    paletteObserver.observe(document.documentElement, {
      attributes: true, attributeFilter: ["style"], subtree: true,
    });

    // Bucle
    const FRAME_MIN = 1000 / FPS_CAP;
    let last = performance.now();
    let lastDraw = last;
    let tSec = 0;

    const draw = (ts: number) => {
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      if (!prefersReduced) tSec += dt * MOTION_SCALE;

      if (ts - lastDraw < FRAME_MIN) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastDraw = ts;

      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      // Lavado hacia el fondo (no borra del todo, deja estelas)
      ctx.save();
      paintBackground(FADE_ALPHA);
      ctx.restore();

      if (!prefersReduced) {
        ctx.save();
        ctx.globalCompositeOperation = "screen"; // humo sobre fondo
        ctx.strokeStyle = `rgba(255,255,255,${SMOKE_ALPHA})`;
        ctx.lineWidth = LINE_WIDTH;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.filter = `blur(${BLUR_PX}px)`;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          let x = p.x, y = p.y;
          const step = (p.speed * dt) / SUBSTEPS;

          for (let s = 0; s < SUBSTEPS; s++) {
            // Campo de flujo (curl noise) desplazado en tiempo
            const nx = x * NOISE_SCALE + tSec * 0.10;
            const ny = y * NOISE_SCALE - tSec * 0.07;
            const v = curl2(nx, ny); // unit vector

            const nxp = x + v.x * step;
            const nyp = y + v.y * step;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nxp, nyp);
            ctx.stroke();

            x = nxp; y = nyp;
          }

          p.px = p.x; p.py = p.y;
          p.x = x; p.y = y;

          // wrap edges
          if (p.x < -2) p.x = w + 2; if (p.x > w + 2) p.x = -2;
          if (p.y < -2) p.y = h + 2; if (p.y > h + 2) p.y = -2;

          // reseed simple
          if ((p.life -= dt) <= 0) {
            p.x = Math.random() * w; p.y = Math.random() * h;
            p.px = p.x; p.py = p.y;
            p.life = 200 + Math.random() * 250;
            p.speed = FLOW_SPEED * (0.7 + Math.random() * 0.6);
          }
        }

        ctx.filter = "none";
        ctx.restore();
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
      paletteObserver.disconnect();
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
