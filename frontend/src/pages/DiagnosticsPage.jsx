import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Layers, CheckCircle2, AlertTriangle, ArrowUpDown, GitBranch, Sparkles } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMetricsSweep } from '../services/api';

const screeData = [
  { comp: 'PC1', individual: 23.71, cumulative: 23.71 },
  { comp: 'PC2', individual: 16.25, cumulative: 39.96 },
  { comp: 'PC3', individual: 14.85, cumulative: 54.81 },
  { comp: 'PC4', individual: 8.20, cumulative: 63.01 },
  { comp: 'PC5', individual: 6.45, cumulative: 69.46 },
  { comp: 'PC6', individual: 5.10, cumulative: 74.56 },
  { comp: 'PC7', individual: 4.30, cumulative: 78.86 },
  { comp: 'PC8', individual: 3.65, cumulative: 82.51 },
];

const DiagnosticsPage = () => {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getMetricsSweep();
        setMetricsData(data);
      } catch (err) {
        console.error("Failed to load clustering metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <LoadingSpinner message="Evaluating clustering validation metrics..." />;

  const kSweep = metricsData?.k_sweep || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-aviation-700 uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" /> Unsupervised Model Validation
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Clustering Diagnostics & Metric Benchmarks
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Evaluating optimal cluster count k ∈ [2, 10] across WCSS, Silhouette Coefficient, Davies-Bouldin Index, and Scree Analysis.
        </p>
      </div>

      {/* KPI Validation Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Optimal k"
          value="k = 4"
          subtitle="Elbow & Silhouette Optimal"
          color="blue"
          badge="Selected Architecture"
        />
        <MetricCard
          title="Optimal WCSS"
          value="196,078.8"
          subtitle="Rate of decay diminishes past k=4"
          color="green"
          badge="Inertia Inflection"
        />
        <MetricCard
          title="Davies-Bouldin Index"
          value="1.9156"
          subtitle="Lower indicates higher separation"
          color="purple"
          badge="DBI Benchmark"
        />
        <MetricCard
          title="Ward vs K-Means Concordance"
          value="0.6522 ARI"
          subtitle="NMI: 0.6405 (Strong alignment)"
          color="amber"
          badge="Hierarchical Cross-Validation"
        />
      </div>

      {/* Dual Diagnostic Charts: Elbow & Silhouette */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Elbow Curve */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Elbow Method: WCSS (Inertia) vs k</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies the inflection point where additional clusters yield diminishing returns in intra-cluster variance reduction.
            </p>
          </div>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kSweep} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="k" stroke="#64748b" fontSize={12} tickLine={false} label={{ value: 'Number of Clusters (k)', position: 'insideBottom', offset: -2 }} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val) => [Number(val).toLocaleString(), 'WCSS']} />
                <Line type="monotone" dataKey="wcss" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 5, fill: '#0284c7' }} name="WCSS" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Silhouette & Davies-Bouldin Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Separation Quality: Silhouette & Davies-Bouldin</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Silhouette measures intra-cluster cohesion vs nearest-cluster isolation; Davies-Bouldin indicates cluster overlap.
            </p>
          </div>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kSweep} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="k" stroke="#64748b" fontSize={12} tickLine={false} label={{ value: 'Number of Clusters (k)', position: 'insideBottom', offset: -2 }} />
                <YAxis yAxisId="left" stroke="#10b981" fontSize={12} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" fontSize={12} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="silhouette_score" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Silhouette Score (Higher is better)" />
                <Line yAxisId="right" type="monotone" dataKey="davies_bouldin_index" stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} name="Davies-Bouldin (Lower is better)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PCA Scree Plot */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">PCA Scree Plot: Explained Variance Ratio Across Principal Components</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            The first 3 principal components capture 54.81% of the total 26-dimensional system variance.
          </p>
        </div>
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={screeData} margin={{ top: 15, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="comp" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} tickLine={false} tickFormatter={(val) => `${val}%`} />
              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={12} tickLine={false} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
              <Tooltip formatter={(val) => [`${val}%`]} />
              <Legend />
              <Bar yAxisId="left" dataKey="individual" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Individual Variance (%)" />
              <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} name="Cumulative Variance (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distance Metric & Hierarchical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-aviation-700 font-bold text-sm">
            <ArrowUpDown className="w-4 h-4" />
            Distance Metric Sensitivity: Euclidean (L2) vs. Manhattan (L1)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In mixed continuous-categorical spaces containing one-hot binary dimensions, Euclidean distance penalizes discrepancies quadratically, placing disproportionate weight on price outliers. Manhattan (taxicab) distance penalizes orthogonal binary dimensions linearly.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="text-slate-500 font-semibold uppercase">Euclidean (L2)</div>
              <div className="text-base font-bold text-slate-900 mt-1">0.1512</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Mean Intra-Dist: 2.738</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
              <div className="text-emerald-700 font-semibold uppercase">Manhattan (L1)</div>
              <div className="text-base font-bold text-emerald-900 mt-1">0.1555</div>
              <div className="text-emerald-700 text-[11px] mt-0.5">Mean Intra-Dist: 7.418</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
            <GitBranch className="w-4 h-4" />
            Agglomerative Hierarchical Linkage (Ward's Linkage)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hierarchical clustering with Ward's minimum variance criterion cross-evaluated on a stratified representative sample. The resulting taxonomy exhibits strong structural congruence with K-Means.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="text-slate-500 font-semibold uppercase">Adjusted Rand Index</div>
              <div className="text-base font-bold text-slate-900 mt-1">0.6522</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Substantial concordance</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs">
              <div className="text-purple-700 font-semibold uppercase">Mutual Information (NMI)</div>
              <div className="text-base font-bold text-purple-900 mt-1">0.6405</div>
              <div className="text-purple-700 text-[11px] mt-0.5">Shared cluster entropy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsPage;

