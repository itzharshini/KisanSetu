import React, { useState } from 'react';
import { TrendingUp, Scale, Warehouse, Clock, Info } from 'lucide-react';
import { ProcessingStation } from '../../types';

export interface OperationsChartsProps {
  stations: ProcessingStation[];
  storageUsedKg: number;
  storageCapacityKg: number;
  currentQueueLength: number;
}

export const OperationsCharts: React.FC<OperationsChartsProps> = ({
  stations,
  storageUsedKg,
  storageCapacityKg,
  currentQueueLength
}) => {
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{
    time: string;
    processed: number;
    queue: number;
  } | null>(null);

  // Safely guard currentQueueLength against undefined or NaN
  const safeQueueLength =
    typeof currentQueueLength === 'number' && Number.isFinite(currentQueueLength)
      ? Math.max(0, currentQueueLength)
      : 14;

  // Hourly throughput data
  const throughputData = [
    { time: '08:00', processed: 6, queue: 8 },
    { time: '09:00', processed: 11, queue: 14 },
    { time: '10:00', processed: 14, queue: 18 },
    { time: '11:00', processed: 16, queue: safeQueueLength },
    { time: '12:00', processed: 12, queue: Math.max(4, safeQueueLength - 5) }
  ];

  const maxVal = Math.max(
    24,
    ...throughputData.map((d) => Math.max(d.processed, d.queue))
  );

  const chartHeight = 130;
  const chartWidth = 460;
  const paddingX = 40;
  const paddingY = 20;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  // Safe SVG coordinate calculation functions guaranteed to return finite numbers
  const getX = (index: number): number => {
    const divisor = throughputData.length > 1 ? throughputData.length - 1 : 1;
    const x = paddingX + (index / divisor) * usableWidth;
    return Number.isFinite(x) ? Number(x.toFixed(1)) : paddingX;
  };

  const getY = (val: number | undefined | null): number => {
    const num = typeof val === 'number' && Number.isFinite(val) ? Math.max(0, val) : 0;
    const safeMax = maxVal > 0 ? maxVal : 24;
    const y = paddingY + usableHeight - (num / safeMax) * usableHeight;
    return Number.isFinite(y) ? Number(y.toFixed(1)) : paddingY + usableHeight;
  };

  const queuePoints = throughputData
    .map((d, i) => `${getX(i)},${getY(d.queue)}`)
    .join(' ');

  const queueAreaPoints = `${getX(0)},${chartHeight - paddingY} ${queuePoints} ${getX(
    throughputData.length - 1
  )},${chartHeight - paddingY}`;

  const processedPoints = throughputData
    .map((d, i) => `${getX(i)},${getY(d.processed)}`)
    .join(' ');

  const processedAreaPoints = `${getX(0)},${chartHeight - paddingY} ${processedPoints} ${getX(
    throughputData.length - 1
  )},${chartHeight - paddingY}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
      {/* Chart 1: Hourly Inbound Queue vs Processed Throughput (Pure SVG) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <h4 className="font-display font-bold text-slate-900 text-xs">
              Hourly Intake Throughput & Queue Trend
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Simulated Shift</span>
        </div>

        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-40 select-none overflow-visible"
          >
            {/* Grid lines */}
            {[0, 8, 16, 24].map((gridVal) => {
              const y = getY(gridVal);
              return (
                <g key={gridVal}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingX - 6}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="#94A3B8"
                    fontFamily="monospace"
                  >
                    {gridVal}
                  </text>
                </g>
              );
            })}

            {/* Queue Area (Amber) */}
            <polygon points={queueAreaPoints} fill="#FEF3C7" fillOpacity="0.6" />
            <polyline
              points={queuePoints}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Processed Area (Emerald) */}
            <polygon points={processedAreaPoints} fill="#D1FAE5" fillOpacity="0.6" />
            <polyline
              points={processedPoints}
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Dots & Interactive Hover */}
            {throughputData.map((d, i) => {
              const cx = getX(i);
              const cyProc = getY(d.processed);
              const cyQueue = getY(d.queue);

              return (
                <g
                  key={d.time}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredDataPoint(d)}
                  onMouseLeave={() => setHoveredDataPoint(null)}
                >
                  {/* Invisible hit rect */}
                  <rect
                    x={cx - 15}
                    y={paddingY}
                    width={30}
                    height={usableHeight}
                    fill="transparent"
                  />

                  {/* Time label */}
                  <text
                    x={cx}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#64748B"
                    fontFamily="sans-serif"
                    fontWeight="600"
                  >
                    {d.time}
                  </text>

                  {/* Dots with strictly validated finite values */}
                  <circle
                    cx={cx}
                    cy={cyQueue}
                    r="3.5"
                    fill="#F59E0B"
                    stroke="#FFF"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={cx}
                    cy={cyProc}
                    r="3.5"
                    fill="#059669"
                    stroke="#FFF"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dynamic Tooltip / Legend */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-700">Procured / Hr</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-700">Waiting in Queue</span>
            </div>
          </div>

          {hoveredDataPoint && (
            <div className="font-mono text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded">
              {hoveredDataPoint.time} → Queue: {hoveredDataPoint.queue} | Cleared: {hoveredDataPoint.processed}
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Weighbridge Station Operating Utilization (% Bars) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-700" />
            <h4 className="font-display font-bold text-slate-900 text-xs">
              Weighbridge Station Utilization & Duty Cycle
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Live Telemetry</span>
        </div>

        <div className="space-y-2.5 pt-1">
          {stations.map((s) => {
            const isActive = s.status === 'active';
            const isProcessing = Boolean(s.currentTokenCode);
            const utilPercent = !isActive ? 0 : isProcessing ? 92 : 45;

            return (
              <div key={s.id} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Station {s.number}</span>
                    <span className="text-slate-500">({s.name})</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        !isActive
                          ? 'bg-slate-100 text-slate-500'
                          : isProcessing
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {!isActive ? 'STANDBY' : isProcessing ? 'ACTIVE INTAKE' : 'IDLE'}
                    </span>
                  </div>

                  <span className="font-mono font-bold text-slate-800">{utilPercent}% Duty</span>
                </div>

                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      !isActive
                        ? 'bg-slate-300'
                        : isProcessing
                        ? 'bg-emerald-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${utilPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>Target baseline: 75% - 85% operating load</span>
          <span className="font-mono font-bold text-slate-800">Depot Avg: 78%</span>
        </div>
      </div>
    </div>
  );
};
