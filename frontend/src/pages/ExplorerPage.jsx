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
import { Database, Filter, Layers, DollarSign, Calendar, Clock } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import LoadingSpinner from '../components/LoadingSpinner';
import RouteNetworkMap from '../components/RouteNetworkMap';
import { getDatasetSummary } from '../services/api';

const airlineFareData = [
  { airline: 'AirAsia', Economy: 5591, Business: 0 },
  { airline: 'IndiGo', Economy: 5652, Business: 0 },
  { airline: 'GO FIRST', Economy: 5652, Business: 0 },
  { airline: 'SpiceJet', Economy: 6179, Business: 0 },
  { airline: 'Air India', Economy: 7339, Business: 47131 },
  { airline: 'Vistara', Economy: 7806, Business: 55527 },
];

const featureDescriptions = [
  { name: 'airline', type: 'Categorical', role: 'Feature', description: 'Operating carrier (SpiceJet, Air India, Vistara, IndiGo, AirAsia, GO FIRST)' },
  { name: 'source_city', type: 'Categorical', role: 'Feature', description: 'Origin metro departure city (Delhi, Mumbai, Bangalore, Kolkata, Hyderabad, Chennai)' },
  { name: 'departure_time', type: 'Categorical', role: 'Feature', description: 'Departure time band (Early Morning, Morning, Afternoon, Evening, Night, Late Night)' },
  { name: 'stops', type: 'Categorical', role: 'Feature', description: 'Number of layovers (zero, one, two or more)' },
  { name: 'arrival_time', type: 'Categorical', role: 'Diagnostic', description: 'Arrival time window at destination airport' },
  { name: 'destination_city', type: 'Categorical', role: 'Feature', description: 'Arrival destination metro city' },
  { name: 'class', type: 'Categorical', role: 'Feature', description: 'Cabin service tier (Economy vs Business Class)' },
  { name: 'duration', type: 'Continuous', role: 'Feature', description: 'Total flight travel time in decimal hours (0.8h to 49.8h)' },
  { name: 'days_left', type: 'Continuous', role: 'Feature', description: 'Booking lead time in integer days before flight departure (1 to 49 days)' },
  { name: 'price', type: 'Continuous', role: 'Target/Feature', description: 'Ticket price in Indian National Rupees (₹1,105 to ₹123,071)' },
];

const ExplorerPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getDatasetSummary();
        setSummary(data);
      } catch (err) {
        console.error("Failed to load dataset summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <LoadingSpinner message="Ingesting dataset statistics..." />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-aviation-700 uppercase tracking-wider mb-1">
          <Database className="w-4 h-4" /> Data Exploration & Cleaning
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Dataset Diagnostics & Statistical Profiles
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Structural inspection of the 300,153 Indian domestic aviation transaction records.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Flights"
          value="300,153"
          subtitle="Cleaned Records"
          icon={Database}
          color="blue"
        />
        <MetricCard
          title="Median Fare"
          value={`₹${summary?.median_price ? Number(summary.median_price).toLocaleString() : '7,425'}`}
          subtitle="IQR: ₹4,800 - ₹32,500"
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Avg Booking Lead Time"
          value={`${summary?.avg_lead_time || 26.0} Days`}
          subtitle="Range: 1 - 49 Days"
          icon={Calendar}
          color="purple"
        />
        <MetricCard
          title="Avg Flight Duration"
          value={`${summary?.avg_duration || 12.2} Hours`}
          subtitle="Connecting & Direct"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Interactive Indian Domestic Route Corridor Network Map */}
      <RouteNetworkMap />

      {/* Chart: Fare by Carrier & Class */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Average Ticket Fare by Airline and Cabin Tier (INR ₹)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full-Service Carriers (Air India, Vistara) exhibit distinct bimodal pricing driven by Business Class cabins.
          </p>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={airlineFareData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="airline" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip 
                formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Avg Fare']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend />
              <Bar dataKey="Economy" fill="#0284c7" radius={[4, 4, 0, 0]} name="Economy Class" />
              <Bar dataKey="Business" fill="#ef4444" radius={[4, 4, 0, 0]} name="Business Class" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Attributes Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Dataset Schema & Transformation Roles</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Features processed via scikit-learn ColumnTransformer (StandardScaler on continuous, OneHotEncoder on categorical).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Feature Name</th>
                <th className="py-3 px-4">Data Type</th>
                <th className="py-3 px-4">Pipeline Role</th>
                <th className="py-3 px-4">Description & Domain Domain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {featureDescriptions.map((feat) => (
                <tr key={feat.name} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 font-mono font-semibold text-aviation-800">{feat.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      feat.type === 'Continuous' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {feat.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{feat.role}</td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed">{feat.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExplorerPage;

