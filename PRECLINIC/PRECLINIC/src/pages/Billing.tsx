import React from 'react';
import PatientSidebar from '../components/PatientSidebar';
import PatientHeader from '../components/PatientHeader';
import { ArrowLeft, CreditCard, Clock, CheckCircle, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Billing: React.FC = () => {
  const navigate = useNavigate();

  const transactions = [
    { id: 'INV-001', date: 'Oct 24, 2024', doctor: 'Dr. Atheeb', amount: '$150.00', status: 'paid' },
    { id: 'INV-002', date: 'Oct 15, 2024', doctor: 'Dr. Sarah', amount: '$75.00', status: 'paid' },
    { id: 'INV-003', date: 'Sept 28, 2024', doctor: 'Online Consultation', amount: '$45.00', status: 'pending' },
  ];

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
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800">Billing & Payments</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
                <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-2">Total Balance</p>
                <h3 className="text-4xl font-bold mb-6">$45.00</h3>
                <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition">Pay Now</button>
              </div>
              
              <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Active Insurance</h4>
                  <p className="text-sm text-slate-400 font-medium">Premium Health Guard • #8829-192</p>
                </div>
                <div className="flex space-x-2">
                  <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full border border-green-100">Verified</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50">
                <h3 className="font-bold text-slate-800">Transaction History</h3>
              </div>
              
              <div className="divide-y divide-slate-50">
                {transactions.map(tx => (
                  <div key={tx.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition duration-200">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-2xl ${tx.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        {tx.status === 'paid' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{tx.doctor}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{tx.id} • {tx.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-8">
                      <span className="font-bold text-slate-800">{tx.amount}</span>
                      <button className="text-slate-400 hover:text-medical-dark p-2 transition">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Billing;
