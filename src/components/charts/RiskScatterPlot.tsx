import React, { useRef, useEffect, useState } from 'react';
import { ScenarioSamplePoint } from '../../types/monteCarlo';
import { formatCr, formatNum } from '../../engines/mathUtils';

interface RiskScatterPlotProps {
  points: ScenarioSamplePoint[];
  height?: number;
}

export const RiskScatterPlot: React.FC<RiskScatterPlotProps> = ({ points, height = 300 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [xMode, setXMode] = useState<'days' | 'wc'>('days');
  const [yMode, setYMode] = useState<'ebitda' | 'npv'>('ebitda');
  const [hoveredPoint, setHoveredPoint] = useState<ScenarioSamplePoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<ScenarioSamplePoint | null>(null);

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

    const padL = 50;
    const padR = 20;
    const padT = 20;
    const padB = 35;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const getXVal = (p: ScenarioSamplePoint) => (xMode === 'days' ? p.inventoryDays22 : p.networkWcRelease);
    const getYVal = (p: ScenarioSamplePoint) => (yMode === 'ebitda' ? p.ebitdaUplift : p.npv5Y);

    const xVals = points.map(getXVal);
    const yVals = points.map(getYVal);

    const minX = Math.min(...xVals, 0);
    const maxX = Math.max(...xVals, xMode === 'days' ? 16 : 400);
    const minY = Math.min(...yVals, yMode === 'ebitda' ? 0 : -100);
    const maxY = Math.max(...yVals, yMode === 'ebitda' ? 160 : 350);

    const xSpan = maxX - minX || 1;
    const ySpan = maxY - minY || 1;

    const getX = (val: number) => padL + ((val - minX) / xSpan) * plotW;
    const getY = (val: number) => padT + plotH - ((val - minY) / ySpan) * plotH;

    // Grid
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const yVal = minY + (i / 4) * ySpan;
      const y = getY(yVal);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();

      ctx.fillStyle = '#6D7D93';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(yVal).toString(), padL - 6, y + 3);
    }

    // Hurdle Reference Lines
    if (yMode === 'ebitda') {
      const yHurdle = getY(70);
      ctx.strokeStyle = '#F0C11E';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, yHurdle);
      ctx.lineTo(padL + plotW, yHurdle);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#B45309';
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('₹70 Cr Gate 2 Hurdle', padL + 6, yHurdle - 4);
    }

    if (xMode === 'days') {
      const xHurdle = getX(8);
      ctx.strokeStyle = '#F0C11E';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(xHurdle, padT);
      ctx.lineTo(xHurdle, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#B45309';
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('8 Days Hurdle', xHurdle, padT + 12);
    }

    // Draw Scatter Points
    points.forEach(p => {
      const x = getX(getXVal(p));
      const y = getY(getYVal(p));

      let color = '#6D7D93';
      if (p.status === 'passed') color = '#1465C7';
      else if (p.status === 'remediated') color = '#F0C11E';
      else if (p.status === 'stopped_g1') color = '#C9474F';
      else if (p.status === 'stopped_g2') color = '#6D7D93';

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();

      // Highlight selected/hovered
      if (hoveredPoint?.id === p.id || selectedPoint?.id === p.id) {
        ctx.strokeStyle = '#083E84';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    // X Axis Labels
    ctx.fillStyle = '#6D7D93';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      const xVal = minX + (i / 5) * xSpan;
      const x = getX(xVal);
      ctx.fillText(Math.round(xVal).toString(), x, padT + plotH + 16);
    }
  }, [points, height, xMode, yMode, hoveredPoint, selectedPoint]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !points.length) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const padL = 50;
    const padR = 20;
    const padT = 20;
    const padB = 35;
    const plotW = rect.width - padL - padR;
    const plotH = height - padT - padB;

    const getXVal = (p: ScenarioSamplePoint) => (xMode === 'days' ? p.inventoryDays22 : p.networkWcRelease);
    const getYVal = (p: ScenarioSamplePoint) => (yMode === 'ebitda' ? p.ebitdaUplift : p.npv5Y);

    const xVals = points.map(getXVal);
    const yVals = points.map(getYVal);
    const minX = Math.min(...xVals, 0);
    const maxX = Math.max(...xVals, xMode === 'days' ? 16 : 400);
    const minY = Math.min(...yVals, yMode === 'ebitda' ? 0 : -100);
    const maxY = Math.max(...yVals, yMode === 'ebitda' ? 160 : 350);

    const xSpan = maxX - minX || 1;
    const ySpan = maxY - minY || 1;

    let closest: ScenarioSamplePoint | null = null;
    let minDist = 18;

    points.forEach(p => {
      const px = padL + ((getXVal(p) - minX) / xSpan) * plotW;
      const py = padT + plotH - ((getYVal(p) - minY) / ySpan) * plotH;
      const dist = Math.hypot(mx - px, my - py);
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    });

    setHoveredPoint(closest);
  };

  return (
    <div className="space-y-3">
      {/* Controls & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold">X-Axis:</span>
          <button
            onClick={() => setXMode('days')}
            className={`px-2.5 py-1 rounded cursor-pointer ${xMode === 'days' ? 'bg-[#083E84] text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
          >
            Inventory Days
          </button>
          <button
            onClick={() => setXMode('wc')}
            className={`px-2.5 py-1 rounded cursor-pointer ${xMode === 'wc' ? 'bg-[#083E84] text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
          >
            Network WC (₹Cr)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold">Y-Axis:</span>
          <button
            onClick={() => setYMode('ebitda')}
            className={`px-2.5 py-1 rounded cursor-pointer ${yMode === 'ebitda' ? 'bg-[#083E84] text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
          >
            Annualized EBITDA
          </button>
          <button
            onClick={() => setYMode('npv')}
            className={`px-2.5 py-1 rounded cursor-pointer ${yMode === 'npv' ? 'bg-[#083E84] text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
          >
            5-Year NPV
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1465C7]" /> Passed
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F0C11E]" /> Remediated
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6D7D93]" /> Gate 2 Miss
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9474F]" /> Gate 1 Miss
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
          onClick={() => setSelectedPoint(hoveredPoint)}
          className="w-full block cursor-pointer"
          style={{ height: `${height}px` }}
        />

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-slate-900/90 text-white p-2.5 rounded-lg text-xs font-mono shadow-lg pointer-events-none space-y-1">
            <div className="text-[#F0C11E] font-bold">Scenario #{hoveredPoint.id}</div>
            <div>EBITDA: ₹{hoveredPoint.ebitdaUplift} Cr</div>
            <div>Inventory Reduced: {hoveredPoint.inventoryDays22.toFixed(1)} days</div>
            <div>5Y NPV: ₹{hoveredPoint.npv5Y} Cr</div>
            <div>Payback: {hoveredPoint.paybackMonth ? `Month ${hoveredPoint.paybackMonth}` : 'None'}</div>
            <div className="text-[10px] text-slate-400">Click point to view scenario ledger</div>
          </div>
        )}
      </div>

      {/* Selected Point Detail Drawer */}
      {selectedPoint && (
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="font-bold text-[#083E84]">Inspecting Scenario #{selectedPoint.id} ({selectedPoint.status.toUpperCase()})</div>
            <div className="text-slate-600">
              Fill Uplift: +{selectedPoint.fillUplift22.toFixed(1)}pp · Inventory Days: -{selectedPoint.inventoryDays22.toFixed(1)}d · Network WC: ₹{selectedPoint.networkWcRelease}Cr
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <div>EBITDA: <strong className="text-[#083E84]">₹{selectedPoint.ebitdaUplift}Cr</strong></div>
            <div>NPV: <strong className="text-emerald-700">₹{selectedPoint.npv5Y}Cr</strong></div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="text-slate-400 hover:text-slate-700 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
