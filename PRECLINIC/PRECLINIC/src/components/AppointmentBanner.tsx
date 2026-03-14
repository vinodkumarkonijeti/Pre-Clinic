import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface AppointmentBannerProps {
  date: string;
  time: string;
}

const AppointmentBanner: React.FC<AppointmentBannerProps> = ({ date, time }) => {
  return (
    <div className="bg-gradient-to-r from-[#eef2ff] to-[#f0f9ff] p-8 rounded-[2rem] border border-blue-50 relative overflow-hidden mb-8">
      {/* Abstract background shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-100/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
      
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Stay Informed! Upcoming Appointment Details</h2>
        <div className="flex flex-wrap gap-6 text-slate-600 font-medium">
          <div className="flex items-center space-x-2 bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm">
            <Calendar className="w-4 h-4 text-[#1a8a9d]" />
            <span className="text-sm">{date}</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm">
            <Clock className="w-4 h-4 text-[#1a8a9d]" />
            <span className="text-sm">{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBanner;
