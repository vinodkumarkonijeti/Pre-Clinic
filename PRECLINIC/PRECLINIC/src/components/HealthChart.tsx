import React from 'react';

const HealthChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex-1">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Heart Rate Diagram</h3>
        <span className="text-[10px] text-slate-400 font-bold flex items-center">
          Connected - Apple watch series 9
          <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </span>
      </div>
      
      <div className="relative h-48 w-full">
        {/* Simple SVG Chart */}
        <svg viewBox="0 0 800 200" className="w-full h-full">
          {/* Grid lines */}
          {[0, 50, 100, 150, 200].map(y => (
            <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeWidth="1" />
          ))}
          
          {/* Area under the line */}
          <path 
            d="M 0 120 Q 50 110, 100 130 T 200 110 T 300 140 T 400 120 T 500 100 T 600 130 T 700 110 T 800 120 L 800 200 L 0 200 Z" 
            fill="url(#gradient)" 
            fillOpacity="0.1" 
          />
          
          {/* Line chart */}
          <path 
            d="M 0 120 Q 50 110, 100 130 T 200 110 T 300 140 T 400 120 T 500 100 T 600 130 T 700 110 T 800 120" 
            fill="none" 
            stroke="#1a8a9d" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a8a9d" />
              <stop offset="100%" stopColor="#fff" />
            </linearGradient>
          </defs>
          
          {/* Tooltip marker */}
          <circle cx="280" cy="135" r="5" fill="#1a8a9d" stroke="white" strokeWidth="2" shadow-sm />
        </svg>
        
        {/* Tooltip simulation */}
        <div className="absolute top-24 left-[32%] bg-[#0f172a] text-white p-2 rounded-lg text-[10px] shadow-xl z-10">
          <p className="font-bold">Physical Activity - Running</p>
          <p className="text-slate-400">08:00 AM - 11:45 AM</p>
        </div>
        
        {/* X-Axis Labels */}
        <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-bold px-2">
          <span>07:00</span>
          <span>09:00</span>
          <span>11:00</span>
          <span>01:00</span>
          <span>03:00</span>
          <span>05:00</span>
          <span>07:00</span>
          <span>09:00</span>
        </div>
      </div>
    </div>
  );
};

export default HealthChart;
