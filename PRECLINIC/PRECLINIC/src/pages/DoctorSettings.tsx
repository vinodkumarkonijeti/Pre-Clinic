import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updateEmail, 
  updatePassword 
} from 'firebase/auth';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import DoctorSidebar from '../components/DoctorSidebar';
import { Save, Lock, Mail, UserRound, CheckCircle, AlertCircle } from 'lucide-react';

const DoctorSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'email' | 'password'>('profile');
  
  // Profile State
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  
  // Email State
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || '');
            setSpecialty(data.specialty || '');
          }
        } catch (error) {
          console.error("Error fetching profile", error);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setLoading(true);
    setMessage(null);
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { name, specialty });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    setLoading(true);
    setMessage(null);
    try {
      const credential = EmailAuthProvider.credential(user.email, emailPassword);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, newEmail);
      
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { email: newEmail });
      
      setMessage({ type: 'success', text: 'Email updated successfully!' });
      setNewEmail('');
      setEmailPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update email.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: 'New passwords do not match.' });
    }
    setLoading(true);
    setMessage(null);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <DoctorSidebar />
      <div className="flex-1 ml-[280px] flex flex-col min-h-screen">
        <header className="bg-white px-8 py-5 shadow-sm z-40 relative">
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        </header>

        <main className="flex-1 p-8 max-w-4xl">
          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 text-sm font-bold ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            
            {/* Settings Tabs Sidebar */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-2">
              <button 
                onClick={() => { setActiveTab('profile'); setMessage(null); }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
                  activeTab === 'profile' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <UserRound className="w-5 h-5" />
                <span className="font-bold text-sm">Edit Profile</span>
              </button>
              <button 
                onClick={() => { setActiveTab('email'); setMessage(null); }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
                  activeTab === 'email' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <Mail className="w-5 h-5" />
                <span className="font-bold text-sm">Change Email</span>
              </button>
              <button 
                onClick={() => { setActiveTab('password'); setMessage(null); }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
                  activeTab === 'password' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="font-bold text-sm">Security</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-6">Profile Settings</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Specialty</label>
                      <input 
                        type="text" 
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50"
                        placeholder="e.g. General Physician, Cardiologist"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-bold shadow-sm disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Email Tab */}
              {activeTab === 'email' && (
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-6">Change Registered Email</h2>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6 flex items-start space-x-3 text-sm text-slate-600">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p>Changing your email requires you to enter your current password to verify your identity. You will use your new email to log in.</p>
                  </div>
                  <form onSubmit={handleUpdateEmail} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">New Email Address</label>
                      <input 
                        type="email" 
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                      <input 
                        type="password" 
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50"
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-bold shadow-sm disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Email'}
                    </button>
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-6">Change Password</h2>
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50"
                        minLength={6}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50"
                        minLength={6}
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-bold shadow-sm disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorSettings;
