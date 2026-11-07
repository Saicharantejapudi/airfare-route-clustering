import React from 'react';
import { Award, BookOpen, User, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          {/* Col 1 */}
          <div className="md:col-span-2">
            <h3 className="text-white font-bold text-base mb-2">
              Historical Airfare Route Profiles Through Regional Price Behaviour Clustering
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg mb-4">
              Capstone unsupervised learning framework uncovering dynamic pricing behaviors,
              route congestion patterns, and booking lead-time sensitivity across domestic Indian aviation sectors.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-slate-800 text-aviation-400 px-2.5 py-1 rounded border border-slate-700 font-mono">CO2: Partition Clustering</span>
              <span className="bg-slate-800 text-emerald-400 px-2.5 py-1 rounded border border-slate-700 font-mono">CO3: Hierarchical Linkage</span>
              <span className="bg-slate-800 text-purple-400 px-2.5 py-1 rounded border border-slate-700 font-mono">CO5: PCA Visualisation</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Academic Allocation</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><b>Course:</b> INT396 (Unsupervised Learning)</li>
              <li><b>Problem Statement:</b> SIH26056</li>
              <li><b>Project Type:</b> Individual (Sr. No. 26)</li>
              <li><b>Submission:</b> 12507339.zip</li>
              <li><b>Institution:</b> Lovely Professional University</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Candidate Attribution</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="text-white font-medium">Pudi Sai Charan Teja</li>
              <li><b>Registration:</b> 12507339</li>
              <li><b>Roll Number:</b> RK3P24XCB35</li>
              <li><b>Section:</b> K3P24XC</li>
              <li className="flex items-center gap-1.5 text-emerald-400 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Individual Capstone
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>© 2026 Pudi Sai Charan Teja. Released under the MIT Academic License.</div>
          <div className="mt-2 sm:mt-0">Powered by FastAPI, scikit-learn & React</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

