import React, { useState } from 'react';
import { 
  Plane, 
  MapPin, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Layers,
  Filter
} from 'lucide-react';

const CITIES = {
  Delhi: { code: 'DEL', name: 'Delhi', x: 310, y: 130, state: 'National Capital Region', departures: '85,000+' },
  Mumbai: { code: 'BOM', name: 'Mumbai', x: 180, y: 350, state: 'Maharashtra', departures: '78,000+' },
  Bangalore: { code: 'BLR', name: 'Bangalore', x: 270, y: 530, state: 'Karnataka', departures: '62,000+' },
  Hyderabad: { code: 'HYD', name: 'Hyderabad', x: 290, y: 395, state: 'Telangana', departures: '45,000+' },
  Chennai: { code: 'MAA', name: 'Chennai', x: 340, y: 540, state: 'Tamil Nadu', departures: '42,000+' },
  Kolkata: { code: 'CCU', name: 'Kolkata', x: 520, y: 260, state: 'West Bengal', departures: '38,000+' },
};

const CORRIDORS = [
  {
    id: 'DEL-BOM',
    from: 'Delhi',
    to: 'Mumbai',
    category: 'trunk',
    medianFare: 6037,
    duration: '2h 15m',
    volume: 'High Density (85+ daily)',
    cluster: 'Cluster 0: Standard Planned Economy & Cluster 2 (Business)',
    clusterId: 0,
    surgeRisk: 'High (within 96h)',
    desc: 'Busiest commercial trunk in South Asia. High corporate business-class share on Air India and Vistara combined with intense IndiGo shuttle frequencies.'
  },
  {
    id: 'DEL-BLR',
    from: 'Delhi',
    to: 'Bangalore',
    category: 'trunk',
    medianFare: 7414,
    duration: '2h 45m',
    volume: 'Heavy (70+ daily)',
    cluster: 'Cluster 0: Standard Planned Economy',
    clusterId: 0,
    surgeRisk: 'Moderate-High',
    desc: 'Executive tech corridor connecting government & enterprise sectors. High demand elasticity on Monday morning and Friday evening slots.'
  },
  {
    id: 'BOM-BLR',
    from: 'Mumbai',
    to: 'Bangalore',
    category: 'shuttle',
    medianFare: 4850,
    duration: '1h 45m',
    volume: 'Heavy (65+ daily)',
    cluster: 'Cluster 3: Budget Early-Bird & Leisure',
    clusterId: 3,
    surgeRisk: 'Moderate',
    desc: 'High-frequency short-haul shuttle. Dominance of low-cost carriers (IndiGo, SpiceJet) keeps median advance fares below national average.'
  },
  {
    id: 'DEL-CCU',
    from: 'Delhi',
    to: 'Kolkata',
    category: 'trunk',
    medianFare: 6800,
    duration: '2h 15m',
    volume: 'Moderate-High (45+ daily)',
    cluster: 'Cluster 0: Standard Planned Economy',
    clusterId: 0,
    surgeRisk: 'High during Festival Seasons',
    desc: 'Major East-West metro corridor. Characterized by seasonal demand surges around Durga Puja and Diwali periods.'
  },
  {
    id: 'BOM-CCU',
    from: 'Mumbai',
    to: 'Kolkata',
    category: 'longhaul',
    medianFare: 8650,
    duration: '2h 40m (Direct) / 14h+ (Connecting)',
    volume: 'Moderate (35+ daily)',
    cluster: 'Cluster 1: Long-Haul Connecting Route',
    clusterId: 1,
    surgeRisk: 'High on connecting legs',
    desc: 'Trans-continental domestic sector with substantial 1-stop connecting traffic routing through Hyderabad and Delhi hubs.'
  },
  {
    id: 'DEL-MAA',
    from: 'Delhi',
    to: 'Chennai',
    category: 'trunk',
    medianFare: 7900,
    duration: '2h 55m',
    volume: 'Moderate-High (40+ daily)',
    cluster: 'Cluster 0: Standard Planned Economy',
    clusterId: 0,
    surgeRisk: 'Moderate',
    desc: 'Long north-south trunk route with steady corporate and educational passenger volumes throughout the academic cycle.'
  },
  {
    id: 'BOM-MAA',
    from: 'Mumbai',
    to: 'Chennai',
    category: 'shuttle',
    medianFare: 5100,
    duration: '1h 55m',
    volume: 'Moderate (35+ daily)',
    cluster: 'Cluster 3: Budget Early-Bird & Leisure',
    clusterId: 3,
    surgeRisk: 'Low-Moderate',
    desc: 'Coastal manufacturing and IT connector. Competitive airline discounting maintains stable, predictable fare levels.'
  },
  {
    id: 'HYD-BLR',
    from: 'Hyderabad',
    to: 'Bangalore',
    category: 'shuttle',
    medianFare: 3950,
    duration: '1h 10m',
    volume: 'Frequent Shuttle (40+ daily)',
    cluster: 'Cluster 3: Budget Early-Bird & Leisure',
    clusterId: 3,
    surgeRisk: 'Low',
    desc: 'Shortest inter-metro tech feeder. Deep LCC competition and train competition keeps base fares in the ultra-budget bracket.'
  },
  {
    id: 'DEL-HYD',
    from: 'Delhi',
    to: 'Hyderabad',
    category: 'trunk',
    medianFare: 6200,
    duration: '2h 10m',
    volume: 'High (50+ daily)',
    cluster: 'Cluster 0: Standard Planned Economy',
    clusterId: 0,
    surgeRisk: 'Moderate',
    desc: 'Rapidly expanding corporate corridor driven by Hyderabad tech hub growth, serviced by all 6 domestic airlines.'
  },
  {
    id: 'BOM-HYD',
    from: 'Mumbai',
    to: 'Hyderabad',
    category: 'shuttle',
    medianFare: 4100,
    duration: '1h 25m',
    volume: 'High (45+ daily)',
    cluster: 'Cluster 3: Budget Early-Bird & Leisure',
    clusterId: 3,
    surgeRisk: 'Low',
    desc: 'High-frequency commuter corridor with quick turnaround times and heavy low-cost carrier presence.'
  },
  {
    id: 'BLR-CCU',
    from: 'Bangalore',
    to: 'Kolkata',
    category: 'longhaul',
    medianFare: 7650,
    duration: '2h 35m',
    volume: 'Moderate (35+ daily)',
    cluster: 'Cluster 0: Standard Planned Economy',
    clusterId: 0,
    surgeRisk: 'Moderate-High',
    desc: 'Major tech workforce route bridging South India IT parks with West Bengal and Northeast regional feeder networks.'
  },
  {
    id: 'MAA-CCU',
    from: 'Chennai',
    to: 'Kolkata',
    category: 'longhaul',
    medianFare: 6500,
    duration: '2h 20m',
    volume: 'Moderate (25+ daily)',
    cluster: 'Cluster 0: Standard Planned Economy',
    clusterId: 0,
    surgeRisk: 'Moderate',
    desc: 'East-coast trunk corridor with balanced mix of medical tourism, education, and leisure travel.'
  }
];

