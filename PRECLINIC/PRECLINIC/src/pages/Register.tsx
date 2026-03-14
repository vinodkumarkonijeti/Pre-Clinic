import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { Stethoscope, UserRound } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [specialty, setSpecialty] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user details to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        ...(role === 'doctor' && { specialty }),
        createdAt: new Date().toISOString()
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (role === 'doctor' && !specialty) {
      setError('Please enter your specialty before signing up with Google.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Save or update user details to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: user.displayName || name || 'User',
        email: user.email,
        role,
        ...(role === 'doctor' && { specialty }),
        createdAt: new Date().toISOString()
      }, { merge: true });

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to register with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-medical-light flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">Create Account</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex space-x-4 mb-2">
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 border ${role === 'patient' ? 'bg-blue-50 border-medical-dark text-medical-dark shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              onClick={() => setRole('patient')}
            >
              <UserRound className="w-4 h-4" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 border ${role === 'doctor' ? 'bg-blue-50 border-medical-dark text-medical-dark shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              onClick={() => setRole('doctor')}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-medical-dark focus:border-medical-dark outline-none transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-medical-dark focus:border-medical-dark outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {role === 'doctor' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
              <input
                type="text"
                required
                placeholder="e.g. Cardiologist, General Physician"
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-medical-dark focus:border-medical-dark outline-none transition"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-medical-dark focus:border-medical-dark outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-medical-dark text-white py-2 px-4 rounded-md hover:bg-blue-800 transition font-medium flex justify-center mt-2 disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Sign Up with Email'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
          <span className="border-b border-slate-200 w-1/5 lg:w-1/4"></span>
          <span className="text-xs text-center text-slate-500 uppercase">or sign up with</span>
          <span className="border-b border-slate-200 w-1/5 lg:w-1/4"></span>
        </div>

        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={loading}
          className="w-full mt-4 border border-slate-300 bg-white text-slate-700 py-2 px-4 rounded-md hover:bg-slate-50 transition font-medium flex justify-center items-center space-x-2 disabled:opacity-70"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
          <span>Google</span>
        </button>
        
        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-medical-dark hover:underline font-medium">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
