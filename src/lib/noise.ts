// src/lib/noise.ts
// Perlin 2D + fBm + Curl helpers — sin dependencias.

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

const P = new Uint8Array(512);
(function seed() {
  // Permutación simple (Fisher–Yates con seed rápido).
  const base = new Uint8Array(256);
  for (let i = 0; i < 256; i++) base[i] = i;
  let r = 1337;
  const rand = () => (r = (r * 1103515245 + 12345) >>> 0) / 2 ** 32;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = base[i]; base[i] = base[j]; base[j] = tmp;
  }
  for (let i = 0; i < 512; i++) P[i] = base[i & 255];
})();

function grad(hash: number, x: number, y: number) {
  // 8 gradientes
  switch (hash & 7) {
    case 0: return  x + y;
    case 1: return  x - y;
    case 2: return -x + y;
    case 3: return -x - y;
    case 4: return  x;
    case 5: return -x;
    case 6: return  y;
    default: return -y;
  }
}

/** Perlin 2D en [-1, 1] */
export function perlin2(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const aa = P[X + P[Y]];
  const ab = P[X + P[Y + 1]];
  const ba = P[X + 1 + P[Y]];
  const bb = P[X + 1 + P[Y + 1]];

  const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
  const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
  return lerp(x1, x2, v); // [-1,1]
}

/** fBm (fractal Brownian motion) — 4 octavas */
export function fbm2(x: number, y: number): number {
  let f = 0, amp = 0.5, freq = 1.0;
  for (let i = 0; i < 4; i++) {
    f += amp * perlin2(x * freq, y * freq);
    freq *= 2.0; amp *= 0.5;
  }
  return f; // aprox [-1,1]
}

/** Curl noise 2D del campo escalar (aprox. derivadas finitas) */
export function curl2(x: number, y: number, eps = 0.0007) {
  const n1 = fbm2(x, y + eps);
  const n2 = fbm2(x, y - eps);
  const n3 = fbm2(x + eps, y);
  const n4 = fbm2(x - eps, y);
  // rot90(grad) => (d/dy, -d/dx)
  let vx = (n1 - n2) / (2 * eps);
  let vy = -(n3 - n4) / (2 * eps);
  // normalizamos
  const len = Math.hypot(vx, vy) || 1;
  vx /= len; vy /= len;
  return { x: vx, y: vy };
}
