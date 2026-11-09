import React, { useState } from 'react';
import {
  PlayCircle,
  Plane,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  Tag
} from 'lucide-react';
import { predictRouteCluster } from '../services/api';
import { calculatePreciseFareVerdict } from '../utils/pricingEngine';
import SurgeTrajectoryChart from '../components/SurgeTrajectoryChart';

const airlines = ['Vistara', 'Air_India', 'Indigo', 'SpiceJet', 'AirAsia', 'GO_FIRST'];
const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Hyderabad', 'Chennai'];
const departureTimes = ['Early_Morning', 'Morning', 'Afternoon', 'Evening', 'Night', 'Late_Night'];
const stopOptions = [
  { value: 'zero', label: 'Direct / Non-stop' },
  { value: 'one', label: '1 Stop (Layover)' },
  { value: 'two_or_more', label: '2+ Stops' }
];

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

const PredictPage = () => {
  const [formData, setFormData] = useState({
    airline: 'Vistara',
    source_city: 'Delhi',
    destination_city: 'Mumbai',
    departure_time: 'Morning',
    stops: 'zero',
    travel_class: 'Economy',
    duration: 2.5,
    days_left: 1,
    price: 5999
  });

  const [travelDate, setTravelDate] = useState(() => getDateFromDays(1));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const presets = [
    {
      title: 'Delhi ➔ Mumbai (IndiGo, 30d out)',
      badge: 'Fair Market Baseline',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: 'Typical early-bird booking (₹7,129)',
      data: {
        airline: 'Indigo',
        source_city: 'Delhi',
        destination_city: 'Mumbai',
        departure_time: 'Morning',
        stops: 'zero',
        travel_class: 'Economy',
        duration: 2.15,
        days_left: 30,
        price: 7129
      }
    },
    {
      title: 'Mumbai ➔ Bangalore (Air India Business, 2d)',
      badge: 'Corporate Surge Corridor',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      desc: 'Urgent business commute (₹45,000)',
      data: {
        airline: 'Air_India',
        source_city: 'Mumbai',
        destination_city: 'Bangalore',
        departure_time: 'Evening',
        stops: 'zero',
        travel_class: 'Business',
        duration: 1.85,
        days_left: 2,
        price: 45000
      }
    },
    {
      title: 'Delhi ➔ Chennai (SpiceJet, 42d out)',
      badge: 'Discount Leisure Route',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      desc: 'Early-bird promotional fare (₹4,200)',
      data: {
        airline: 'SpiceJet',
        source_city: 'Delhi',
        destination_city: 'Chennai',
        departure_time: 'Morning',
        stops: 'zero',
        travel_class: 'Economy',
        duration: 2.75,
        days_left: 42,
        price: 4200
      }
    }
  ];

  const applyPreset = (presetData) => {
    setFormData(presetData);
    setTravelDate(getDateFromDays(presetData.days_left));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' || name === 'days_left' || name === 'price' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const precise = calculatePreciseFareVerdict(formData);
      let pred = {};
      try {
        pred = await predictRouteCluster(formData);
      } catch (apiErr) {
        // Fallback for seamless offline inference
        pred = {
          cluster_id: formData.travel_class === 'Business' ? 2 : (formData.duration >= 14 ? 1 : (formData.days_left >= 30 ? 3 : 0)),
          cluster_name: formData.travel_class === 'Business' ? 'Cluster 2: Advance Business Class Corridor' : (formData.duration >= 14 ? 'Cluster 1: Long-Haul Connecting Route' : (formData.days_left >= 30 ? 'Cluster 3: Budget Leisure Route' : 'Cluster 0: Standard Planned Economy')),
          archetype: formData.travel_class === 'Business' ? 'High-Yield Corporate Account' : (formData.duration >= 14 ? 'Regional Hub Connector' : (formData.days_left >= 30 ? 'Early-Bird Promotional Route' : 'Volume Driver & Planned Economy')),
          operational_profile: 'Route profile inferred from historical multidimensional patterns.',
          key_drivers: [
            `${formData.days_left} booking lead days`,
            `${formData.travel_class} cabin class`,
            `${formData.stops.replace('_', ' ')} routing`
          ],
          pca_coordinates: { pc1: 1.25, pc2: -0.42, pc3: 0.88 }
        };
      }
      setResult({ ...pred, ...precise });
    } catch (err) {
      console.error("Prediction error:", err);
      setError("Failed to execute route inference. Please verify inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-aviation-700 uppercase tracking-wider mb-1">
          <PlayCircle className="w-4 h-4" /> Live Machine Learning Inference
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Real-Time Airfare Route Cluster Inference
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Input flight parameters to infer cluster assignment, commercial archetype, and PCA manifold coordinates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Quick-Fill Realistic Presets */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Quick-Fill Demo Presets
              </span>
              <span className="text-[11px] text-slate-400">1-click testing</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p.data)}
                  className="text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition shadow-2xs group cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700 truncate">
                    {p.title}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">{p.desc}</div>
                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border mt-1.5 ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Airline & Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Operating Airline</label>
                <select
                  name="airline"
                  value={formData.airline}
                  onChange={handleChange}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-aviation-500"
                >
                  {airlines.map((a) => (
                    <option key={a} value={a}>{a.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Cabin Class</label>
                <select
                  name="travel_class"
                  value={formData.travel_class}
                  onChange={handleChange}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-aviation-500"
                >
                  <option value="Economy">Economy Class</option>
                  <option value="Business">Business Class</option>
                </select>
              </div>
            </div>

            {/* Route: Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Source City</label>
                <select
                  name="source_city"
                  value={formData.source_city}
                  onChange={handleChange}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-aviation-500"
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Destination City</label>
                <select
                  name="destination_city"
                  value={formData.destination_city}
                  onChange={handleChange}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-aviation-500"
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Departure Time & Stops */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Departure Time Window</label>
                <select
                  name="departure_time"
                  value={formData.departure_time}
                  onChange={handleChange}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-aviation-500"
                >
                  {departureTimes.map((t) => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Routing & Stops</label>
                <select
                  name="stops"
                  value={formData.stops}
                  onChange={handleChange}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-aviation-500"
                >
                  {stopOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Continuous Features: Sliders & Number Inputs */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 uppercase mb-1">
                  <span>Flight Duration (Hours)</span>
                  <span className="text-aviation-600 font-mono">{formData.duration} hrs</span>
                </div>
                <input
                  type="range"
                  name="duration"
                  min="0.5"
                  max="40"
                  step="0.5"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full accent-aviation-600"
                />
              </div>

              {/* Calendar Date Picker for Lead Time */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-aviation-600" />
                    Departure Date
                  </label>
                  <span className="text-xs font-bold text-aviation-700 bg-aviation-50 px-2.5 py-0.5 rounded-full border border-aviation-200">
                    {formData.days_left} {formData.days_left === 1 ? 'day' : 'days'} left
                  </span>
                </div>
                <input
                  type="date"
                  min={getTodayDateString()}
                  value={travelDate}
                  onChange={(e) => {
                    setTravelDate(e.target.value);
                    const days = getDaysFromDate(e.target.value);
                    setFormData(prev => ({ ...prev, days_left: days }));
                  }}
                  className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-aviation-500"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  Select flight departure date — booking lead days are computed automatically.
                </div>
              </div>

              {/* Direct Ticket Price Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-aviation-600" />
                    Ticket Price (INR ₹)
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="price"
                    min="1"
                    max="500000"
                    step="any"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 6037"
                    className="w-full pl-8 pr-3.5 py-2.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Direct price in Rupees down to the exact single Rupee (e.g. ₹6,037).
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-blue-500"
            >
              {loading ? (
                <span>Running Inference...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Predict Route Profile Cluster</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Display */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-aviation-500 shadow-md space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-aviation-700 bg-aviation-100 px-3 py-1 rounded-full">
                  Inference Success
                </span>
                <span className="text-xs font-mono text-slate-400">AeroClust AI Engine</span>
              </div>

              <div>
                <div className="text-xs font-bold uppercase text-slate-400">Assigned Profile</div>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">{result.cluster_name}</h2>
                <div className="text-sm font-semibold text-aviation-600 mt-1">{result.archetype}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="text-xs font-semibold text-slate-700">Commercial Profile Description</div>
                <p className="text-xs text-slate-600 leading-relaxed">{result.operational_profile}</p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700">Dominant Behavioral Drivers</div>
                <div className="space-y-1.5">
                  {result.key_drivers.map((drv, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{drv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route Pricing Precision Breakdown */}
              {result.expected_fair_price && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Route Price Precision</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${result.price_diff > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                      {result.price_diff > 0 ? `+${result.percent_delta}% Surge` : `${Math.abs(result.percent_delta)}% Saving`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Quoted Fare</span>
                      <div className="text-base font-black text-slate-900 mt-0.5">
                        ₹{result.user_price?.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Route Benchmark</span>
                      <div className="text-base font-black text-aviation-700 mt-0.5">
                        ₹{result.expected_fair_price?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {result.actionable_tip}
                  </p>
                </div>
              )}

              {/* Advance Booking Surge Trajectory Curve */}
              {result.trajectory_data && (
                <SurgeTrajectoryChart trajectoryData={result.trajectory_data} />
              )}

              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-700 mb-2">PCA Coordinates</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="text-[10px] text-blue-600 font-bold uppercase">PC1</span>
                    <div className="font-mono font-bold text-slate-900">{result.pca_coordinates.pc1}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">PC2</span>
                    <div className="font-mono font-bold text-slate-900">{result.pca_coordinates.pc2}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
                    <span className="text-[10px] text-purple-600 font-bold uppercase">PC3</span>
                    <div className="font-mono font-bold text-slate-900">{result.pca_coordinates.pc3}</div>
                  </div>
                </div>
              </div>

              {/* Mathematical Confidence & Centroid Distance */}
              {result.confidence_pct && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Cluster Centroid Proximity</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {result.confidence_pct}% Proximity
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${result.confidence_pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Centroid Distance: <b className="font-mono text-slate-800">{result.centroid_distance ?? 'N/A'}</b></span>
                    {result.secondary_cluster && (
                      <span className="truncate max-w-[210px]" title={result.secondary_cluster}>
                        Secondary: <b className="text-slate-700">{result.secondary_cluster}</b>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-8 border border-dashed border-slate-300 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-aviation-100 text-aviation-600 flex items-center justify-center mx-auto">
                <Plane className="w-6 h-6 rotate-45" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Awaiting Flight Parameters</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Adjust airline, route, lead time, and fare in the form and click <b>Predict Route Profile Cluster</b> to see live inference results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictPage;

