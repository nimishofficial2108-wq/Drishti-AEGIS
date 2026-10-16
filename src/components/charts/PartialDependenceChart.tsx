import React, { useRef, useEffect } from 'react';
import { formatNum, formatCr } from '../../engines/mathUtils';

interface PartialDependenceChartProps {
  points: { x: number; y: number }[];
  currentX: number;
  currentY: number | null;
  height?: number;
}

export const PartialDependenceChart: React.FC<PartialDependenceChartProps> = ({
  points,
  currentX,
  currentY,
  height = 220
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !points.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const minX = 0;
    const maxX = 12;
    const minY = Math.min(...points.map(p => p.y), 0);
    const maxY = Math.max(...points.map(p => p.y), 80);
    const spanY = maxY - minY || 1;

    const x0 = 50;
    const y0 = h - 30;
    const plotW = w - 70;
    const plotH = h - 45;

    const xx = (x: number) => x0 + ((x - minX) / (maxX - minX)) * plotW;
    const yy = (y: number) => y0 - ((y - minY) / spanY) * plotH;

    // Grid lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748B';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i++) {
      const val = minY + (spanY * i) / 4;
      const y = yy(val);
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + plotW, y);
      ctx.stroke();
      ctx.fillText(formatNum(val, 0), x0 - 8, y + 3);
    }

    // Curve
    ctx.beginPath();
    ctx.strokeStyle = '#0B376A';
    ctx.lineWidth = 2.5;
    points.forEach((p, idx) => {
      const px = xx(p.x);
      const py = yy(p.y);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Active Scenario Marker
    if (currentY !== null) {
      const curXPos = xx(currentX);
      const curYPos = yy(currentY);

      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#F3BC22';
      ctx.lineWidth = 1.5;
      ctx.moveTo(curXPos, 15);
      ctx.lineTo(curXPos, y0);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(curXPos, curYPos, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#F3BC22';
      ctx.fill();
      ctx.strokeStyle = '#082E5F';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#082E5F';
      ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`+${currentX} pp · ${formatCr(currentY, 1)}`, Math.min(w - 70, Math.max(x0 + 60, curXPos)), Math.max(20, curYPos - 12));
    }

    // X-Axis
    ctx.fillStyle = '#64748B';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (let x = 0; x <= 12; x += 2) {
      ctx.fillText(`+${x} pp`, xx(x), h - 10);
    }
  }, [points, currentX, currentY, height]);

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
