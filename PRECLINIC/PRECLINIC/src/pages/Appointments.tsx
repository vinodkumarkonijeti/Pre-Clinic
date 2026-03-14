import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import PatientSidebar from '../components/PatientSidebar';
import PatientHeader from '../components/PatientHeader';
import RecentAppointmentItem, { AppointmentRecord } from '../components/RecentAppointmentItem';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  concern: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  prescription?: string;
  createdAt: string;
}

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;
    
    const q = query(
      collection(db, 'appointments'), 
      where('patientId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
       const apps: Appointment[] = [];
       querySnapshot.forEach((doc) => {
         apps.push({ id: doc.id, ...doc.data() } as Appointment);
       });
       apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
       setAppointments(apps);
    });

    return () => unsubscribe();
  }, [user]);

  const mapAppointmentToRecord = (app: Appointment): AppointmentRecord => ({
    id: app.id,
    doctorName: app.doctorName,
    clinicName: "Primary Health Center",
    date: new Date(app.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    appointmentTime: new Date(app.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    status: app.status === 'accepted' ? 'On-going' : 
            app.status === 'completed' ? 'Completed' : 
            app.status === 'rejected' ? 'Canceled' : 'Pending'
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <PatientSidebar />
      
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <PatientHeader onScheduleClick={() => navigate('/patient-dashboard')} />
        
        <main className="p-8 flex-1">
          <button 
            onClick={() => navigate('/patient-dashboard')}
            className="flex items-center space-x-2 text-slate-400 hover:text-medical-dark transition mb-6 font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="max-w-5xl">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-blue-50 rounded-2xl text-medical-dark">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800">My Appointments</h2>
            </div>
            
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Appointment History</h3>
                <p className="text-sm text-slate-400">View and manage all your medical consultations</p>
              </div>
              
              <div className="divide-y divide-slate-50">
                {appointments.map(app => (
                  <div key={app.id} className="p-4 hover:bg-slate-50/50 transition">
                    <RecentAppointmentItem 
                      {...mapAppointmentToRecord(app)} 
                    />
                  </div>
                ))}
                
                {appointments.length === 0 && (
                  <div className="p-20 text-center">
                    <p className="text-slate-400 font-medium">No appointments found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Appointments;
