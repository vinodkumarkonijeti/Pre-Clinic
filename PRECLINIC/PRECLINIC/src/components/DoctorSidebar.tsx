import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  CreditCard, 
  User, 
  Settings, 
  LogOut,
  Stethoscope
} from 'lucide-react';
import { auth } from '../lib/firebase';

const DoctorSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const SidebarItem = ({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active: boolean }) => (
    <NavLink
      to={to}
      className={`sidebar-item flex items-center space-x-3 px-6 py-3.5 mx-2 my-1 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-blue-50 text-medical-dark font-bold shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-medical-dark' : 'text-slate-400'}`} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside className="w-[280px] bg-white h-screen fixed left-0 top-0 border-r border-slate-100 flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Logo Area */}
      <div className="p-6 pb-2">
        <div className="flex items-center space-x-2 text-medical-dark mb-8">
          <Stethoscope className="w-8 h-8" />
          <span className="text-2xl font-bold tracking-tight">Doctor</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pt-2 space-y-1">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/doctor-dashboard" active={location.pathname === '/doctor-dashboard'} />
        <SidebarItem icon={Calendar} label="Appointment" to="/doctor-appointments" active={location.pathname === '/doctor-appointments'} />
        <SidebarItem icon={FileText} label="Appointment Page" to="/doctor-appointment-page" active={location.pathname === '/doctor-appointment-page'} />
        <SidebarItem icon={CreditCard} label="Payment" to="/doctor-payment" active={location.pathname === '/doctor-payment'} />
        <SidebarItem icon={User} label="Profile" to="/doctor-profile" active={location.pathname === '/doctor-profile'} />
        <SidebarItem icon={Settings} label="Settings" to="/doctor-settings" active={location.pathname === '/doctor-settings'} />
      </nav>

      <div className="p-4 border-t border-slate-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-6 py-3.5 mx-2 my-1 rounded-xl transition-all duration-300 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DoctorSidebar;
