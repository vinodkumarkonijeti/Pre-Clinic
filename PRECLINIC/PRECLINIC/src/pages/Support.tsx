import React from 'react';
import PatientSidebar from '../components/PatientSidebar';
import PatientHeader from '../components/PatientHeader';
import { ArrowLeft, HelpCircle, MessageSquare, Phone, Mail, Globe, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Support: React.FC = () => {
  const navigate = useNavigate();

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

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex p-4 bg-blue-50 rounded-3xl text-medical-dark mb-6">
                <HelpCircle className="w-12 h-12" />
              </div>
              <h2 className="text-4xl font-bold text-slate-800 mb-4">How can we help you?</h2>
              <p className="text-slate-400 font-medium text-lg">Our dedicated support team is available 24/7 to assist you.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition duration-300">
                <div className="p-3 bg-teal-50 w-fit rounded-2xl text-[#1a8a9d] mb-6">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Live Chat</h3>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">Chat with our experts for immediate medical consultation or app support.</p>
                <button className="w-full py-3 bg-[#1a8a9d] text-white font-bold rounded-xl shadow-lg shadow-teal-50 hover:bg-teal-700 transition">Start Chatting</button>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition duration-300">
                <div className="p-3 bg-blue-50 w-fit rounded-2xl text-blue-600 mb-6">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Call Center</h3>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">Reach out to our emergency support line or general inquiries at any time.</p>
                <button className="w-full py-3 border-2 border-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">+1 (800) 123-4567</button>
              </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Help Center & FAQ</h3>
                  <p className="text-slate-400 text-sm font-medium">Browse our detailed articles and tutorials on using the portal.</p>
                </div>
                <button className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-white px-8 py-3 rounded-2xl font-bold transition">
                  <span>Visit Help Center</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-12 flex justify-center space-x-12 opacity-40">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-800">support@patient.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-800">www.patient-portal.com</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Support;
