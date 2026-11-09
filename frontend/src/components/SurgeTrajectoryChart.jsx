import React, { useState } from 'react';
import { TrendingUp, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

const SurgeTrajectoryChart = ({ trajectoryData }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!trajectoryData || !trajectoryData.points || trajectoryData.points.length === 0) {
    return null;
  }

  const { points, userPoint } = trajectoryData;

  // Chart Dimensions
  const width = 500;
  const height = 210;
  const pad = { top: 25, right: 25, bottom: 35, left: 55 };

  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  // Min and Max prices for Y scaling
  const allPrices = [...points.map((p) => p.price), userPoint?.price || 0].filter(Boolean);
  const minPrice = Math.max(1000, Math.floor(Math.min(...allPrices) * 0.85 / 500) * 500);
  const maxPrice = Math.ceil(Math.max(...allPrices) * 1.15 / 1000) * 1000;

  // X maps days: 50 -> 0 (left), 1 -> plotW (right)
  const getX = (days) => {
    const clamped = Math.max(1, Math.min(50, days));
    return pad.left + ((50 - clamped) / (50 - 1)) * plotW;
  };

  // Y maps price: minPrice -> plotH (bottom), maxPrice -> 0 (top)
  const getY = (price) => {
    const clamped = Math.max(minPrice, Math.min(maxPrice, price));
    return pad.top + plotH - ((clamped - minPrice) / (maxPrice - minPrice)) * plotH;
  };

  // Construct SVG Path
  const sortedPoints = [...points].sort((a, b) => b.days - a.days); // 50 down to 1
  const pathD = sortedPoints.reduce((acc, pt, idx) => {
    const x = getX(pt.days);
    const y = getY(pt.price);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${getX(1)} ${pad.top + plotH} L ${getX(50)} ${pad.top + plotH} Z`;

  // User Point Coordinates
  const userX = userPoint ? getX(userPoint.days) : null;
  const userY = userPoint ? getY(userPoint.price) : null;

  // Surge phase detection
  const isSurgePhase = userPoint?.days <= 7;
  const isSweetSpot = userPoint?.days >= 30;

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Route Price Trajectory (50 Days ➔ Departure)
            </h4>
            <p className="text-[11px] text-slate-500">
              Advance booking curve showing the historical 7-day surge inflection cliff
            </p>
          </div>
        </div>

        <div className="self-start sm:self-auto">
          {isSurgePhase ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              Surge Window Active
            </span>
          ) : isSweetSpot ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Early-Bird Sweet Spot
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <Clock className="w-3 h-3 text-blue-600" />
              Standard Planned Window
            </span>
          )}
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[220px] select-none">
          <defs>
            <linearGradient id="surgeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="redZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="greenZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Sweet Spot Shading (Days 50 to 30) */}
          <rect
            x={getX(50)}
            y={pad.top}
            width={getX(30) - getX(50)}
            height={plotH}
            fill="url(#greenZoneGrad)"
          />
          <text
            x={(getX(50) + getX(30)) / 2}
            y={pad.top + 14}
            textAnchor="middle"
            fill="#059669"
            fontSize="9"
            fontWeight="bold"
          >
            SWEET SPOT (30-50d)
          </text>

          {/* Surge Zone Shading (Days 7 to 1) */}
          <rect
            x={getX(7)}
            y={pad.top}
            width={getX(1) - getX(7)}
            height={plotH}
            fill="url(#redZoneGrad)"
          />
          <text
            x={(getX(7) + getX(1)) / 2}
            y={pad.top + 14}
            textAnchor="middle"
            fill="#dc2626"
            fontSize="9"
            fontWeight="bold"
          >
            SURGE CLIFF (1-7d)
          </text>

          {/* Y-axis Gridlines & Labels */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac, i) => {
            const pVal = Math.round(minPrice + frac * (maxPrice - minPrice));
            const y = pad.top + plotH - frac * plotH;
            return (
              <g key={i}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={pad.left + plotW}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={pad.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  ₹{(pVal / 1000).toFixed(1)}k
                </text>
              </g>
            );
          })}

          {/* X-axis Days Labels */}
          {[50, 40, 30, 20, 10, 7, 1].map((d) => {
            const x = getX(d);
            return (
              <g key={d}>
                <line
                  x1={x}
                  y1={pad.top + plotH}
                  x2={x}
                  y2={pad.top + plotH + 4}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={pad.top + plotH + 16}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontWeight="600"
                >
                  {d}d
                </text>
              </g>
            );
          })}
          <text
            x={pad.left + plotW / 2}
            y={height - 5}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="9"
            fontWeight="500"
          >
            Booking Lead Time Remaining ➔
          </text>

          {/* Gradient Area under the Curve */}
          <path d={areaD} fill="url(#surgeGrad)" />

          {/* Main Price Trajectory Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Curve Point Dots */}
          {sortedPoints.map((pt) => {
            const cx = getX(pt.days);
            const cy = getY(pt.price);
            return (
              <circle
                key={pt.days}
                cx={cx}
                cy={cy}
                r="3"
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth="1.5"
                className="cursor-pointer hover:r-5 transition-all"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* User's Flight Marker */}
          {userX !== null && userY !== null && (
            <g>
              {/* Vertical Guide to User Point */}
              <line
                x1={userX}
                y1={pad.top}
                x2={userX}
                y2={pad.top + plotH}
                stroke="#2563eb"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />

              {/* Pulsing Outer Ring */}
              <circle
                cx={userX}
                cy={userY}
                r="8"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                opacity="0.6"
              />
              {/* Solid Inner Dot */}
              <circle
                cx={userX}
                cy={userY}
                r="4.5"
                fill="#1d4ed8"
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              {/* User Point Callout Badge */}
              <g transform={`translate(${Math.max(pad.left + 45, Math.min(width - pad.right - 55, userX))}, ${Math.max(pad.top + 28, userY - 14)})`}>
                <rect
                  x="-48"
                  y="-14"
                  width="96"
                  height="16"
                  rx="4"
                  fill="#1e293b"
                  opacity="0.9"
                />
                <text
                  x="0"
                  y="-3"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8.5"
                  fontWeight="bold"
                >
                  Your Fare: ₹{userPoint.price?.toLocaleString()} ({userPoint.days}d)
                </text>
              </g>
            </g>
          )}

          {/* Hover Tooltip Overlay */}
          {hoveredPoint && (
            <g transform={`translate(${getX(hoveredPoint.days)}, ${getY(hoveredPoint.price) - 10})`}>
              <rect
                x="-36"
                y="-14"
                width="72"
                height="15"
                rx="3"
                fill="#0f172a"
              />
              <text
                x="0"
                y="-3"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontWeight="bold"
              >
                Day {hoveredPoint.days}: ₹{hoveredPoint.price?.toLocaleString()}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            30–50d: Sweet Spot
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            8–29d: Standard
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            1–7d: Surge Window
          </span>
        </div>
        <div className="font-semibold text-slate-700">
          ● Your Flight: Day {userPoint?.days} at ₹{userPoint?.price?.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default SurgeTrajectoryChart;

