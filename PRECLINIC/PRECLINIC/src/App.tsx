import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Room from './pages/Room';
import Profile from './pages/Profile';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import Billing from './pages/Billing';
import Messages from './pages/Messages';
import Support from './pages/Support';
import Settings from './pages/Settings';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorAppointmentPage from './pages/DoctorAppointmentPage';
import DoctorPayment from './pages/DoctorPayment';
import DoctorProfile from './pages/DoctorProfile';
import DoctorSettings from './pages/DoctorSettings';
import PatientMedicalReports from './pages/PatientMedicalReports';

const RootRedirect: React.FC = () => {
  const { user, role, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) return <Navigate to="/login" />;
  
  if (user && !role) {
    // Wait for the role to be fetched from Firestore after login
    return (
      <div className="min-h-screen bg-medical-light flex items-center justify-center">
        <div className="text-medical-dark font-medium">Authenticating...</div>
      </div>
    );
  }
  
  if (role === 'doctor') return <Navigate to="/doctor-dashboard" />;
  if (role === 'patient') return <Navigate to="/patient-dashboard" />;
  
  return <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/patient-dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/appointments" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Appointments />
            </ProtectedRoute>
          } />

          <Route path="/prescriptions" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Prescriptions />
            </ProtectedRoute>
          } />

          <Route path="/billing" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Billing />
            </ProtectedRoute>
          } />

          <Route path="/messages" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Messages />
            </ProtectedRoute>
          } />

          <Route path="/support" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Support />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Settings />
            </ProtectedRoute>
          } />
          
          <Route path="/doctor-dashboard" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/doctor-appointments" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorAppointments />
            </ProtectedRoute>
          } />

          <Route path="/doctor-appointment-page" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorAppointmentPage />
            </ProtectedRoute>
          } />

          <Route path="/doctor-payment" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorPayment />
            </ProtectedRoute>
          } />

          <Route path="/doctor-profile" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorProfile />
            </ProtectedRoute>
          } />

          <Route path="/doctor-settings" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorSettings />
            </ProtectedRoute>
          } />
          
          <Route path="/room/:roomId" element={
            <ProtectedRoute>
              <Room />
            </ProtectedRoute>
          } />

          <Route path="/medical-reports" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientMedicalReports />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
