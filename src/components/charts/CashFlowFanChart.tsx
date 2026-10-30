import React, { useRef, useEffect, useState } from 'react';
import { CashFlowFanData } from '../../types/monteCarlo';
import { formatCr } from '../../engines/mathUtils';

interface CashFlowFanChartProps {
  data: CashFlowFanData;
  height?: number;
}

export const CashFlowFanChart: React.FC<CashFlowFanChartProps> = ({
  data,
  height = 280
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [viewFilter, setViewFilter] = useState<'all' | 'funded' | 'failed'>('all');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.months.length) return;
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

    const padL = 55;
    const padR = 25;
    const padT = 25;
    const padB = 30;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Determine Y range across trajectories and percentiles
    let minY = -150;
    let maxY = 350;

    data.p10.forEach((v, idx) => {
      minY = Math.min(minY, v, data.median[idx]);
      maxY = Math.max(maxY, data.p90[idx]);
    });

    const ySpan = maxY - minY || 1;

    const getX = (m: number) => padL + (m / 60) * plotW;
    const getY = (val: number) => padT + plotH - ((val - minY) / ySpan) * plotH;

    // Draw horizontal grid lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    const ySteps = [-150, -100, -50, 0, 50, 100, 150, 200, 250, 300];
    ctx.fillStyle = '#6D7D93';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';

    ySteps.forEach(yVal => {
      if (yVal >= minY && yVal <= maxY) {
        const yPx = getY(yVal);
        ctx.beginPath();
        ctx.moveTo(padL, yPx);
        ctx.lineTo(padL + plotW, yPx);
        ctx.stroke();

        ctx.fillText(`₹${yVal}Cr`, padL - 8, yPx + 3);
      }
    });

    // Zero Break-Even line (prominent)
    const yZero = getY(0);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, yZero);
    ctx.lineTo(padL + plotW, yZero);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'left';
    ctx.fillText('Break-Even (₹0)', padL + 6, yZero - 5);

    // Month 30 Payback Hurdle (Vertical Gold line)
    const xM30 = getX(30);
    ctx.strokeStyle = '#F0C11E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xM30, padT);
    ctx.lineTo(xM30, padT + plotH);
    ctx.stroke();
    ctx.fillStyle = '#B45309';
    ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('M30 Hurdle', xM30, padT - 8);

    // Draw P10–P90 Confidence Band (Soft Blue)
    ctx.fillStyle = 'rgba(20, 101, 199, 0.12)';
    ctx.beginPath();
    data.months.forEach((m, idx) => {
      const x = getX(m);
      const y = getY(data.p90[idx]);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    for (let idx = data.months.length - 1; idx >= 0; idx--) {
      const m = data.months[idx];
      const x = getX(m);
      const y = getY(data.p10[idx]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Draw P25–P75 Inner Band
    ctx.fillStyle = 'rgba(20, 101, 199, 0.18)';
    ctx.beginPath();
    data.months.forEach((m, idx) => {
      const x = getX(m);
      const y = getY(data.p75[idx]);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    for (let idx = data.months.length - 1; idx >= 0; idx--) {
      const m = data.months[idx];
      const x = getX(m);
      const y = getY(data.p25[idx]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Draw Faint Individual Trajectories
    ctx.strokeStyle = 'rgba(109, 125, 147, 0.18)';
    ctx.lineWidth = 1;
    data.sampleTrajectories.forEach(traj => {
      ctx.beginPath();
      traj.forEach((val, m) => {
        const x = getX(m);
        const y = getY(val);
        if (m === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    // Draw P10 and P90 Boundary Lines
    ctx.strokeStyle = '#93C5FD';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    data.months.forEach((m, idx) => {
      const x = getX(m);
      const y = getY(data.p90[idx]);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.beginPath();
    data.months.forEach((m, idx) => {
      const x = getX(m);
      const y = getY(data.p10[idx]);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Median Trajectory Line (Bold Navy)
    ctx.strokeStyle = '#083E84';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.months.forEach((m, idx) => {
      const x = getX(m);
      const y = getY(data.median[idx]);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Capital Tranche Funding markers
    const tranches = [
      { m: 0, label: 'T1: -₹34Cr', val: -34 },
      { m: 10, label: 'T2: -₹58Cr', val: -92 },
      { m: 22, label: 'T3: -₹58Cr', val: -150 }
    ];

    tranches.forEach(t => {
      const x = getX(t.m);
      ctx.fillStyle = '#C9474F';
      ctx.beginPath();
      ctx.arc(x, getY(t.val), 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // X Axis Month Labels
    ctx.fillStyle = '#6D7D93';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60].forEach(m => {
      const x = getX(m);
      ctx.fillText(`M${m}`, x, padT + plotH + 18);
    });

    // Hover vertical indicator line
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex <= 60) {
      const hX = getX(hoverIndex);
      ctx.strokeStyle = '#1465C7';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(hX, padT);
      ctx.lineTo(hX, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      const yMed = getY(data.median[hoverIndex]);
      ctx.fillStyle = '#F0C11E';
      ctx.beginPath();
      ctx.arc(hX, yMed, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#083E84';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [data, height, hoverIndex, viewFilter]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padL = 55;
    const padR = 25;
    const plotW = rect.width - padL - padR;

    if (x < padL || x > rect.width - padR) {
      setHoverIndex(null);
      return;
    }

    const month = Math.round(((x - padL) / plotW) * 60);
    setHoverIndex(Math.max(0, Math.min(60, month)));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#083E84]" />
            <span className="font-semibold text-slate-800">Median Cash Flow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#93C5FD]" />
            <span className="text-slate-600">P10–P90 Confidence Band</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#F0C11E]" />
            <span className="text-amber-700 font-bold">Month 30 Hurdle</span>
          </div>
        </div>

        {hoverIndex !== null && (
          <div className="font-mono text-xs bg-slate-900 text-white px-2.5 py-1 rounded shadow-md flex items-center gap-2">
            <span className="text-[#F0C11E] font-bold">Month {hoverIndex}:</span>
            <span>Median {formatCr(data.median[hoverIndex], 1)}</span>
            <span className="text-slate-400">({formatCr(data.p10[hoverIndex], 1)} to {formatCr(data.p90[hoverIndex], 1)})</span>
          </div>
        )}
      </div>

      <div className="relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          className="w-full block cursor-crosshair"
          style={{ height: `${height}px` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Cumulative Pre-Tax Cash Inflow vs ₹150 Cr Phased Outflow</span>
        <span>60-Month Analytical Horizon</span>
      </div>
    </div>
  );
};
