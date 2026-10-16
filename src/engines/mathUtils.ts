/**
 * Mathematical & Statistical Utilities for DRISHTI AEGIS 4.0
 */

/** Seeded PRNG (Mulberry32) for reproducible Monte Carlo simulations */
export function createRNG(seed: number): () => number {
  let x = seed >>> 0;
  return () => {
    x += 0x6d2b79f5;
    let t = x;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Triangular distribution sampling */
export function sampleTriangular(a: number, m: number, b: number, rand: () => number): number {
  if (!(a <= m && m <= b)) {
    throw new Error(`Triangular distribution requires low (${a}) <= mode (${m}) <= high (${b})`);
  }
  if (a === b) return a;
  const u = rand();
  const f = (m - a) / (b - a);
  return u < f ? a + Math.sqrt(u * (b - a) * (m - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - m));
}

/** Standard Normal variate via Box-Muller transform */
export function sampleNormal(rand: () => number): number {
  const u1 = Math.max(1e-12, rand());
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** Standard Normal Cumulative Distribution Function (Abramowitz & Stegun 7.1.26 approximation) */
export function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp(-0.5 * x * x);
  const p = 1 - d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? p : 1 - p;
}

/** Clamp utility */
export function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v));
}

/** Number formatting helpers */
export function formatNum(v: number | null | undefined, digits = 1): string {
  if (v === null || v === undefined || !Number.isFinite(Number(v))) return '—';
  return Number(v).toLocaleString('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

export function formatCr(v: number | null | undefined, digits = 1): string {
  if (v === null || v === undefined || !Number.isFinite(Number(v))) return '—';
  return `₹${formatNum(v, digits)} Cr`;
}

export function formatPct(v: number | null | undefined, digits = 1): string {
  if (v === null || v === undefined || !Number.isFinite(Number(v))) return '—';
  return `${formatNum(v * 100, digits)}%`;
}

/**
 * Solve linear system A * x = b via Gaussian elimination with partial pivoting.
 * Returns null if singular or rank deficient.
 */
export function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  // Augmented matrix
  const M: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let j = 0; j < n; j++) {
    let pivot = j;
    for (let k = j + 1; k < n; k++) {
      if (Math.abs(M[k][j]) > Math.abs(M[pivot][j])) {
        pivot = k;
      }
    }

    if (Math.abs(M[pivot][j]) < 1e-11) {
      return null;
    }

    if (pivot !== j) {
      const temp = M[j];
      M[j] = M[pivot];
      M[pivot] = temp;
    }

    const t = M[j][j];
    for (let k = j; k <= n; k++) {
      M[j][k] /= t;
    }

    for (let i = 0; i < n; i++) {
      if (i !== j) {
        const factor = M[i][j];
        for (let k = j; k <= n; k++) {
          M[i][k] -= factor * M[j][k];
        }
      }
    }
  }

  return M.map(row => row[n]);
}
