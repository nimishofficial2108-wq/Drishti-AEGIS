import React, { useRef, useEffect } from 'react';
import { formatNum } from '../../engines/mathUtils';

interface HistogramChartProps {
  samples: number[];
  gateHurdle: number;
  q10?: number;
  q50?: number;
  q90?: number;
  width?: number;
  height?: number;
}

export const HistogramChart: React.FC<HistogramChartProps> = ({
  samples,
  gateHurdle,
  q10,
  q50,
  q90,
  height = 240
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !samples.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Support sharp display on high-DPI screens
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const minVal = Math.min(samples[0], gateHurdle - 10);
    const maxVal = Math.max(samples[samples.length - 1], gateHurdle + 10);
    const span = maxVal - minVal || 1;

    const numBins = 48;
    const bins = new Array(numBins).fill(0);
    for (const val of samples) {
      const idx = Math.min(numBins - 1, Math.max(0, Math.floor(((val - minVal) / span) * numBins)));
      bins[idx]++;
    }

    const maxBinCount = Math.max(...bins, 1);
    const x0 = 50;
    const y0 = h - 30;
    const plotW = w - 70;
    const plotH = h - 50;

    // Background grid
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = y0 - (i * plotH) / 4;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + plotW, y);
      ctx.stroke();

      const freq = Math.round((maxBinCount * i) / 4);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(freq), x0 - 8, y + 3);
    }

    // Draw Histogram Bars
    const barWidth = plotW / numBins;
    for (let i = 0; i < numBins; i++) {
      const binVal = minVal + (i + 0.5) * (span / numBins);
      const barH = (bins[i] / maxBinCount) * plotH;
      const x = x0 + i * barWidth;
      const y = y0 - barH;

      // Color code by threshold
      if (binVal >= gateHurdle) {
        ctx.fillStyle = '#2677CA';
      } else {
        ctx.fillStyle = '#E2E8F0';
      }

      ctx.fillRect(x + 1, y, Math.max(1, barWidth - 1.5), barH);
    }

    // Gate 2 Hurdle Line (Red)
    const hurdleX = x0 + ((gateHurdle - minVal) / span) * plotW;
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 2;
    ctx.moveTo(hurdleX, 10);
    ctx.lineTo(hurdleX, y0);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Gate 2 Hurdle: ₹${gateHurdle} Cr`, Math.min(w - 90, Math.max(x0 + 80, hurdleX)), 18);

    // Median (Q50) marker
    if (q50 !== undefined) {
      const q50X = x0 + ((q50 - minVal) / span) * plotW;
      ctx.beginPath();
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = '#0B376A';
      ctx.lineWidth = 1.5;
      ctx.moveTo(q50X, 25);
      ctx.lineTo(q50X, y0);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#0B376A';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(`P50 ₹${formatNum(q50, 1)}`, q50X, 35);
    }

    // X-Axis labels
    ctx.fillStyle = '#64748B';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 6; i++) {
      const val = minVal + (span * i) / 6;
      const x = x0 + (i * plotW) / 6;
      ctx.fillText(`₹${formatNum(val, 0)}`, x, h - 10);
    }
  }, [samples, gateHurdle, q10, q50, q90, height]);

  return (
    <div className="w-full relative">
      <canvas
        ref={canvasRef}
        className="w-full block bg-slate-50/50 rounded-lg border border-slate-200"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};
