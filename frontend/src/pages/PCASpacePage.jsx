import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import fallbackPCAData from '../data/pcaSamplePoints.json';

const Plot = createPlotlyComponent(Plotly);
import { Cpu, RotateCcw, Eye, Layers, Compass, BarChart2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPCAProjections } from '../services/api';

const clusterColors = ['#0284c7', '#f59e0b', '#ef4444', '#10b981'];

const pcLoadings = {
  pc1: [
    { feature: 'price', loading: '+0.7168', direction: 'Positive', interpretation: 'Fare intensity & premium yield' },
    { feature: 'duration', loading: '+0.5367', direction: 'Positive', interpretation: 'Flight duration & multi-leg transit' },
    { feature: 'airline_Vistara', loading: '+0.1581', direction: 'Positive', interpretation: 'Full-service carrier premium' },
    { feature: 'class_Economy', loading: '-0.3012', direction: 'Negative', interpretation: 'Economy class discount separation' },
    { feature: 'days_left', loading: '-0.2074', direction: 'Negative', interpretation: 'Last-minute surge window' },
  ],
  pc2: [
    { feature: 'days_left', loading: '+0.9579', direction: 'Positive', interpretation: 'Early-bird booking lead time' },
    { feature: 'duration', loading: '+0.2672', direction: 'Positive', interpretation: 'Extended transit duration' },
    { feature: 'stops_zero', loading: '-0.0562', direction: 'Negative', interpretation: 'Direct non-stop convenience' },
    { feature: 'airline_Indigo', loading: '-0.0471', direction: 'Negative', interpretation: 'Low-cost carrier commute' },
    { feature: 'class_Economy', loading: '-0.0398', direction: 'Negative', interpretation: 'Discount economy ticket' },
  ]
};

