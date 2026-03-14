import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import DoctorSidebar from '../components/DoctorSidebar';
import { Calendar, Stethoscope } from 'lucide-react';

interface AppointmentType {
  id: string;
  patientName: string;
  createdAt: string;
}

const DoctorAppointmentPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchApps = async () => {
      const q = query(collection(db, 'appointments'), where('doctorId', '==', user.uid));
      const snap = await getDocs(q);
      const apps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppointmentType));
      setAppointments(apps);
      setLoading(false);
    };
    fetchApps();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <DoctorSidebar />
      <div className="flex-1 ml-[280px] flex flex-col min-h-screen">
        <header className="bg-white px-8 py-5 shadow-sm z-40 relative">
          <h1 className="text-2xl font-bold text-slate-800">Appointment Management</h1>
        </header>
        <main className="flex-1 p-8">
           <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
             <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
               <div className="p-4 bg-blue-50 rounded-xl">
                 <Stethoscope className="w-8 h-8 text-blue-600" />
               </div>
               <div>
                 <h2 className="text-xl font-bold text-slate-800">Your Schedule</h2>
                 <p className="text-slate-500 text-sm">Review all booked slots and daily routing.</p>
               </div>
             </div>

             {loading ? (
                <div className="text-slate-500">Loading schedule...</div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {appointments.map(app => (
                    <div key={app.id} className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl hover:shadow-md transition">
                      <h3 className="font-bold text-slate-800">{app.patientName}</h3>
                      <div className="flex items-center text-slate-500 text-sm mt-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <p className="text-slate-500 text-sm">No scheduled slots.</p>
                  )}
                </div>
             )}
           </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorAppointmentPage;
