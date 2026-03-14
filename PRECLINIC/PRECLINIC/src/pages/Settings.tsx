import React, { useState, useEffect } from 'react';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import PatientSidebar from '../components/PatientSidebar';
import PatientHeader from '../components/PatientHeader';
import { ArrowLeft, User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'email' | 'password'>('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile Form State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');

  // Email Form State
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileName(data.name || '');
            setProfilePhone(data.phone || '');
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const clearMessages = () => {
    setSuccess('');
    setError('');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setLoading(true);
    clearMessages();
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: profileName,
        phone: profilePhone,
        updatedAt: new Date().toISOString()
      });
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const reauthenticate = async (password: string) => {
    if (!user || !user.email) throw new Error("User not found.");
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    clearMessages();

    try {
      await reauthenticate(emailPassword);
      await updateEmail(user, newEmail);
      
      // Update email in Firestore as well for consistency
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { email: newEmail });

      setSuccess('Email updated successfully!');
      setNewEmail('');
      setEmailPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update email.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    setLoading(true);
    clearMessages();

    try {
      await reauthenticate(currentPassword);
      await updatePassword(user, newPassword);
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(id); clearMessages(); }}
      className={`flex items-center space-x-3 px-6 py-4 border-b-2 sm:border-b-0 sm:border-r-2 w-full transition-colors ${
        activeTab === id 
          ? 'border-medical-dark text-medical-dark bg-blue-50/50 font-bold' 
          : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <PatientSidebar />
      
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <PatientHeader onScheduleClick={() => navigate('/patient-dashboard')} profileName={profileName} />
        
        <main className="p-8 flex-1">
          <button 
            onClick={() => navigate('/patient-dashboard')}
            className="flex items-center space-x-2 text-slate-400 hover:text-medical-dark transition mb-6 font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold text-slate-800 mb-8">Account Settings</h2>
            
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col sm:flex-row min-h-[500px]">
              
              {/* Settings Navigation */}
              <div className="w-full sm:w-64 bg-slate-50/50 flex flex-row sm:flex-col border-b sm:border-b-0 sm:border-r border-slate-100">
                <TabButton id="profile" icon={User} label="Edit Profile" />
                <TabButton id="email" icon={Mail} label="Change Email" />
                <TabButton id="password" icon={Lock} label="Security" />
              </div>

              {/* Settings Content */}
              <div className="flex-1 p-8 sm:p-12">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center space-x-3 border border-red-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl flex items-center space-x-3 border border-green-100">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{success}</p>
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Personal Information</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-dark focus:border-transparent outline-none transition"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-dark focus:border-transparent outline-none transition"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-[#1a8a9d] text-white rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-50 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save ProfileChanges'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Email Tab */}
                {activeTab === 'email' && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Change Email Address</h3>
                    <p className="text-slate-500 text-sm mb-6">Your current email is <strong>{user?.email}</strong></p>
                    <form onSubmit={handleUpdateEmail} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">New Email Address</label>
                        <input
                          type="email"
                          required
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-dark focus:border-transparent outline-none transition"
                          placeholder="new.email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                        <p className="text-xs text-slate-400 mb-2">Required to verify your identity before changing your email.</p>
                        <input
                          type="password"
                          required
                          value={emailPassword}
                          onChange={(e) => setEmailPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-dark focus:border-transparent outline-none transition"
                          placeholder="Enter your current password"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-[#1a8a9d] text-white rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-50 disabled:opacity-50"
                      >
                        {loading ? 'Updating...' : 'Update Email'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Change Password</h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-dark focus:border-transparent outline-none transition"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-dark focus:border-transparent outline-none transition"
                          placeholder="Enter new password (min 6 characters)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-dark focus:border-transparent outline-none transition"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-[#1a8a9d] text-white rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-50 disabled:opacity-50"
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
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

export default Settings;
