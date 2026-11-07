import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Plane, 
  Activity, 
  Compass, 
  Cpu, 
  Layers, 
  PlayCircle, 
  Code2, 
  FlaskConical, 
  Sparkles,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { useMode } from '../context/ModeContext';

const Navbar = () => {
  const { mode, toggleMode, isExaminer } = useMode();

  const academicNavItems = [
    { to: '/academic/overview', label: 'Curriculum', icon: Compass },
    { to: '/explorer', label: 'Dataset', icon: Activity },
    { to: '/diagnostics', label: 'Diagnostics', icon: Layers },
    { to: '/pca-space', label: 'PCA 3D Space', icon: Cpu },
    { to: '/archetypes', label: 'Centroids', icon: Plane },
    { to: '/predict', label: 'Tech Inference', icon: PlayCircle },
  ];

  const passengerNavItems = [
    { to: '/', label: 'Flight Deal Checker', icon: Sparkles },
    { to: '/passenger-guide', label: 'How to Beat Surges', icon: HelpCircle },
  ];

  const currentItems = isExaminer ? academicNavItems : passengerNavItems;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      {/* Top Banner when in Examiner Mode */}
      {isExaminer && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-aviation-900 text-white text-[11px] font-medium py-1 px-4 text-center flex items-center justify-center gap-2">
          <FlaskConical className="w-3.5 h-3.5 text-purple-300" />
          <span><b>Academic Examiner Lab Active</b> — Inspecting Unsupervised Learning Proof of Work (INT396 / SIH26056)</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition ${
              isExaminer ? 'bg-purple-700 group-hover:bg-purple-800' : 'bg-aviation-600 group-hover:bg-aviation-700'
            }`}>
              <Plane className="w-5 h-5 rotate-45" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base sm:text-lg tracking-tight leading-tight flex items-center gap-1.5">
                AeroCluster
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isExaminer ? 'bg-purple-100 text-purple-800' : 'bg-aviation-100 text-aviation-800'
                }`}>
                  {isExaminer ? 'Academic Lab' : 'Flight Advisor'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {isExaminer ? 'INT396 University Audit Mode' : 'AI Flight Price & Surge Detector'}
              </div>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {currentItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? isExaminer
                          ? 'bg-purple-50 text-purple-800 font-bold'
                          : 'bg-aviation-50 text-aviation-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Mode Switcher & GitHub */}
          <div className="flex items-center gap-3">
            {/* Dual-Persona Switcher Button */}
            <button
              onClick={toggleMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs border ${
                isExaminer
                  ? 'bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
              title="Click to toggle between Common Man Mode and Examiner Lab"
            >
              {isExaminer ? (
                <>
                  <FlaskConical className="w-3.5 h-3.5 text-purple-700" />
                  <span className="hidden sm:inline">Lab Mode (On)</span>
                  <span className="sm:hidden">Lab</span>
                </>
              ) : (
                <>
                  <FlaskConical className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Examiner Lab</span>
                  <span className="sm:hidden">Audit</span>
                </>
              )}
            </button>

            <a
              href="https://github.com/Saicharantejapudi/airfare-route-clustering"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition shadow-xs"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
