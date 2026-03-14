import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Activity, Droplets, Thermometer, Weight, Ruler, Calendar as CalcIcon, Save, ArrowLeft, Heart } from 'lucide-react';
import PatientSidebar from '../components/PatientSidebar';
import PatientHeader from '../components/PatientHeader';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    bloodPressure: '',
    heartRate: '',
    bloodSugar: '',
    temperature: '98'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({
              name: data.name || '',
              age: data.age || '',
              height: data.height || '',
              weight: data.weight || '',
              bloodPressure: data.bloodPressure || '',
              heartRate: data.heartRate || '',
              bloodSugar: data.bloodSugar || '',
              temperature: data.temperature || '98'
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, profile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletion = () => {
    const fields = Object.values(profile);
    const completed = fields.filter(f => !!f).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-medical-dark font-bold animate-pulse">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <PatientSidebar completion={calculateCompletion()} />
      
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <PatientHeader 
          onScheduleClick={() => navigate('/patient-dashboard')} 
          profileName={profile.name}
        />
        
        <main className="p-8 flex-1">
          <button 
            onClick={() => navigate('/patient-dashboard')}
            className="flex items-center space-x-2 text-slate-400 hover:text-medical-dark transition mb-6 font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold text-slate-800 mb-8">My Health Profile</h2>
            
            <form onSubmit={handleUpdate} className="space-y-8">
              {/* Personal Information */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-xl text-medical-dark">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-medical-dark outline-none font-medium"
                      value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Age</label>
                    <div className="relative">
                      <input 
                        type="number"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-medical-dark outline-none font-medium"
                        value={profile.age}
                        onChange={e => setProfile({...profile, age: e.target.value})}
                      />
                      <CalcIcon className="absolute right-4 top-3.5 w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Height (cm)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-medical-dark outline-none font-medium"
                        value={profile.height}
                        onChange={e => setProfile({...profile, height: e.target.value})}
                      />
                      <Ruler className="absolute right-4 top-3.5 w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-red-50 rounded-xl text-red-500">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Vital Signs & Vitals</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weight (lbs)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-medical-dark outline-none font-medium"
                        value={profile.weight}
                        onChange={e => setProfile({...profile, weight: e.target.value})}
                      />
                      <Weight className="absolute right-4 top-3.5 w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Blood Pressure</label>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="e.g. 120/80"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-medical-dark outline-none font-medium"
                        value={profile.bloodPressure}
                        onChange={e => setProfile({...profile, bloodPressure: e.target.value})}
                      />
                      <Droplets className="absolute right-4 top-3.5 w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Heart Rate (BPM)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-medical-dark outline-none font-medium"
                        value={profile.heartRate}
                        onChange={e => setProfile({...profile, heartRate: e.target.value})}
                      />
                      <Activity className="absolute right-4 top-3.5 w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Temperature (C)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-medical-dark outline-none font-medium"
                        value={profile.temperature}
                        onChange={e => setProfile({...profile, temperature: e.target.value})}
                      />
                      <Thermometer className="absolute right-4 top-3.5 w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-[#1a8a9d] hover:bg-[#146f7e] text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-2 transition shadow-lg shadow-teal-100 disabled:opacity-70"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? 'Saving Changes...' : 'Save Health Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
