import React from 'react';

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue', badge }) => {
  const colorMap = {
    blue: 'border-blue-500 bg-blue-50 text-blue-700',
    green: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    purple: 'border-purple-500 bg-purple-50 text-purple-700',
    amber: 'border-amber-500 bg-amber-50 text-amber-700',
    rose: 'border-rose-500 bg-rose-50 text-rose-700',
  };

  const badgeColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-sm transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${badgeColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      {(subtitle || badge) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span>{subtitle}</span>}
          {badge && <span className={`px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricCard;

