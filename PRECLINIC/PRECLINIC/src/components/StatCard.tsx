import React from 'react';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, unit, color }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 border-r border-slate-100 last:border-r-0">
      <div className={`p-3 rounded-full mb-3 ${color} bg-opacity-10 shadow-sm ring-1 ring-slate-100`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-baseline space-x-1">
        <span className="text-lg font-bold text-slate-800">{value}</span>
        <span className="text-[10px] text-slate-400 font-bold">{unit}</span>
      </div>
    </div>
  );
};

export default StatCard;
