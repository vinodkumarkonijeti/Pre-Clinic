import React from 'react';
import PatientSidebar from '../components/PatientSidebar';
import PatientHeader from '../components/PatientHeader';
import { ArrowLeft, MessageSquare, Send, Search, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Messages: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <PatientSidebar />
      
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <PatientHeader onScheduleClick={() => navigate('/patient-dashboard')} />
        
        <main className="p-8 flex-1 flex flex-col">
          <button 
            onClick={() => navigate('/patient-dashboard')}
            className="flex items-center space-x-2 text-slate-400 hover:text-medical-dark transition mb-6 font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="max-w-6xl flex-1 flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex h-full min-h-[600px]">
              {/* Chat Sidebar */}
              <div className="w-80 border-r border-slate-50 flex flex-col">
                <div className="p-6 border-b border-slate-50">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Messages</h2>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search experts..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-medical-dark outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-300" />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 bg-blue-50/50 border-r-4 border-medical-dark flex items-center space-x-3 cursor-pointer">
                    <div className="w-12 h-12 bg-medical-dark rounded-full flex items-center justify-center text-white font-bold">D</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-slate-800 text-sm truncate">Dr. Atheeb</h4>
                        <span className="text-[10px] text-slate-400">10:45 AM</span>
                      </div>
                      <p className="text-xs text-medical-dark font-medium truncate">Sending your report now...</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat Content */}
              <div className="flex-1 flex flex-col bg-slate-50/10">
                <div className="p-6 border-b border-slate-50 bg-white flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-medical-dark rounded-xl flex items-center justify-center text-white font-bold">D</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Dr. Atheeb</h4>
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Online</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-slate-600 p-2">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 p-6 flex flex-col justify-end space-y-4">
                  <div className="max-w-[70%] bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-600">Hello, how can I help you today?</p>
                  </div>
                  <div className="max-w-[70%] self-end bg-medical-dark p-4 rounded-2xl rounded-tr-none shadow-md">
                    <p className="text-sm text-white">Hi Dr. Atheeb, I received my blood reports. Can you check them?</p>
                  </div>
                </div>
                
                <div className="p-6 bg-white border-t border-slate-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        placeholder="Type your message..." 
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-medical-dark outline-none"
                      />
                      <button className="absolute right-3 top-2 text-slate-300 hover:text-medical-dark p-1">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                    <button className="p-3 bg-medical-dark hover:bg-blue-800 text-white rounded-2xl shadow-lg shadow-teal-100 transition">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Messages;
