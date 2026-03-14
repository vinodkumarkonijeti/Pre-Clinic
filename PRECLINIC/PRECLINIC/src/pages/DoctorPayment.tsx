import React from 'react';
import DoctorSidebar from '../components/DoctorSidebar';
import { CreditCard, Download, ExternalLink } from 'lucide-react';

const DoctorPayment: React.FC = () => {
  // Mock data for payments
  const payments = [
    { id: 'INV-001', patient: 'M.J. Mical', amount: 150, status: 'Paid', date: '21 Dec 2021' },
    { id: 'INV-002', patient: 'Sanath Deo', amount: 200, status: 'Paid', date: '21 Dec 2021' },
    { id: 'INV-003', patient: 'Loeara Phanj', amount: 120, status: 'Pending', date: '21 Dec 2021' },
    { id: 'INV-004', patient: 'Komola Haris', amount: 300, status: 'Paid', date: '20 Dec 2021' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <DoctorSidebar />
      <div className="flex-1 ml-[280px] flex flex-col min-h-screen">
        <header className="bg-white px-8 py-5 shadow-sm z-40 relative flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Billing & Payments</h1>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold text-sm">
            <Download className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </header>

        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center shadow-lg">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 font-bold text-sm">Total Earnings</p>
                <h2 className="text-2xl font-bold text-slate-800">$12,450</h2>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 font-bold text-sm">This Month</p>
                <h2 className="text-2xl font-bold text-slate-800">$3,200</h2>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 font-bold text-sm">Pending</p>
                <h2 className="text-2xl font-bold text-slate-800">$450</h2>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <h3 className="font-bold text-slate-800">Recent Transactions</h3>
            </div>
            <div className="p-0">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                   <tr>
                     <th className="px-6 py-4">Invoice ID</th>
                     <th className="px-6 py-4">Patient</th>
                     <th className="px-6 py-4">Date</th>
                     <th className="px-6 py-4">Amount</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {payments.map(p => (
                     <tr key={p.id} className="hover:bg-slate-50/50">
                       <td className="px-6 py-4 font-bold text-blue-600">{p.id}</td>
                       <td className="px-6 py-4 font-semibold text-slate-800">{p.patient}</td>
                       <td className="px-6 py-4 text-slate-500 text-sm">{p.date}</td>
                       <td className="px-6 py-4 font-bold text-slate-800">${p.amount}</td>
                       <td className="px-6 py-4">
                         <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${p.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                           {p.status}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                         <button className="text-slate-400 hover:text-blue-600">
                           <ExternalLink className="w-5 h-5" />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default DoctorPayment;
