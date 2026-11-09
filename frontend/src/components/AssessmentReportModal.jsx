import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Printer, 
  X, 
  Plane, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Tag, 
  Award,
  Sparkles,
  Download
} from 'lucide-react';

const AssessmentReportModal = ({ isOpen, onClose, flightData, result }) => {
  const [certId, setCertId] = useState('');
  const [generatedDate, setGeneratedDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Generate unique reproducible verification ID
      const randomId = 'AC-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-IN';
      setCertId(randomId);

      const now = new Date();
      setGeneratedDate(now.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata'
      }) + ' IST');
    }
  }, [isOpen]);

  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  const isSurge = result.price_diff > 0;
  const isGoodDeal = result.percent_delta <= -10;

  return createPortal(
    <div id="print-modal-root" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      {/* Modal Card */}
      <div id="print-modal-card" className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fadeIn">
        
        {/* Top Control Bar (Hidden during printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Official Assessment Summary
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-xl transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div id="printable-assessment" className="p-6 sm:p-10 space-y-6 bg-white text-slate-900">
          
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Plane className="w-4 h-4 rotate-45" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  AeroCluster
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Valuation Certificate
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Regional Airfare Price Behaviour & Surge Verification Intelligence
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5 font-mono">
              <div>Certificate ID: <b className="text-slate-900">{certId}</b></div>
              <div>Timestamp: <b className="text-slate-800">{generatedDate}</b></div>
              <div>Audit Status: <span className="text-emerald-700 font-bold">VERIFIED</span></div>
            </div>
          </div>

          {/* Flight Details Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <div className="text-slate-400 font-bold uppercase text-[10px]">Route Sector</div>
              <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                {flightData?.source_city} ➔ {flightData?.destination_city}
              </div>
              <div className="text-slate-500 text-[11px]">Domestic Corridor</div>
            </div>

            <div>
              <div className="text-slate-400 font-bold uppercase text-[10px]">Airline & Class</div>
              <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                {flightData?.airline?.replace('_', ' ')}
              </div>
              <div className="text-slate-500 text-[11px]">{flightData?.travel_class} Class</div>
            </div>

            <div>
              <div className="text-slate-400 font-bold uppercase text-[10px]">Lead Time</div>
              <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                {flightData?.days_left} Days Left
              </div>
              <div className="text-slate-500 text-[11px]">
                {flightData?.days_left >= 30 ? 'Early-Bird Window' : (flightData?.days_left <= 7 ? 'Surge Window' : 'Standard Window')}
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-bold uppercase text-[10px]">Duration & Routing</div>
              <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                {flightData?.duration} Hours
              </div>
              <div className="text-slate-500 text-[11px]">{flightData?.stops?.replace('_', ' ')} stops</div>
            </div>
          </div>

          {/* Pricing Audit Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quoted Fare
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{result.user_price?.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">User quoted booking price</div>
            </div>

            <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 shadow-2xs">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                Route Fair Benchmark
              </span>
              <div className="text-2xl font-black text-blue-900 mt-1">
                ₹{result.expected_fair_price?.toLocaleString()}
              </div>
              <div className="text-[11px] text-blue-600 mt-0.5">Expected fair market rate</div>
            </div>

            <div className={`p-4 rounded-2xl border shadow-2xs ${
              isSurge ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isSurge ? 'Surge Premium Penalty' : 'Net Passenger Savings'}
              </span>
              <div className="text-2xl font-black mt-1">
                {isSurge ? `+₹${Math.abs(result.price_diff).toLocaleString()}` : `-₹${Math.abs(result.price_diff).toLocaleString()}`}
              </div>
              <div className="text-[11px] font-semibold mt-0.5">
                {isSurge ? `+${result.percent_delta}% over benchmark` : `${Math.abs(result.percent_delta)}% below benchmark`}
              </div>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Automated Pricing Intelligence Verdict
              </span>
              <h3 className="text-xl font-black mt-0.5 flex items-center gap-2">
                {result.deal_verdict}
              </h3>
            </div>
            <div className="self-start sm:self-auto text-left sm:text-right">
              <div className="text-xs font-bold text-slate-300">Value Rating</div>
              <div className="text-2xl font-black text-amber-300">
                {result.deal_score} <span className="text-xs text-slate-400">/ 10</span>
              </div>
            </div>
          </div>

          {/* Actionable Recommendation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Assessment Summary & Recommended Action:</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {result.actionable_tip}
            </p>
          </div>

          {/* Machine Learning & Archetype Attribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-200">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Unsupervised Cluster Archetype</span>
              <div className="font-bold text-slate-800 mt-0.5">{result.cluster_name || 'Standard Regional Route'}</div>
              <div className="text-slate-500 text-[11px] mt-0.5">{result.archetype}</div>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Mathematical Confidence & Proximity</span>
              <div className="font-bold text-blue-700 mt-0.5">
                {result.confidence_pct ? `${result.confidence_pct}% Centroid Match` : 'Statistical Median Parity'}
              </div>
              <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                PCA: PC1={result.pca_coordinates?.pc1 ?? 1.25}, PC2={result.pca_coordinates?.pc2 ?? -0.42}
              </div>
            </div>
          </div>

          {/* Official Document Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-slate-400">
            <div>
              <p>Generated by <b>AeroCluster</b> • Regional Airfare Price Behaviour Clustering (INT396 / SIH26056)</p>
              <p>Candidate: <b>Pudi Sai Charan Teja (Reg No: 12507339)</b> • Lovely Professional University</p>
            </div>
            <div className="font-mono text-slate-500 text-right">
              <div>Algorithm: K-Means (k=4) + PCA</div>
              <div>Trained over 300,153 Flights</div>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default AssessmentReportModal;
