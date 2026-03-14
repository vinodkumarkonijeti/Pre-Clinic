import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import DoctorSidebar from '../components/DoctorSidebar';
import { Calendar, Clock, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  concern: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
}

const DoctorAppointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, 'appointments'), where('doctorId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
       const apps: Appointment[] = [];
       querySnapshot.forEach((doc) => {
         apps.push({ id: doc.id, ...doc.data() } as Appointment);
       });
       apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
       setAppointments(apps);
       setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <DoctorSidebar />
      <div className="flex-1 ml-[280px] flex flex-col min-h-screen">
        <header className="bg-white px-8 py-5 shadow-sm z-40 relative">
          <h1 className="text-2xl font-bold text-slate-800">All Appointments</h1>
        </header>
        <main className="flex-1 p-8">
          {loading ? (
            <div className="text-slate-500 text-center">Loading appointments...</div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
               {appointments.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">No appointments found.</div>
               ) : (
                 <div className="divide-y divide-slate-100">
                   {appointments.map(app => (
                     <div key={app.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                       <div>
                         <h3 className="text-lg font-bold text-slate-800">{app.patientName}</h3>
                         <p className="text-slate-600 text-sm mt-1 border-l-2 pl-3 border-blue-200">Concern: {app.concern}</p>
                         <div className="flex items-center space-x-4 mt-3 text-xs font-bold">
                           <span className="flex items-center text-slate-500">
                             <Calendar className="w-3 h-3 mr-1" />
                             {new Date(app.createdAt).toLocaleDateString()}
                           </span>
                           <span className="flex items-center text-slate-500">
                             <Clock className="w-3 h-3 mr-1" />
                             {new Date(app.createdAt).toLocaleTimeString()}
                           </span>
                         </div>
                       </div>
                       <div className="flex items-center space-x-3">
                         <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${
                            app.status === 'accepted' ? 'text-green-600 bg-green-100' :
                            app.status === 'rejected' ? 'text-red-600 bg-red-100' :
                            app.status === 'completed' ? 'text-slate-600 bg-slate-100' :
                            'text-yellow-600 bg-yellow-100'
                          }`}>
                            {app.status}
                         </span>
                         {app.status === 'accepted' && (
                           <button onClick={() => navigate(`/room/${app.id}`)} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                             <Video className="w-4 h-4" />
                           </button>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorAppointments;
