import React from 'react';
import { Plane, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">
                <Plane className="w-4 h-4 transform -rotate-45" />
              </div>
              <span className="text-white font-extrabold text-base tracking-tight">
                AeroClust AI <span className="text-blue-400 font-medium text-xs">Pricing Intelligence</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Machine learning framework uncovering airline dynamic pricing algorithms, surge traps, and fair market benchmarks across domestic flight corridors.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] pt-1">
              <span className="bg-slate-800 text-blue-300 px-2.5 py-1 rounded border border-slate-700 font-medium">K-Means Partitioning</span>
              <span className="bg-slate-800 text-emerald-300 px-2.5 py-1 rounded border border-slate-700 font-medium">Agglomerative Linkage</span>
              <span className="bg-slate-800 text-purple-300 px-2.5 py-1 rounded border border-slate-700 font-medium">3D PCA Manifold</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Platform Tools</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition">Deal & Surge Checker</Link>
              </li>
              <li>
                <Link to="/passenger-guide" className="hover:text-white transition">Flight Price Wisdom Guide</Link>
              </li>
              <li>
                <Link to="/explorer" className="hover:text-white transition">Route Cluster Explorer</Link>
              </li>
              <li>
                <Link to="/pca-space" className="hover:text-white transition">3D Cluster Point Cloud</Link>
              </li>
              <li>
                <Link to="/predict" className="hover:text-white transition">Live Route Predictor</Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Model Info */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">System Specifications</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><b>Dataset:</b> 300,153 Domestic Records</li>
              <li><b>Corridors:</b> 30 Metro City Pairs</li>
              <li><b>Optimal Segments:</b> k = 4 Market Archetypes</li>
              <li><b>Variance Explained:</b> 54.81% (3D PCA)</li>
              <li className="pt-2 text-emerald-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> High Precision Route Calibration
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>© 2026 AeroClust AI. Open source under the MIT License.</div>
          <div className="mt-2 sm:mt-0 font-medium">Built with Scikit-Learn, FastAPI & React</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
