import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Pill, 
  CreditCard, 
  MessageSquare, 
  HelpCircle, 
  Settings,
  Heart,
  LogOut as LogOutIcon
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  count?: number;
  active?: boolean;
  to?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, count, active, to = '#' }) => (
  <Link to={to} className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-all duration-200 group ${
    active ? 'border-r-4 border-medical-dark bg-blue-50/50' : 'hover:bg-slate-50'
  }`}>
    <div className="flex items-center space-x-3">
      <Icon className={`w-5 h-5 ${active ? 'text-medical-dark' : 'text-slate-400 group-hover:text-slate-600'}`} />
      <span className={`font-medium ${active ? 'text-medical-dark' : 'text-slate-600 group-hover:text-slate-900'}`}>{label}</span>
    </div>
    {count !== undefined && (
      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
        active ? 'bg-medical-dark text-white' : 'bg-blue-100 text-medical-dark'
      }`}>
        {count}
      </span>
    )}
  </Link>
);

interface PatientSidebarProps {
  completion?: number;
}

const PatientSidebar: React.FC<PatientSidebarProps> = ({ completion = 80 }) => {
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

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 mb-4">
        <div className="flex items-center space-x-2 text-medical-dark">
          <div className="p-1.5 bg-medical-dark text-white rounded-lg">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Patient</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Health Portal</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto pt-4">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/patient-dashboard" active={location.pathname === '/patient-dashboard'} />
        <SidebarItem icon={Calendar} label="Appointments" to="/appointments" active={location.pathname === '/appointments'} />
        <SidebarItem icon={FileText} label="Medical Records" to="/profile" active={location.pathname === '/profile'} />
        <SidebarItem icon={FileText} label="Medical Reports" to="/medical-reports" active={location.pathname === '/medical-reports'} />
        <SidebarItem icon={Pill} label="Prescriptions" to="/prescriptions" active={location.pathname === '/prescriptions'} />
        <SidebarItem icon={CreditCard} label="Billing & Payments" to="/billing" active={location.pathname === '/billing'} />
        <SidebarItem icon={MessageSquare} label="Messages" to="/messages" active={location.pathname === '/messages'} />
      </nav>
      
      <div className="p-4 border-t border-slate-50 space-y-1">
        <SidebarItem icon={HelpCircle} label="Support" to="/support" active={location.pathname === '/support'} />
        <SidebarItem icon={Settings} label="Settings" to="/settings" active={location.pathname === '/settings'} />
        
        <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-medical-dark">Health Profile</span>
          </div>
          <p className="text-[10px] text-slate-500 mb-2">You're at {completion}% of your Profile.</p>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
            <div className="bg-medical-dark h-1.5 rounded-full" style={{ width: `${completion}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-bold">
            <button className="text-slate-400 hover:text-slate-600">Dismiss</button>
            <Link to="/profile" className="text-medical-dark hover:underline">View Profile</Link>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-6 py-3 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 mt-4 rounded-xl"
        >
          <LogOutIcon className="w-5 h-5" />
          <span className="font-bold text-sm tracking-tight">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default PatientSidebar;
