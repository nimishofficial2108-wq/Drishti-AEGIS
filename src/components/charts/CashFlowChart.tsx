import React, { useRef, useEffect } from 'react';
import { formatNum, formatCr } from '../../engines/mathUtils';

interface CashFlowChartProps {
  cashFlows: number[];
  cumulative: number[];
  paybackMonth: number | null;
  height?: number;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  cumulative,
  paybackMonth,
  height = 240
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cumulative.length) return;
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

    const minVal = Math.min(0, ...cumulative);
    const maxVal = Math.max(0, ...cumulative);
    const span = maxVal - minVal || 1;

    const x0 = 55;
    const y0 = h - 30;
    const plotW = w - 75;
    const plotH = h - 48;

    const xx = (month: number) => x0 + (month / 60) * plotW;
    const yy = (val: number) => y0 - ((val - minVal) / span) * plotH;

    // Draw Zero Line
    const zeroY = yy(0);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0, zeroY);
    ctx.lineTo(x0 + plotW, zeroY);
    ctx.stroke();

    // Horizontal Grid Lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748B';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i++) {
      const val = minVal + (span * i) / 4;
      const y = yy(val);
      if (Math.abs(y - zeroY) > 5) {
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x0 + plotW, y);
        ctx.stroke();
      }
      ctx.fillText(formatNum(val, 0), x0 - 8, y + 3);
    }

    // Milestone Vertical Lines: M9 (Gate 1), M22 (Gate 2), M30 (Max Hurdle)
    const milestones = [
      { m: 9, label: 'G1 (M9)', color: '#F3BC22' },
      { m: 22, label: 'G2 (M22)', color: '#F3BC22' },
      { m: 30, label: 'Target Payback (M30)', color: '#DC2626' }
    ];

    for (const ms of milestones) {
      const x = xx(ms.m);
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = ms.color;
      ctx.lineWidth = 1.5;
      ctx.moveTo(x, 15);
      ctx.lineTo(x, y0);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = ms.color;
      ctx.font = '9px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ms.label, x, 12);
    }

    // Actual Payback Marker
    if (paybackMonth !== null && paybackMonth <= 60) {
      const pbX = xx(paybackMonth);
      ctx.beginPath();
      ctx.arc(pbX, zeroY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#16A34A';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#16A34A';
      ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
      ctx.fillText(`Breakeven M${paybackMonth}`, pbX, zeroY - 10);
    }

    // Cumulative Curve Fill
    const gradient = ctx.createLinearGradient(0, yy(maxVal), 0, zeroY);
    gradient.addColorStop(0, 'rgba(38, 119, 202, 0.25)');
    gradient.addColorStop(1, 'rgba(38, 119, 202, 0.02)');

    ctx.beginPath();
    ctx.moveTo(xx(0), zeroY);
    for (let m = 0; m <= 60; m++) {
      ctx.lineTo(xx(m), yy(cumulative[m]));
    }
    ctx.lineTo(xx(60), zeroY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Cumulative Curve Line
    ctx.beginPath();
    ctx.strokeStyle = '#0B376A';
    ctx.lineWidth = 2.5;
    for (let m = 0; m <= 60; m++) {
      if (m === 0) ctx.moveTo(xx(m), yy(cumulative[m]));
      else ctx.lineTo(xx(m), yy(cumulative[m]));
    }
    ctx.stroke();

    // X-Axis Month Markers
    ctx.fillStyle = '#64748B';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (let m = 0; m <= 60; m += 12) {
      ctx.fillText(`M${m}`, xx(m), h - 10);
    }
  }, [cumulative, paybackMonth, height]);

  const finalValue = cumulative[cumulative.length - 1];

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1 px-1">
        <span>Cumulative Cash Position (₹ Cr)</span>
        <span className="font-bold text-[#0B376A] font-mono">
          M60 Value: {formatCr(finalValue, 1)}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full block bg-slate-50/50 rounded-lg border border-slate-200"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};