const PCASpacePage = () => {
  const [pcaData, setPcaData] = useState(() => {
    try {
      const cached = sessionStorage.getItem('aerocluster_pca_1000');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.points?.length > 0) return parsed;
      }
    } catch {}
    return fallbackPCAData;
  });
  const [viewMode, setViewMode] = useState('3d');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPca = async () => {
      try {
        const data = await getPCAProjections(1000);
        if (data && data.points && data.points.length > 0) {
          setPcaData(data);
          try {
            sessionStorage.setItem('aerocluster_pca_1000', JSON.stringify(data));
          } catch {}
        }
      } catch (err) {
        console.warn("Using offline PCA projections data:", err);
      }
    };
    fetchPca();
  }, []);

  if (loading) return <LoadingSpinner message="Rendering 3D PCA coordinate projections..." />;

  const points = pcaData?.points || [];

  // Group points by cluster for Plotly traces
  const traces = [0, 1, 2, 3].map((clusterId) => {
    const clusterPts = points.filter((p) => p.cluster === clusterId);
    const clusterNames = [
      'Standard Mid-Range Economy',
      'Long-Haul Multi-Stop Route',
      'Advance Business Corridor',
      'Budget Advance Leisure'
    ];

    if (viewMode === '3d') {
      return {
        type: 'scatter3d',
        mode: 'markers',
        name: `Cluster ${clusterId}: ${clusterNames[clusterId]}`,
        x: clusterPts.map((p) => p.x),
        y: clusterPts.map((p) => p.y),
        z: clusterPts.map((p) => p.z),
        text: clusterPts.map(
          (p) =>
            `<b>${p.airline}</b> (${p.class})<br>Route: ${p.route}<br>Fare: ₹${p.price.toLocaleString()}<br>Lead Time: ${p.days_left}d`
        ),
        hoverinfo: 'text',
        marker: {
          size: 4,
          color: clusterColors[clusterId],
          opacity: 0.75,
        },
      };
    } else {
      return {
        type: 'scatter',
        mode: 'markers',
        name: `Cluster ${clusterId}: ${clusterNames[clusterId]}`,
        x: clusterPts.map((p) => p.x),
        y: clusterPts.map((p) => p.y),
        text: clusterPts.map(
          (p) =>
            `<b>${p.airline}</b> (${p.class})<br>Route: ${p.route}<br>Fare: ₹${p.price.toLocaleString()}<br>Lead Time: ${p.days_left}d`
        ),
        hoverinfo: 'text',
        marker: {
          size: 6,
          color: clusterColors[clusterId],
          opacity: 0.7,
        },
      };
    }
  });

  // Calculate Centroid Coordinates in PCA Space for Distinct Markers
  const centroids = [0, 1, 2, 3].map((clusterId) => {
    const clusterPts = points.filter((p) => p.cluster === clusterId);
    if (clusterPts.length === 0) return { x: 0, y: 0, z: 0, id: clusterId };
    const avgX = clusterPts.reduce((acc, p) => acc + p.x, 0) / clusterPts.length;
    const avgY = clusterPts.reduce((acc, p) => acc + p.y, 0) / clusterPts.length;
    const avgZ = clusterPts.reduce((acc, p) => acc + p.z, 0) / clusterPts.length;
    return {
      x: Number(avgX.toFixed(3)),
      y: Number(avgY.toFixed(3)),
      z: Number(avgZ.toFixed(3)),
      id: clusterId
    };
  });

  const centroidTrace = viewMode === '3d' ? {
    type: 'scatter3d',
    mode: 'markers+text',
    name: 'Cluster Centroids (Centers of Gravity)',
    x: centroids.map((c) => c.x),
    y: centroids.map((c) => c.y),
    z: centroids.map((c) => c.z),
    text: centroids.map((c) => `C${c.id} Centroid`),
    textposition: 'top center',
    textfont: { size: 10, color: '#0f172a' },
    hoverinfo: 'text',
    marker: {
      size: 9,
      symbol: 'diamond',
      color: '#0f172a',
      line: { color: '#ffffff', width: 2 },
      opacity: 0.95
    }
  } : {
    type: 'scatter',
    mode: 'markers+text',
    name: 'Cluster Centroids (Centers of Gravity)',
    x: centroids.map((c) => c.x),
    y: centroids.map((c) => c.y),
    text: centroids.map((c) => `C${c.id} Centroid`),
    textposition: 'top center',
    textfont: { size: 10, color: '#0f172a' },
    hoverinfo: 'text',
    marker: {
      size: 13,
      symbol: 'diamond',
      color: '#0f172a',
      line: { color: '#ffffff', width: 2 },
      opacity: 0.95
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-aviation-700 uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" /> Dimensionality Reduction • 3D Manifold Space
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            PCA 3D Manifold & Coordinate Visualizer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Interactive WebGL 3D rotating projection of flight clusters in orthogonal principal component coordinates.
          </p>
        </div>

        {/* View toggle */}
        <div className="inline-flex rounded-xl p-1 bg-slate-200/80 border border-slate-300 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === '3d'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3D Rotating Sphere
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === '2d'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2D Coordinate Plane
          </button>
        </div>
      </div>

      {/* Plotly Chart Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-slate-500">
            {viewMode === '3d' ? (
              <span>💡 <b>Tip:</b> Click and drag with your mouse to rotate the 3D space, scroll to zoom, hover for flight details.</span>
            ) : (
              <span>💡 <b>Tip:</b> PC1 represents Fare & Duration Intensity; PC2 represents Booking Lead Time.</span>
            )}
          </div>
          <div className="text-xs font-semibold text-aviation-700 bg-aviation-50 px-2.5 py-1 rounded-full">
            Total Samples: {points.length} flights
          </div>
        </div>

        <div className="w-full h-[540px] rounded-xl overflow-hidden bg-slate-50/50 flex items-center justify-center p-1">
          <Plot
            data={[...traces, centroidTrace]}
            layout={{
              autosize: true,
              margin: { l: 20, r: 20, b: 30, t: 30 },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              legend: {
                orientation: 'h',
                y: -0.08,
                x: 0,
                font: { size: 11, color: '#334155' }
              },
              scene: {
                xaxis: { title: 'PC1 (Price & Duration)', backgroundcolor: '#f8fafc', gridcolor: '#cbd5e1' },
                yaxis: { title: 'PC2 (Lead Time)', backgroundcolor: '#f8fafc', gridcolor: '#cbd5e1' },
                zaxis: { title: 'PC3 (Route Allocation)', backgroundcolor: '#f8fafc', gridcolor: '#cbd5e1' },
                camera: {
                  eye: { x: 1.6, y: 1.6, z: 1.2 }
                }
              },
              xaxis: { title: 'PC1 (Price & Duration Intensity)', gridcolor: '#e2e8f0' },
              yaxis: { title: 'PC2 (Booking Lead Time)', gridcolor: '#e2e8f0' },
            }}
            config={{ responsive: true, displayModeBar: true, displaylogo: false }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        </div>
      </div>

      {/* Dominant Component Loadings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Principal Component 1 (PC1) Loadings</h3>
            <p className="text-xs text-slate-500 mt-0.5">Captures 23.71% of total variance • Driven by Ticket Fare & Cabin Class</p>
          </div>
          <div className="space-y-2">
            {pcLoadings.pc1.map((item) => (
              <div key={item.feature} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-900">{item.feature}</span>
                  <div className="text-[11px] text-slate-500">{item.interpretation}</div>
                </div>
                <div className={`font-mono font-bold px-2 py-0.5 rounded ${
                  item.direction === 'Positive' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {item.loading}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Principal Component 2 (PC2) Loadings</h3>
            <p className="text-xs text-slate-500 mt-0.5">Captures 16.25% of total variance • Driven by Booking Advance Window</p>
          </div>
          <div className="space-y-2">
            {pcLoadings.pc2.map((item) => (
              <div key={item.feature} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-900">{item.feature}</span>
                  <div className="text-[11px] text-slate-500">{item.interpretation}</div>
                </div>
                <div className={`font-mono font-bold px-2 py-0.5 rounded ${
                  item.direction === 'Positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {item.loading}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCASpacePage;

