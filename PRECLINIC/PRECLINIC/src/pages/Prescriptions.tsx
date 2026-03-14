import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import PatientSidebar from '../components/PatientSidebar';
import PatientHeader from '../components/PatientHeader';
import { ArrowLeft, Pill, Download, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  concern: string;
  status: string;
  prescription?: string;
  createdAt: string;
}

const Prescriptions: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;
    
    // Fetch only appointments with prescriptions
    const q = query(
      collection(db, 'appointments'), 
      where('patientId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
       const apps: Appointment[] = [];
       querySnapshot.forEach((doc) => {
         const data = doc.data();
         if (data.prescription) {
           apps.push({ id: doc.id, ...data } as Appointment);
         }
       });
       apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
       setAppointments(apps);
    });

    return () => unsubscribe();
  }, [user]);

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
              <div className="p-3 bg-teal-50 rounded-2xl text-[#1a8a9d]">
                <Pill className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800">My Prescriptions</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {appointments.map(app => (
                <div key={app.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:border-teal-100 transition duration-300">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">Prescription from Dr. {app.doctorName}</h3>
                      <p className="text-sm text-slate-400 font-medium">
                        For {app.concern} • {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <button className="flex items-center space-x-2 bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-[#1a8a9d] px-4 py-2 rounded-xl transition duration-200">
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-bold">Download PDF</span>
                    </button>
                  </div>
                  
                  <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
                    <div className="flex items-center space-x-2 mb-4 text-slate-800">
                      <FileText className="w-4 h-4 text-[#1a8a9d]" />
                      <span className="text-sm font-bold uppercase tracking-wider">Instructions & Medications</span>
                    </div>
                    <div className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                      {app.prescription}
                    </div>
                  </div>
                </div>
              ))}
              
              {appointments.length === 0 && (
                <div className="bg-white p-20 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                  <div className="inline-flex p-4 bg-slate-50 rounded-2xl text-slate-300 mb-4">
                    <Pill className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">No prescriptions yet</h3>
                  <p className="text-slate-400 font-medium">Once a doctor writes a prescription after your consultation, it will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Prescriptions;
