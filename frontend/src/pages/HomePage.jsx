import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plane,
  Sparkles,
  ShieldAlert,
  Clock,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  TrendingDown,
  Calendar,
  Layers,
  FlaskConical,
  Award
} from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { predictRouteCluster } from '../services/api';
import { calculatePreciseFareVerdict } from '../utils/pricingEngine';

const airlines = ['Vistara', 'Air_India', 'Indigo', 'SpiceJet', 'AirAsia', 'GO_FIRST'];
const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Hyderabad', 'Chennai'];

// Date helper functions
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getDateFromDays = (days) => {
  const target = new Date();
  target.setDate(target.getDate() + Number(days));
  return target.toISOString().split('T')[0];
};

const getDaysFromDate = (dateString) => {
  if (!dateString) return 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(60, diffDays));
};

const HomePage = () => {
  const { isExaminer, toggleMode } = useMode();

  // Consumer Quick Form State
  const [flightData, setFlightData] = useState({
    airline: 'Indigo',
    source_city: 'Delhi',
    destination_city: 'Mumbai',
    departure_time: 'Morning',
    stops: 'zero',
    travel_class: 'Economy',
    duration: 2.2,
    days_left: 1,
    price: 5999
  });

  const [travelDate, setTravelDate] = useState(() => getDateFromDays(1));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(() => calculatePreciseFareVerdict(flightData));

  // Instantly re-calculate precise verdict as user types or changes fields
  useEffect(() => {
    if (flightData.price && Number(flightData.price) > 0) {
      const precise = calculatePreciseFareVerdict(flightData);
      setResult(prev => ({
        ...(prev || {}),
        ...precise,
        cluster_name: prev?.cluster_name || (flightData.travel_class === 'Business' ? 'Cluster 2: Advance Business Class Corridor' : (flightData.duration >= 14 ? 'Cluster 1: Long-Haul Connecting Route' : (flightData.days_left >= 30 ? 'Cluster 3: Budget Leisure Route' : 'Cluster 0: Standard Planned Economy'))),
        archetype: prev?.archetype || 'Volume Driver & Planned Economy',
        key_drivers: prev?.key_drivers || [`${flightData.days_left} days left`, `${flightData.travel_class} class`],
        pca_coordinates: prev?.pca_coordinates || { pc1: 1.25, pc2: -0.42, pc3: 0.88 }
      }));
    }
  }, [flightData]);

  const handleQuickCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Calculate precise route-calibrated price metrics
      const precise = calculatePreciseFareVerdict(flightData);

      // 2. Fetch ML cluster assignment from backend if available
      let clusterData = {};
      try {
        clusterData = await predictRouteCluster(flightData);
      } catch (apiErr) {
        // Fallback gracefully to offline clustering heuristic if API is not running
        clusterData = {
          cluster_id: flightData.travel_class === 'Business' ? 2 : (flightData.duration >= 14 ? 1 : (flightData.days_left >= 30 ? 3 : 0)),
          cluster_name: flightData.travel_class === 'Business' ? 'Cluster 2: Advance Business Class Corridor' : (flightData.duration >= 14 ? 'Cluster 1: Long-Haul Connecting Route' : (flightData.days_left >= 30 ? 'Cluster 3: Budget Leisure Route' : 'Cluster 0: Standard Planned Economy'))
        };
      }

      setResult({
        ...clusterData,
        ...precise
      });
    } catch (err) {
      console.error("Check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8.0) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 6.0) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 4.0) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-12 pb-16">
      {/* =========================================================================
          HERO SECTION: PASSENGER MODE (CONSUMER-FIRST)
         ========================================================================= */}
      {!isExaminer ? (
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aviation-100 text-aviation-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-aviation-600" />
              AI Flight Price & Surge Detector
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Is this flight ticket a <span className="text-aviation-600">good deal</span>, or an airline <span className="text-rose-600">surge trap</span>?
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Airlines use hidden algorithms to change prices by the hour. Enter your flight details below to get an instant, honest verdict from machine learning.
            </p>
          </div>

          {/* Quick Check Form & Live Verdict Card */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
            <form onSubmit={handleQuickCheck} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Route */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">From</label>
                  <select
                    value={flightData.source_city}
                    onChange={(e) => setFlightData({ ...flightData, source_city: e.target.value })}
                    className="w-full text-sm font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-aviation-500"
                  >
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">To</label>
                  <select
                    value={flightData.destination_city}
                    onChange={(e) => setFlightData({ ...flightData, destination_city: e.target.value })}
                    className="w-full text-sm font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-aviation-500"
                  >
                    {cities.filter(c => c !== flightData.source_city).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Airline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Airline</label>
                  <select
                    value={flightData.airline}
                    onChange={(e) => setFlightData({ ...flightData, airline: e.target.value })}
                    className="w-full text-sm font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-aviation-500"
                  >
                    {airlines.map((a) => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
                  </select>
                </div>

                {/* Class */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Travel Class</label>
                  <select
                    value={flightData.travel_class}
                    onChange={(e) => setFlightData({ ...flightData, travel_class: e.target.value })}
                    className="w-full text-sm font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-aviation-500"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              {/* Departure Date Calendar & Direct Price Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-slate-100">
                {/* Calendar Date Picker */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-aviation-600" />
                      Departure Date
                    </label>
                    <span className="text-xs font-bold text-aviation-700 bg-aviation-50 px-2.5 py-0.5 rounded-full border border-aviation-200">
                      {flightData.days_left} {flightData.days_left === 1 ? 'day' : 'days'} left
                    </span>
                  </div>
                  <input
                    type="date"
                    min={getTodayDateString()}
                    value={travelDate}
                    onChange={(e) => {
                      setTravelDate(e.target.value);
                      const days = getDaysFromDate(e.target.value);
                      setFlightData(prev => ({ ...prev, days_left: days }));
                    }}
                    className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-aviation-500 shadow-2xs"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    Select your flight date — days left are calculated automatically.
                  </div>
                </div>

                {/* Direct Price Input Box */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      Ticket Price You Found (INR ₹)
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="500000"
                      step="any"
                      value={flightData.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFlightData(prev => ({ ...prev, price: val === '' ? '' : Number(val) }));
                      }}
                      placeholder="e.g. 6037"
                      className="w-full pl-8 pr-3.5 py-2.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Enter the exact fare quoted on the booking website (e.g. ₹6,037).
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer border border-blue-500"
              >
                {loading ? (
                  <span>Checking 300,000+ flight records...</span>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>Check My Deal & Detect Surge</span>
                  </>
                )}
              </button>
            </form>

            {/* Verdict Output Card */}
            {result && (
              <div className="p-6 rounded-2xl bg-slate-50 border-2 border-aviation-500 space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Instant AI Verdict</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{result.deal_verdict}</h3>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-black self-start sm:self-auto ${getScoreColor(result.deal_score)}`}>
                    Value Rating: {result.deal_score} / 10
                  </div>
                </div>

                {/* Precise Price Comparison Metric Cards */}
                {result.expected_fair_price && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Your Quoted Fare</div>
                      <div className="text-xl font-black text-slate-900 mt-0.5">
                        ₹{result.user_price?.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Inputted price</div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Route Fair Benchmark</div>
                      <div className="text-xl font-black text-aviation-700 mt-0.5">
                        ₹{result.expected_fair_price?.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Historical expected median</div>
                    </div>

                    <div className={`p-3.5 rounded-xl border shadow-2xs ${result.price_diff > 0
                      ? 'bg-rose-50/70 border-rose-200 text-rose-700'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-700'
                      }`}>
                      <div className="text-[11px] font-bold uppercase">
                        {result.price_diff > 0 ? 'Surge Premium' : 'Passenger Savings'}
                      </div>
                      <div className="text-xl font-black mt-0.5">
                        {result.price_diff > 0 ? `+₹${Math.abs(result.price_diff).toLocaleString()}` : `-₹${Math.abs(result.price_diff).toLocaleString()}`}
                      </div>
                      <div className="text-[11px] font-semibold mt-0.5">
                        {result.price_diff > 0 ? `+${result.percent_delta}% over benchmark` : `${Math.abs(result.percent_delta)}% below benchmark`}
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    What you should do:
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {result.actionable_tip}
                  </p>
                </div>

                {/* Historical Price Spectrum */}
                {result.route_median && (
                  <div className="p-3.5 rounded-xl bg-aviation-50/60 border border-aviation-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-aviation-900">Historical Corridor Spectrum:</span>
                    <div className="flex flex-wrap items-center gap-3 font-mono">
                      <span>Low Deal: <b className="text-emerald-700">₹{result.route_p25?.toLocaleString()}</b></span>
                      <span>•</span>
                      <span>Normal Median: <b className="text-slate-800">₹{result.route_median?.toLocaleString()}</b></span>
                      <span>•</span>
                      <span>Surge Trigger: <b className="text-rose-700">₹{result.route_surge_threshold?.toLocaleString()}</b></span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-1">
                  <div>
                    <b>Route:</b> {flightData.source_city} ➔ {flightData.destination_city} ({flightData.airline.replace('_', ' ')})
                  </div>
                  <div className="font-semibold text-aviation-700">
                    {result.savings_estimate}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Passenger Wisdom & Protection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">The 96-Hour Surge Trap</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When you search for flights inside 4 days to departure, dynamic pricing engines automatically trigger surge multipliers, increasing prices by up to 120%.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">The Layover Discount Illusion</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A ₹7,500 ticket with an 18-hour layover is not a real sale. Airlines discount these connecting seats because nobody wants to lose a full day in transit.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">The 30-Day Sweet Spot</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Domestic Indian leisure fares reach their lowest statistical price point between 30 to 45 days before departure. This is the optimal window to lock in tickets.
              </p>
            </div>
          </div>
        </section>
      ) : (
        /* =========================================================================
           ANALYST LAB MODE (ALGORITHM & CLUSTER AUDIT)
           ========================================================================= */
        <section className="space-y-8 animate-fadeIn">
          <div className="p-8 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl border border-purple-500/30 shadow-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-semibold uppercase tracking-wider">
              <FlaskConical className="w-4 h-4 text-purple-300" />
              Analyst Intelligence & Model Diagnostics Console
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Unsupervised Learning Architecture & Mathematical Validation
            </h1>
            <p className="text-purple-200 text-sm max-w-2xl leading-relaxed">
              This console provides direct verification of all mathematical models,
              K-Means hyperparameter sweeps, distance metric evaluations, and 3D PCA coordinate decompositions.
            </p>
            <div className="flex flex-wrap gap-3 pt-2 text-xs">
              <Link to="/diagnostics" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition">
                View Elbow & Silhouette Curves
              </Link>
              <Link to="/pca-space" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold border border-white/20 transition">
                Launch Interactive 3D PCA Sphere
              </Link>
              <Link to="/archetypes" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold border border-white/20 transition">
                Inspect Centroid Math
              </Link>
            </div>
          </div>

          {/* Technical Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="text-xs font-bold text-purple-700 uppercase">Partition Clustering</div>
              <h3 className="font-bold text-slate-900 text-base">Partition & Optimization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                K-Means swept across k ∈ [2, 10] using k-means++ seeding. Confirmed optimal k=4 with inflection at WCSS = 196,078.8 and peak Silhouette separation.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="text-xs font-bold text-emerald-700 uppercase">Distance Geometry & Linkage</div>
              <h3 className="font-bold text-slate-900 text-base">Distance Metrics & Linkage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluated Euclidean (L2) vs Manhattan (L1) metrics on 26 orthogonal binary/continuous dimensions. Hierarchical Ward linkage verified with ARI = 0.6522.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="text-xs font-bold text-blue-700 uppercase">Dimensionality Reduction</div>
              <h3 className="font-bold text-slate-900 text-base">Dimensionality Reduction</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Covariance eigen-decomposition capturing 54.81% cumulative variance across 3 principal components. Rendered via WebGL-accelerated 3D Plotly rotating scatter.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
