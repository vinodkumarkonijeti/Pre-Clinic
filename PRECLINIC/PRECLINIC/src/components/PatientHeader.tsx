import React from 'react';
import { Bell, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

interface PatientHeaderProps {
  onScheduleClick: () => void;
  profileName?: string;
}

const PatientHeader: React.FC<PatientHeaderProps> = ({ onScheduleClick, profileName }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = profileName || user?.displayName || 'User';

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <h1 className="text-2xl font-bold text-slate-800">Health Dashboard</h1>
        <p className="text-sm text-slate-400">Welcome back, {displayName}!</p>
      </div>
      
      <div className="flex items-center space-x-6">
        <button 
          onClick={onScheduleClick}
          className="bg-[#1a8a9d] hover:bg-[#146f7e] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 transition shadow-sm"
        >
          <span>Schedule Appointment</span>
          <Plus className="w-4 h-4" />
        </button>
        
        <div className="relative cursor-pointer group">
          <div className="p-2.5 bg-slate-50 rounded-full text-slate-400 group-hover:text-slate-600 transition">
            <Bell className="w-5 h-5" />
          </div>
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </div>
        
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-medical-dark text-white font-bold">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">{displayName}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patient</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default PatientHeader;