const RouteNetworkMap = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCorridor, setSelectedCorridor] = useState(CORRIDORS[0]);
  const [filterType, setFilterType] = useState('all');

  const filteredCorridors = CORRIDORS.filter(c => {
    if (filterType === 'all') return true;
    return c.category === filterType;
  });

  const handleCityClick = (cityName) => {
    if (selectedCity === cityName) {
      setSelectedCity(null);
    } else {
      setSelectedCity(cityName);
      const match = CORRIDORS.find(c => c.from === cityName || c.to === cityName);
      if (match) setSelectedCorridor(match);
    }
  };

  const getCorridorColor = (corridor) => {
    if (selectedCorridor?.id === corridor.id) return '#0284c7'; // Active Blue
    if (selectedCity && (corridor.from === selectedCity || corridor.to === selectedCity)) return '#3b82f6';
    if (corridor.category === 'trunk') return '#94a3b8'; // Slate
    if (corridor.category === 'shuttle') return '#10b981'; // Emerald
    return '#8b5cf6'; // Purple for longhaul
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-aviation-700 uppercase tracking-wider mb-1">
            <Plane className="w-4 h-4 text-aviation-600 rotate-45" />
            Regional Price Behaviour & Network Topology
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Indian Domestic Route Corridor Network
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Interactive topology connecting the 6 dominant metro hubs. Click any corridor or airport node to inspect historical median fares, flight duration, and unsupervised cluster archetypes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              filterType === 'all' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Corridors ({CORRIDORS.length})
          </button>
          <button
            onClick={() => setFilterType('trunk')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              filterType === 'trunk' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Trunk Corridors
          </button>
          <button
            onClick={() => setFilterType('shuttle')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              filterType === 'shuttle' ? 'bg-white text-emerald-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Budget Shuttles
          </button>
          <button
            onClick={() => setFilterType('longhaul')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              filterType === 'longhaul' ? 'bg-white text-purple-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cross-Country
          </button>
        </div>
      </div>

      {/* Main Grid: SVG Map + Corridor Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SVG Route Topology Map (Col 7) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-inner relative overflow-hidden flex flex-col items-center justify-center border border-slate-800">
          
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>6 Major Metro Hubs • 12 Golden Flight Sectors</span>
          </div>

          <div className="absolute bottom-4 left-4 z-10 text-[10px] text-slate-400">
            Tip: Click a corridor line or city hub to inspect
          </div>

          <svg
            viewBox="0 0 650 640"
            className="w-full h-auto max-h-[520px] select-none"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
          >
            {/* Background Map Grid / Concentric Guides */}
            <circle cx="310" cy="350" r="280" fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
            <circle cx="310" cy="350" r="180" fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />

            {/* Flight Corridor Lines */}
            {filteredCorridors.map((c) => {
              const fromCity = CITIES[c.from];
              const toCity = CITIES[c.to];
              const isSelected = selectedCorridor?.id === c.id;
              const isHighlighted = selectedCity && (c.from === selectedCity || c.to === selectedCity);
              const color = getCorridorColor(c);

              // Quadratic Bezier curve control point for curved flight path arc
              const midX = (fromCity.x + toCity.x) / 2;
              const midY = (fromCity.y + toCity.y) / 2;
              // Add slight curvature offset
              const dx = toCity.x - fromCity.x;
              const dy = toCity.y - fromCity.y;
              const normalX = -dy * 0.12;
              const normalY = dx * 0.12;
              const ctrlX = midX + normalX;
              const ctrlY = midY + normalY;

              const pathData = `M ${fromCity.x} ${fromCity.y} Q ${ctrlX} ${ctrlY} ${toCity.x} ${toCity.y}`;

              return (
                <g key={c.id} className="cursor-pointer group" onClick={() => setSelectedCorridor(c)}>
                  {/* Invisible wide hover stroke for easy clicking */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="24"
                  />
                  {/* Outer Glow for selected */}
                  {isSelected && (
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="6"
                      opacity="0.4"
                    />
                  )}
                  {/* Core Corridor Arc Line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth={isSelected ? 3.5 : (isHighlighted ? 2.5 : 1.5)}
                    strokeDasharray={isSelected ? '6 3' : (c.category === 'longhaul' ? '4 2' : 'none')}
                    className="transition-all duration-300 group-hover:stroke-aviation-400 group-hover:stroke-width-3"
                  />
                </g>
              );
            })}

            {/* Metro Hub Nodes */}
            {Object.entries(CITIES).map(([name, city]) => {
              const isSelected = selectedCity === name;
              const isRouteNode = selectedCorridor && (selectedCorridor.from === name || selectedCorridor.to === name);

              return (
                <g
                  key={name}
                  transform={`translate(${city.x}, ${city.y})`}
                  className="cursor-pointer group"
                  onClick={() => handleCityClick(name)}
                >
                  {/* Pulse Ring for Route Node */}
                  {(isSelected || isRouteNode) && (
                    <circle
                      r="16"
                      fill={isSelected ? '#38bdf8' : '#60a5fa'}
                      opacity="0.25"
                      className="animate-ping"
                    />
                  )}
                  {/* Outer Ring */}
                  <circle
                    r={isSelected ? 11 : 8}
                    fill="#0f172a"
                    stroke={isSelected ? '#38bdf8' : (isRouteNode ? '#60a5fa' : '#94a3b8')}
                    strokeWidth="2.5"
                    className="transition-all duration-300 group-hover:stroke-white group-hover:r-10"
                  />
                  {/* Inner Dot */}
                  <circle
                    r={isSelected ? 5 : 3.5}
                    fill={isSelected ? '#38bdf8' : (isRouteNode ? '#60a5fa' : '#ffffff')}
                  />
                  {/* City IATA Badge */}
                  <rect
                    x="-18"
                    y="-28"
                    width="36"
                    height="18"
                    rx="6"
                    fill={isSelected ? '#0284c7' : (isRouteNode ? '#1e3a8a' : '#1e293b')}
                    stroke={isSelected ? '#38bdf8' : '#475569'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-16"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {city.code}
                  </text>
                  {/* City Full Name Label */}
                  <text
                    x="0"
                    y="22"
                    textAnchor="middle"
                    fill={isSelected ? '#38bdf8' : '#cbd5e1'}
                    fontSize="11"
                    fontWeight={isSelected ? 'bold' : '600'}
                  >
                    {city.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Corridor Inspection Panel (Col 5) */}
        <div className="lg:col-span-5 space-y-5">
          {selectedCorridor ? (
            <div className="bg-slate-50 rounded-3xl p-6 border-2 border-aviation-500 shadow-sm space-y-5 animate-fadeIn">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-aviation-700 bg-aviation-100 px-3 py-1 rounded-full">
                  {selectedCorridor.category === 'trunk' ? 'Major Metro Trunk' : (selectedCorridor.category === 'shuttle' ? 'Budget Commuter Shuttle' : 'Cross-Country Corridor')}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {CITIES[selectedCorridor.from].code} ⇄ {CITIES[selectedCorridor.to].code}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inspected Flight Corridor</span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
                  <span>{selectedCorridor.from}</span>
                  <ArrowRight className="w-5 h-5 text-aviation-600" />
                  <span>{selectedCorridor.to}</span>
                </h3>
                <div className="text-xs text-slate-500 mt-1">
                  {selectedCorridor.volume}
                </div>
              </div>

              {/* Price & Duration Metric Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                    Median Route Fare
                  </div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    ₹{selectedCorridor.medianFare.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Historical economy median</div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-aviation-600" />
                    Flight Duration
                  </div>
                  <div className="text-xl font-black text-aviation-700 mt-1">
                    {selectedCorridor.duration}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Direct non-stop flight</div>
                </div>
              </div>

              {/* Cluster Archetype Attribution */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>Dominant Unsupervised Cluster:</span>
                </div>
                <div className="text-xs font-extrabold text-purple-900">
                  {selectedCorridor.cluster}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  {selectedCorridor.desc}
                </p>
              </div>

              {/* Surge Risk Assessment */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                <span className="font-semibold">Last-Minute Surge Risk:</span>
                <span className="font-black px-2.5 py-0.5 rounded-full bg-amber-200/80 border border-amber-300">
                  {selectedCorridor.surgeRisk}
                </span>
              </div>

            </div>
          ) : (
            <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
              <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-700">Select Any Route Corridor</div>
              <p className="text-xs text-slate-500">
                Click any flight line on the network map to view regional pricing benchmarks and cluster archetypes.
              </p>
            </div>
          )}

          {/* Connected Hubs Fast Filter Buttons */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase text-slate-400">Quick Metro Hub Focus</div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(CITIES).map((cityName) => (
                <button
                  key={cityName}
                  onClick={() => handleCityClick(cityName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    selectedCity === cityName
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {cityName} ({CITIES[cityName].code})
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default RouteNetworkMap;

