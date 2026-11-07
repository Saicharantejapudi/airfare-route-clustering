import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Layers, 
  Cpu, 
  TrendingUp, 
  Database, 
  ArrowRight,
  BookOpen,
  Award
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { getHealth, getDatasetSummary } from '../services/api';

const AcademicOverviewPage = () => {
  const [health, setHealth] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [h, s] = await Promise.all([getHealth(), getDatasetSummary()]);
        setHealth(h);
        setSummary(s);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10 pb-16">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl border border-purple-500/30 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-semibold uppercase tracking-wider">
          <Award className="w-4 h-4 text-purple-300" />
          INT396 Unsupervised Learning Capstone • Problem Statement SIH26056
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Curriculum Alignment & Academic Research Lab
        </h1>
        <p className="text-purple-200 text-sm max-w-2xl leading-relaxed">
          Comprehensive unsupervised learning system fulfilling Lovely Professional University Course Outcomes CO2, CO3, and CO5 across Units II, III & IV.
        </p>
        <div className="pt-2 text-xs text-purple-300">
          <b>Candidate:</b> Pudi Sai Charan Teja (Reg: 12507339 | Roll: RK3P24XCB35 | Section: K3P24XC)
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Flights"
          value="300,153"
          subtitle="EaseMyTrip Dataset"
          color="blue"
          badge="Preprocessed"
        />
        <MetricCard
          title="Optimal Partitions"
          value="k = 4"
          subtitle="Elbow & Silhouette Optimal"
          color="green"
          badge="K-Means++"
        />
        <MetricCard
          title="PCA Variance"
          value="54.81%"
          subtitle="Top 3 Orthogonal Axes"
          color="purple"
          badge="Scree Spectrum"
        />
        <MetricCard
          title="Stability (ARI)"
          value="0.6522"
          subtitle="Ward Linkage vs K-Means"
          color="amber"
          badge="Hierarchical"
        />
      </div>

      {/* Course Outcomes Matrix */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Course Outcome Mapping (Units II, III & IV)</h2>
          <p className="text-xs text-slate-500 mt-1">Specific syllabus topics covered in this unsupervised learning codebase.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Unit II • CO2</span>
            <h3 className="font-bold text-slate-900 text-base">Partition Clustering</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              K-Means implementation with k-means++ seeding swept across k ∈ [2, 10]. Evaluated via WCSS (Inertia), Silhouette Score, and Davies-Bouldin Index.
            </p>
            <Link to="/diagnostics" className="inline-flex items-center text-xs font-bold text-purple-700 gap-1 hover:gap-2 transition pt-1">
              <span>View WCSS & Silhouette</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Unit III • CO3</span>
            <h3 className="font-bold text-slate-900 text-base">Distance Metrics & Linkage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Euclidean (L2) vs Manhattan (L1) metric sensitivity on mixed continuous-binary coordinates. Agglomerative Hierarchical clustering with Ward's linkage.
            </p>
            <Link to="/archetypes" className="inline-flex items-center text-xs font-bold text-emerald-700 gap-1 hover:gap-2 transition pt-1">
              <span>Inspect Centroid Profiles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Unit IV • CO5</span>
            <h3 className="font-bold text-slate-900 text-base">Dimensionality Reduction</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Principal Component Analysis (PCA) covariance eigen-decomposition. Scree variance plot, component loading analysis, and WebGL 3D rotating scatter space.
            </p>
            <Link to="/pca-space" className="inline-flex items-center text-xs font-bold text-blue-700 gap-1 hover:gap-2 transition pt-1">
              <span>Launch 3D PCA Visualizer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicOverviewPage;

