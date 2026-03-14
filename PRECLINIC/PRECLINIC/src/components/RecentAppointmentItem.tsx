import React from 'react';

export interface AppointmentRecord {
  id: string;
  doctorName: string;
  clinicName: string;
  date: string;
  appointmentTime: string;
  status: 'Completed' | 'Canceled' | 'Rescheduled' | 'On-going' | 'Pending';
  doctorImage?: string;
}

const RecentAppointmentItem: React.FC<AppointmentRecord> = ({ 
  doctorName, 
  clinicName, 
  date, 
  appointmentTime, 
  status,
  doctorImage 
}) => {
  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'Completed': return 'text-green-500 bg-green-50';
      case 'Canceled': return 'text-red-400 bg-red-50';
      case 'Rescheduled': return 'text-orange-400 bg-orange-50';
      case 'On-going': return 'text-blue-500 bg-blue-50';
      case 'Pending': return 'text-yellow-500 bg-yellow-50';
      default: return 'text-slate-400 bg-slate-50';
    }
  };

  return (
    <div className="flex items-center justify-between py-4 group cursor-pointer">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
          {doctorImage ? (
            <img src={doctorImage} alt={doctorName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xs">
              {doctorName.split(' ').map(n => n[0]).join('')}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">Dr. {doctorName} - {clinicName}</h4>
          <p className="text-[11px] text-slate-400 font-medium">{date} | {appointmentTime}</p>
        </div>
      </div>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(status)}`}>
        {status}
      </span>
    </div>
  );
};

export default RecentAppointmentItem;
