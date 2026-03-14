import React from 'react';
import { X, CalendarPlus } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  selectedConcern: string;
  setSelectedConcern: (val: string) => void;
  message: string;
  setMessage: (val: string) => void;
  bookingLoading: boolean;
  onBook: (doctor: Doctor) => void;
  concerns: string[];
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  doctors, 
  selectedConcern, 
  setSelectedConcern, 
  message, 
  setMessage, 
  bookingLoading, 
  onBook,
  concerns
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-[#1a8a9d]">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <CalendarPlus className="w-6 h-6 mr-3" />
            Schedule Appointment
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          {/* Step 1: Concern */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4">1. What is your primary concern?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {concerns.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedConcern(c)}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                    selectedConcern === c 
                      ? 'bg-blue-50 border-[#1a8a9d] text-[#1a8a9d]' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </section>

          {/* Step 2: Message */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4">2. Additional Message (Optional)</h3>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your symptoms briefly..."
              className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#1a8a9d] focus:border-[#1a8a9d] outline-none bg-slate-50 resize-none h-32 transition-all font-medium text-slate-700"
            ></textarea>
          </section>

          {/* Step 3: Select Doctor */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4">3. Select Available Doctor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No doctors available at the moment.
                </div>
              ) : (
                doctors.map(doctor => (
                  <div key={doctor.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between group hover:bg-white hover:shadow-md transition">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 text-[#1a8a9d] rounded-full flex items-center justify-center font-bold">
                        {doctor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Dr. {doctor.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{doctor.specialty || 'Physician'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onBook(doctor)}
                      disabled={bookingLoading || !selectedConcern}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        !selectedConcern 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                          : 'bg-[#1a8a9d] text-white hover:bg-[#146f7e] shadow-sm'
                      }`}
                    >
                      {bookingLoading ? '...' : 'Select'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
