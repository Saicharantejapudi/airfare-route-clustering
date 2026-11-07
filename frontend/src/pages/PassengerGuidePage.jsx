import React from 'react';
import { 
  ShieldAlert, 
  Clock, 
  TrendingDown, 
  Calendar, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PassengerGuidePage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          The Passenger Survival Handbook
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How to Beat Airline Dynamic Pricing in India
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Airlines employ yield management algorithms to maximize revenue from your booking urgency.
          Here is how our unsupervised learning models recommend beating them.
        </p>
      </div>

      {/* 3 Core Rules */}
      <div className="space-y-6">
        {/* Rule 1 */}
        <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-lg">
            1
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Book Between Day 30 and Day 45 (The Leisure Bracket)</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our analysis of 300,153 flight records revealed that domestic airlines open their cheapest fare inventory (Cluster 3) between 30 and 45 days prior to departure. After day 28, airlines step up their booking classes (fare buckets), and prices rise steadily.
            </p>
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium mt-2">
              💡 <b>Rule of Thumb:</b> If you are planning a holiday, buy your tickets at least 4 weeks ahead. Booking 3 months ahead is not necessary, but booking inside 3 weeks will cost you ~35% more.
            </div>
          </div>
        </div>

        {/* Rule 2 */}
        <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 font-bold text-lg">
            2
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Avoid the 96-Hour Departure Cliff (The Emergency Trap)</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Inside 4 days (96 hours) before departure, airlines assume that anybody booking a ticket has an urgent business, family, or medical emergency and has zero price sensitivity. Algorithms activate surge multipliers, routinely charging ₹14,000–₹22,000 for standard 2-hour flights.
            </p>
            <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl font-medium mt-2">
              ⚠️ <b>Money-Saving Hack:</b> If you must travel last-minute, check if an early morning flight on a competing low-cost carrier (IndiGo, SpiceJet) or shifting your flight by even 48 hours brings you out of the surge multiplier.
            </div>
          </div>
        </div>

        {/* Rule 3 */}
        <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold text-lg">
            3
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Always Calculate Your Hourly Layover Cost</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Connecting flights (Cluster 1) often look cheaper on search engines. However, our model shows that a flight saving ₹1,500 often adds 14 hours of layover waiting in Delhi or Mumbai. You end up spending that ₹1,500 on airport food, coffee, or a transit lounge anyway.
            </p>
            <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl font-medium mt-2">
              ⏱️ <b>Value Metric:</b> If a direct flight costs only ₹1,500 to ₹2,500 more than a 15-hour connecting flight, take the direct flight every single time.
            </div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 bg-slate-900 text-white rounded-3xl text-center space-y-4">
        <h3 className="text-xl font-bold">Have a flight ticket in mind right now?</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Test it with our live AI detector to see if it’s currently in an early-bird window or a surge trap.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-aviation-500 hover:bg-aviation-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition"
        >
          <Sparkles className="w-4 h-4" />
          Test Your Flight Ticket Now
        </Link>
      </div>
    </div>
  );
};

export default PassengerGuidePage;

