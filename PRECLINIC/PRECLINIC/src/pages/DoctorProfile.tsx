import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import DoctorSidebar from '../components/DoctorSidebar';
import { UserRound, Mail, Award, MapPin } from 'lucide-react';

const DoctorProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <DoctorSidebar />
      <div className="flex-1 ml-[280px] flex flex-col min-h-screen">
        <header className="bg-white px-8 py-5 shadow-sm z-40 relative">
          <h1 className="text-2xl font-bold text-slate-800">Doctor Profile</h1>
        </header>
        
        <main className="flex-1 p-8">
          {loading ? (
            <div className="text-slate-500 text-center">Loading profile...</div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
                 <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-700"></div>
                 <div className="px-8 pb-8 relative">
                   <div className="w-24 h-24 bg-white rounded-full p-2 absolute -top-12 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-4xl font-bold text-blue-600">
                     {profile?.name?.charAt(0).toUpperCase() || 'D'}
                   </div>
                   <div className="pt-16">
                     <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
                       <span>Dr. {profile?.name || 'Doctor'}</span>
                     </h2>
                     <p className="text-blue-600 font-bold text-sm uppercase tracking-wider mt-1">{profile?.specialty || 'General Physician'}</p>
                   </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Professional Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Specialty</p>
                        <p className="font-medium text-slate-800">{profile?.specialty || 'General Medicine'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <UserRound className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Role</p>
                        <p className="font-medium text-slate-800 capitalize">{profile?.role}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Registered Email</p>
                        <p className="font-medium text-slate-800">{profile?.email || user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Office Location</p>
                        <p className="font-medium text-slate-800">Main PreClinic Center</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorProfile;
