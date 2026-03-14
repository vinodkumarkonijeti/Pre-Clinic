import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Activity, Droplets, Thermometer, Weight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// New Components
import PatientSidebar from '../components/PatientSidebar';
import PatientHeader from '../components/PatientHeader';
import StatCard from '../components/StatCard';
import AppointmentBanner from '../components/AppointmentBanner';
import HealthChart from '../components/HealthChart';
import RecentAppointmentItem, { AppointmentRecord } from '../components/RecentAppointmentItem';
import BookingModal from '../components/BookingModal';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

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

const CONCERNS = [
  "Fever", "Cold", "Cough", "Body Pains", "Headache", "Stomach Ache", "Skin Rash", "General Checkup", "Other"
];

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Booking Form State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedConcern, setSelectedConcern] = useState('');
  const [message, setMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
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
    const fetchDoctors = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
        const querySnapshot = await getDocs(q);
        const docsList: Doctor[] = [];
        querySnapshot.forEach((doc) => {
          docsList.push({ id: doc.id, ...doc.data() } as Doctor);
        });
        setDoctors(docsList);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    
    // Listen for patient's appointments
    const q = query(
      collection(db, 'appointments'), 
      where('patientId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
       const apps: Appointment[] = [];
       querySnapshot.forEach((doc) => {
         apps.push({ id: doc.id, ...doc.data() } as Appointment);
       });
       // Sort locally by date descending
       apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
       setAppointments(apps);
    });

    return () => unsubscribe();
  }, [user]);

  const bookAppointment = async (doctor: Doctor) => {
    if (!selectedConcern) {
      alert("Please select a concern first.");
      return;
    }
    
    setBookingLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: user?.uid,
        patientName: user?.displayName || user?.email?.split('@')[0] || 'Patient',
        doctorId: doctor.id,
        doctorName: doctor.name,
        concern: selectedConcern,
        message: message,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      alert('Appointment requested successfully! Waiting for doctor approval.');
      setSelectedConcern('');
      setMessage('');
      setIsBookingOpen(false);
    } catch (error) {
      console.error("Error booking appointment: ", error);
      alert("Failed to book appointment.");
    } finally {
      setBookingLoading(false);
    }
  };

  const mapAppointmentToRecord = (app: Appointment): AppointmentRecord => {
    const dateObj = new Date(app.createdAt);
    const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Mapping internal status to UI status
    const uiStatus = app.status === 'accepted' ? 'On-going' : 
                     app.status === 'completed' ? 'Completed' : 
                     app.status === 'rejected' ? 'Canceled' : 'Pending';

    return {
      id: app.id,
      doctorName: app.doctorName,
      clinicName: 'Main Clinic',
      date: date,
      appointmentTime: time,
      status: uiStatus as any
    };
  };

  const upcomingApp = appointments.find((a: Appointment) => a.status === 'accepted' || a.status === 'pending');

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = ['name', 'email', 'bloodPressure', 'heartRate', 'bloodSugar', 'weight', 'temperature'];
    const completedFields = fields.filter(field => !!profile[field]);
    return Math.round((completedFields.length / fields.length) * 100);
  };

  const completion = calculateCompletion();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <PatientSidebar completion={completion || 80} />
      
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <PatientHeader 
          onScheduleClick={() => setIsBookingOpen(true)} 
          profileName={profile?.name}
        />
        
        <main className="p-8 flex-1 flex flex-col">
          <div className="flex flex-col lg:flex-row gap-8 flex-1">
            
            {/* Left Content Column */}
            <div className="flex-1 space-y-8">
              {upcomingApp ? (
                <AppointmentBanner 
                  date={new Date(upcomingApp.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  time={new Date(upcomingApp.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                />
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-8 rounded-[2rem] border border-blue-50 text-center">
                  <p className="text-slate-500 font-medium">No upcoming appointments. Schedule one today to stay on top of your health!</p>
                </div>
              )}

              {/* Health Report Section */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Health Report <span className="text-slate-300 font-normal ml-2">- Last Checkup (March 07,2024)</span></h3>
                  <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400">
                    <Activity className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                  <StatCard icon={Droplets} label="Blood pressure" value={profile?.bloodPressure || "73"} unit="mmHg" color="bg-blue-500" />
                  <StatCard icon={Activity} label="Heart Rate" value={profile?.heartRate || "80"} unit="BPM" color="bg-red-500" />
                  <StatCard icon={Zap} label="Blood Sugar" value={profile?.bloodSugar || "110"} unit="mg/dL" color="bg-yellow-500" />
                  <StatCard icon={Weight} label="Weight" value={profile?.weight || "150"} unit="lbs" color="bg-green-500" />
                  <StatCard icon={Thermometer} label="Temperature" value={profile?.temperature || "98"} unit="C" color="bg-purple-500" />
                </div>
                
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold">
                    <span className="text-slate-400">Download Health Report - March 07, 2024</span>
                    <button className="text-[#1a8a9d] hover:underline flex items-center">
                      Download <Activity className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                  <button className="text-[#1a8a9d] font-bold text-xs hover:underline">View All Reports</button>
                </div>
              </div>

              {/* Heart Rate Chart */}
              <HealthChart />
            </div>

            {/* Right Sidebar Column */}
            <div className="w-full lg:w-80 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Recent Appointments</h3>
                <button className="p-1 hover:bg-slate-50 rounded text-slate-400">
                  <Activity className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 divide-y divide-slate-50">
                {appointments.slice(0, 6).map((app: Appointment) => (
                  <RecentAppointmentItem 
                    key={app.id} 
                    {...mapAppointmentToRecord(app)} 
                  />
                ))}
                
                {appointments.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-8">No records found</p>
                )}
              </div>
              
              <button 
                onClick={() => navigate('/patient-dashboard')} 
                className="w-full mt-6 text-[#1a8a9d] font-bold text-sm hover:underline text-left"
              >
                Show more
              </button>
            </div>
          </div>
        </main>
      </div>

      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        doctors={doctors}
        selectedConcern={selectedConcern}
        setSelectedConcern={setSelectedConcern}
        message={message}
        setMessage={setMessage}
        bookingLoading={bookingLoading}
        onBook={bookAppointment}
        concerns={CONCERNS}
      />
    </div>
  );
};

export default PatientDashboard;
