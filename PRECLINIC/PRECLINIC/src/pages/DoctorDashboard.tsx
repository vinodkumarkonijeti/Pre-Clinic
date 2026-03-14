import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Video, CheckCircle, XCircle, Clock, Users, Search, Mail, Bell, AlignRight, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DoctorSidebar from '../components/DoctorSidebar';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  concern: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  prescription?: string;
  createdAt: string;
}

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingPrescription, setEditingPrescription] = useState<string | null>(null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          // Fetch profile
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;

    // Listen for doctor's appointments
    const q = query(
      collection(db, 'appointments'), 
      where('doctorId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
       const apps: Appointment[] = [];
       querySnapshot.forEach((doc) => {
         apps.push({ id: doc.id, ...doc.data() } as Appointment);
       });
       // Sort locally by date descending
       apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
       setAppointments(apps);
       setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateAppointmentStatus = async (appointmentId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(appointmentId);
    try {
      const appRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appRef, { status });
    } catch (error) {
      console.error(`Error updating appointment to ${status}:`, error);
      alert('Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const savePrescription = async (appointmentId: string) => {
    if (!prescriptionText.trim()) return;
    setActionLoading(appointmentId);
    try {
      const appRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appRef, { prescription: prescriptionText });
      setEditingPrescription(null);
      setPrescriptionText('');
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Failed to save prescription.');
    } finally {
      setActionLoading(null);
    }
  };

  const startConsulting = (appointmentId: string) => {
    navigate(`/room/${appointmentId}`);
  };

  // --- DYNAMIC DATA CALCULATIONS ---
  
  // 1. Top Card Stats
  const uniquePatients = new Set(appointments.map(a => a.patientId));
  const totalPatientsCount = uniquePatients.size;
  
  const todayDateStr = new Date().toLocaleDateString();
  const todayAppointments = appointments.filter(a => new Date(a.createdAt).toLocaleDateString() === todayDateStr);
  const todayPatientsCount = new Set(todayAppointments.map(a => a.patientId)).size;
  const todayAppointmentsCount = todayAppointments.length;
  
  const pendingRequestsList = appointments.filter(a => a.status === 'pending');
  const acceptedConsultationsList = appointments.filter(a => a.status === 'accepted');

  // 2. Patient Summary (Pie Chart)
  const patientAppointmentCounts: Record<string, number> = {};
  appointments.forEach(a => {
    patientAppointmentCounts[a.patientId] = (patientAppointmentCounts[a.patientId] || 0) + 1;
  });
  let newPatientsCount = 0;
  let oldPatientsCount = 0;
  Object.values(patientAppointmentCounts).forEach(count => {
    if (count === 1) newPatientsCount++;
    else if (count > 1) oldPatientsCount++;
  });
  
  const newPatientPct = totalPatientsCount === 0 ? 0 : Math.round((newPatientsCount / totalPatientsCount) * 100);
  const oldPatientPct = totalPatientsCount === 0 ? 0 : Math.round((oldPatientsCount / totalPatientsCount) * 100);
  // Pie chart conic-gradient string: New(blue-800) Old(yellow-500)
  const pieGradient = totalPatientsCount === 0 
    ? 'conic-gradient(#e2e8f0 0% 100%)' 
    : `conic-gradient(#1e3a8a 0% ${newPatientPct}%, #eab308 ${newPatientPct}% 100%)`;

  // 3. Next Patient Details
  // Grab the "first" accepted appointment by closest to now. Since they are sorted descending, reverse search.
  const nextPatient = acceptedConsultationsList.length > 0 ? acceptedConsultationsList[acceptedConsultationsList.length - 1] : null;

  // 4. Calendar Logic
  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const currentDay = currentDate.getDate();
  
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay(); // 0(Sun) - 6(Sat)
  
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push('');
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <DoctorSidebar />
      
      <div className="flex-1 ml-[280px] flex flex-col min-h-screen">
        <header className="bg-white px-8 py-5 flex justify-between items-center shadow-sm z-40 relative">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4">
              <Mail className="w-5 h-5 text-slate-400 hover:text-slate-600 cursor-pointer" />
              <Bell className="w-5 h-5 text-slate-400 hover:text-slate-600 cursor-pointer" />
            </div>
            
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search" 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-64"
              />
            </div>
            
            <AlignRight className="w-5 h-5 text-slate-400 cursor-pointer md:hidden" />
          </div>
        </header>

        <main className="flex-1 p-8">
        {loading ? (
          <div className="text-slate-500 text-center p-8">Loading dashboard...</div>
        ) : (
          <div className="space-y-8">
              {/* Profile & Top Analytics Matching Image */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Profile Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 mb-4 border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-bold">
                    {profile?.name?.charAt(0).toUpperCase() || 'D'}
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">Dr. {profile?.name || 'Marttin Deo'}</h3>
                  <p className="text-blue-500 text-xs font-semibold mt-1 uppercase tracking-wider">
                    {profile?.specialty || 'MBBS, FCPS - MD (Medicine)'}
                  </p>
                </div>

                {/* Top Stat Cards */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Total Patient */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div className="w-16 h-16 rounded-full border-[3px] border-blue-600 flex items-center justify-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-sm font-medium">Total Patient</p>
                      <h4 className="text-3xl font-bold text-slate-800 my-1">{totalPatientsCount}</h4>
                      <p className="text-xs text-slate-400">Total Unique</p>
                    </div>
                  </div>

                  {/* Today Patient */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div className="w-16 h-16 rounded-full border-[3px] border-blue-600 flex items-center justify-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-sm font-medium">Today Patient</p>
                      <h4 className="text-3xl font-bold text-slate-800 my-1">{todayPatientsCount.toString().padStart(2, '0')}</h4>
                      <p className="text-xs text-slate-400">{todayDateStr}</p>
                    </div>
                  </div>

                  {/* Today Appointments */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div className="w-16 h-16 rounded-full border-[3px] border-blue-600 flex items-center justify-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <Clock className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-sm font-medium">Today Appointments</p>
                      <h4 className="text-3xl font-bold text-slate-800 my-1">{todayAppointmentsCount}</h4>
                      <p className="text-xs text-slate-400">{todayDateStr}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* New Widgets Row (Pie Chart, Patient List, Patient Details) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Patients Summary Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-500 mb-8">Patients Summary {currentMonthName} {currentYear}</h3>
                  <div className="flex flex-col items-center justify-center h-48 relative">
                    {/* CSS Only Pie Chart using conic-gradient */}
                    <div className="w-48 h-48 rounded-full shadow-inner relative" 
                         style={{ background: pieGradient }}>
                      {/* Inner white circle to make it a donut chart */}
                      <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                         <span className="text-2xl font-bold text-slate-800">{totalPatientsCount}</span>
                         <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-900 rounded-sm"></div>
                        <span className="text-sm font-semibold text-slate-600">New Patients</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800">{newPatientPct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                        <span className="text-sm font-semibold text-slate-600">Old Patients</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800">{oldPatientPct}%</span>
                    </div>
                  </div>
                </div>

                {/* Today Appointment List */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 relative max-h-[400px] overflow-y-auto">
                  <h3 className="text-blue-600 font-bold mb-6">Today Appointment</h3>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-4 px-2">
                    <span>Patient</span>
                    <span>Time</span>
                  </div>
                  
                  <div className="space-y-4">
                    {todayAppointments.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No appointments today.</p>
                    ) : (
                      todayAppointments.map(app => (
                        <div key={app.id} className="flex items-center justify-between p-2 rounded-xl bg-white shadow-sm border border-slate-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                               {app.patientName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{app.patientName}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[100px]">{app.concern}</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md">
                            {new Date(app.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Next Patient Details */}
                <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-blue-600 font-bold mb-6">Next Patient Details</h3>
                    
                    {nextPatient ? (
                      <>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl rounded-full border-2 border-white shadow-sm">
                              {nextPatient.patientName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-blue-900">{nextPatient.patientName}</p>
                              <p className="text-xs text-slate-500">{nextPatient.concern}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-blue-900">Appt ID</p>
                            <p className="text-[10px] text-slate-500 max-w-[80px] truncate">{nextPatient.id}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-y-4 text-sm mb-6 pb-6 border-b border-blue-100">
                          <div>
                            <p className="text-xs text-slate-500">D.O.B</p>
                            <p className="text-xs font-bold text-slate-800 mt-1">Pending</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Appt Date</p>
                            <p className="text-xs font-bold text-slate-800 mt-1">{new Date(nextPatient.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Weight</p>
                            <p className="text-xs font-bold text-slate-800 mt-1">Pending</p>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-blue-600 mb-3">Reported Condition</h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                          <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-md truncate max-w-full">
                            {nextPatient.concern}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500 py-8 text-center">No upcoming accepted appointments.</p>
                    )}
                  </div>

                  {nextPatient && (
                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => navigate(`/room/${nextPatient.id}`)} className="flex-1 bg-blue-600 text-white text-[10px] font-bold py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-blue-700">
                        <Video className="w-3 h-3" />
                        <span>Start Call</span>
                      </button>
                      <button className="flex-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-slate-50">
                        <FileText className="w-3 h-3" />
                        <span>Record</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Row Widgets (Reviews, Requests, Calendar) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Patients Review */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-500 mb-6">Patients Review</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="text-xs font-bold text-slate-500 w-16">Excellent</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mx-4">
                        <div className="h-full bg-blue-800 w-[70%] rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-bold text-slate-500 w-16">Great</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mx-4">
                        <div className="h-full bg-green-600 w-[40%] rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-bold text-slate-500 w-16">Good</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mx-4">
                        <div className="h-full bg-orange-500 w-[20%] rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-bold text-slate-500 w-16">Average</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mx-4">
                        <div className="h-full bg-cyan-400 w-[30%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Request visual matching */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 max-h-[400px] overflow-y-auto">
                  <h3 className="text-blue-600 font-bold mb-6 flex justify-between">
                    <span>Appointment Requests</span>
                    <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs">{pendingRequestsList.length}</span>
                  </h3>
                  <div className="space-y-4">
                    {pendingRequestsList.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No pending requests.</p>
                    ) : (
                      pendingRequestsList.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-white shadow-sm border border-slate-100">
                          <div className="flex items-center space-x-3">
                             <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                               {req.patientName.charAt(0).toUpperCase()}
                             </div>
                             <div>
                               <p className="text-sm font-bold text-blue-900">{req.patientName}</p>
                               <p className="text-xs text-slate-400 truncate max-w-[80px]">{req.concern}</p>
                             </div>
                          </div>
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => updateAppointmentStatus(req.id, 'accepted')}
                              disabled={actionLoading === req.id}
                              className="w-8 h-8 rounded bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-600 transition disabled:opacity-50"
                              title="Accept"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => updateAppointmentStatus(req.id, 'rejected')}
                              disabled={actionLoading === req.id}
                              className="w-8 h-8 rounded bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Calendar Widget */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-blue-600">Calendar</h3>
                    <span className="text-xs font-bold text-slate-500">{currentMonthName} {currentYear}</span>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="text-xs font-bold text-slate-800">{day}</div>
                    ))}
                    
                    {calendarDays.map((d, i) => (
                       <div key={i} className={`text-xs p-1 rounded-sm ${
                         d === currentDay ? 'bg-blue-600 text-white font-bold rounded-md shadow-sm' 
                         : d === '' ? 'text-transparent' 
                         : 'text-slate-500 font-medium hover:bg-slate-50 cursor-pointer transition'
                       }`}>
                         {d}
                       </div>
                    ))}
                  </div>
                </div>

              </div>
              
              <hr className="my-8 border-slate-200" />

              {/* ----- ORIGINAL APPOINTMENTS LIST (UNTOUCHED LOGIC) ----- */}
              <div className="mt-8 mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Old Implementation Real Data</h2>
                <p className="text-slate-500">The actual interactive real-time appointments block remains strictly below.</p>
              </div>

            {/* Appointments List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">Recent Appointments</h3>
              </div>
              
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No appointments scheduled.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {appointments.map(app => (
                    <div key={app.id} className="p-6 flex flex-col gap-4 hover:bg-slate-50/50 transition">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg font-semibold text-slate-800">{app.patientName}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${
                            app.status === 'accepted' ? 'text-green-600 bg-green-50 border-green-200' :
                            app.status === 'rejected' ? 'text-red-600 bg-red-50 border-red-200' :
                            app.status === 'completed' ? 'text-slate-600 bg-slate-50 border-slate-200' :
                            'text-yellow-600 bg-yellow-50 border-yellow-200'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mb-1"><span className="font-medium">Concern:</span> {app.concern}</p>
                        {app.message && <p className="text-slate-500 text-sm italic border-l-2 border-slate-200 pl-3 mt-2">"{app.message}"</p>}
                        <p className="text-xs text-slate-400 mt-2">Requested: {new Date(app.createdAt).toLocaleString()}</p>
                      </div>
                      
                      <div className="flex-shrink-0 flex space-x-2">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateAppointmentStatus(app.id, 'accepted')}
                              disabled={actionLoading === app.id}
                              className="bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-700 transition shadow-sm disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(app.id, 'rejected')}
                              disabled={actionLoading === app.id}
                              className="bg-red-50 text-red-600 border border-red-200 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-100 transition shadow-sm disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        
                        {app.status === 'accepted' && (
                          <button
                            onClick={() => startConsulting(app.id)}
                            className="bg-medical-dark text-white py-2 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-800 transition shadow-sm"
                          >
                            <Video className="w-5 h-5" />
                            <span>Start Call</span>
                          </button>
                        )}
                        
                        {app.status === 'rejected' && (
                          <div className="bg-slate-50 text-slate-400 py-2 px-6 rounded-lg flex items-center justify-center border border-slate-200">
                            <span>Closed</span>
                          </div>
                        )}
                        
                        {app.status === 'completed' && !app.prescription && editingPrescription !== app.id && (
                          <button
                            onClick={() => {
                              setEditingPrescription(app.id);
                              setPrescriptionText('');
                            }}
                            className="bg-blue-50 text-blue-700 border border-blue-200 py-2 px-4 rounded-lg hover:bg-blue-100 transition shadow-sm font-medium"
                          >
                            Write Prescription
                          </button>
                        )}
                        
                        {app.status === 'completed' && app.prescription && (
                          <div className="bg-green-50 text-green-700 py-2 px-6 rounded-lg border border-green-200 flex items-center justify-center font-medium">
                            <span>Closed</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Prescription Section */}
                    {(app.status === 'completed' && (app.prescription || editingPrescription === app.id)) && (
                      <div className="mt-2 pt-4 border-t border-slate-100">
                        {editingPrescription === app.id ? (
                          <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-700">Write Prescription</label>
                            <textarea
                              value={prescriptionText}
                              onChange={(e) => setPrescriptionText(e.target.value)}
                              placeholder="Enter medications, dosage, and instructions..."
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-medical-dark focus:border-medical-dark outline-none bg-white resize-vertical min-h-[100px]"
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setEditingPrescription(null)}
                                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => savePrescription(app.id)}
                                disabled={actionLoading === app.id || !prescriptionText.trim()}
                                className="px-6 py-2 bg-medical-dark text-white rounded-lg hover:bg-blue-800 transition font-medium disabled:opacity-50 flex items-center justify-center shadow-sm"
                              >
                                {actionLoading === app.id ? 'Saving...' : 'Save Prescription'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-2">Prescription</h4>
                            <div className="bg-blue-50/70 p-4 rounded-xl whitespace-pre-wrap text-slate-700 border border-blue-100 leading-relaxed">
                              {app.prescription}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                </div>
              )}
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
