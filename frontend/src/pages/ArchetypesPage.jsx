import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Plane, Tag, Compass, DollarSign, Calendar, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getClusterCentroids } from '../services/api';

const ArchetypesPage = () => {
  const [centroids, setCentroids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCentroids = async () => {
      try {
        const data = await getClusterCentroids();
        setCentroids(data);
      } catch (err) {
        console.error("Failed to load cluster centroids:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCentroids();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating de-standardized cluster profiles..." />;

  const chartData = centroids.map((c) => ({
    name: `Cluster ${c.cluster}`,
    price: c.price,
    duration: c.duration,
    days_left: c.days_left,
    archetype: c.archetype
  }));

  const cardBorderColors = [
    'border-blue-300 hover:border-blue-500',
    'border-amber-300 hover:border-amber-500',
    'border-rose-300 hover:border-rose-500',
    'border-emerald-300 hover:border-emerald-500'
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-aviation-700 uppercase tracking-wider mb-1">
          <Plane className="w-4 h-4" /> Commercial Route Interpretation • Unit II & III
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Commercial Route Profiles & Centroid Archetypes
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          De-standardized real-world mathematical centroids translated into actionable aviation commercial segments.
        </p>
      </div>

      {/* Cluster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {centroids.map((c, idx) => (
          <div
            key={c.cluster}
            className={`bg-white rounded-2xl p-6 border shadow-xs transition ${cardBorderColors[c.cluster % 4]} flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-slate-400">CLUSTER {c.cluster}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {c.badge}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900">{c.cluster_name}</h2>
              <div className="text-xs font-semibold text-aviation-600 mt-0.5">{c.archetype}</div>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">{c.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50">
                <div className="text-slate-400 font-medium">Mean Fare</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">₹{Math.round(c.price).toLocaleString()}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50">
                <div className="text-slate-400 font-medium">Lead Time</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{c.days_left.toFixed(1)} Days</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50">
                <div className="text-slate-400 font-medium">Duration</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{c.duration.toFixed(1)} Hrs</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Centroid Comparison Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">De-Standardized Centroid Fare Comparison (INR ₹)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-world ticket price variation across clusters illustrates clear economic stratification.
          </p>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Mean Fare']} />
              <Bar dataKey="price" fill="#0284c7" radius={[6, 6, 0, 0]} name="Mean Fare (INR ₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ethical Guidelines & Revenue Management Insights */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
          <ShieldAlert className="w-4 h-4" />
          Aviation Revenue Management & Ethical Guardrails
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-semibold text-slate-900">Descriptive vs. Prescriptive Pricing</h4>
            <p>
              Exploratory route clustering identifies natural behavioral patterns in historical booking transactions.
              Airlines must avoid using algorithmic clusters to enforce predatory pricing on sole-operator regional routes.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-semibold text-slate-900">Emergency & Medical Route Protection</h4>
            <p>
              Last-minute surge multipliers (Cluster 0/3 short notice) should incorporate statutory fare caps on essential humanitarian, medical transit, and bereavement corridors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchetypesPage;

