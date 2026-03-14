import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import PatientSidebar from '../components/PatientSidebar';
import PatientHeader from '../components/PatientHeader';
import { ArrowLeft, FileText, Download, Upload, Loader2, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MedicalReport {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: any;
  patientId: string;
}

const PatientMedicalReports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reportName, setReportName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;
    
    const q = query(
      collection(db, 'medical_reports'), 
      where('patientId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
       const fetchedReports: MedicalReport[] = [];
       querySnapshot.forEach((doc) => {
         const data = doc.data();
         fetchedReports.push({ id: doc.id, ...data } as MedicalReport);
       });
       
       fetchedReports.sort((a, b) => {
         const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
         const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
         return timeB - timeA;
       });
       
       setReports(fetchedReports);
    }, (err) => {
      console.error("Error fetching reports:", err);
    });

    return () => unsubscribe();
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Limit to max 10MB
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      // Automatically set the file name if report Name is empty
      if (!reportName) {
         setReportName(file.name.split('.')[0]); 
      }
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !user?.uid) return;
    if (!reportName.trim()) {
      setError('Please provide a name for this report');
      return;
    }

    console.log("Starting upload for:", selectedFile.name);
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const safeFilename = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `medical_reports/${user.uid}/${safeFilename}`);
      
      console.log("Storage Ref created:", storageRef.fullPath);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload progress:", progress);
          setUploadProgress(progress);
        },
        (err) => {
          console.error("Upload observer error:", err);
          setError(`Upload failed: ${err.message}`);
          setIsUploading(false);
          setUploadProgress(0);
        },
        async () => {
          try {
            console.log("Upload completed, getting download URL...");
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Download URL obtained:", downloadURL);
            
            await addDoc(collection(db, 'medical_reports'), {
              patientId: user.uid,
              name: reportName.trim(),
              url: downloadURL,
              type: selectedFile.type,
              size: selectedFile.size,
              createdAt: serverTimestamp(),
              originalFilename: selectedFile.name
            });

            console.log("Firestore document added successfully");
            setIsModalOpen(false);
            setSelectedFile(null);
            setReportName('');
            setUploadProgress(0);
          } catch (err: any) {
            console.error("Post-upload error:", err);
            setError(`Failed to save report details: ${err.message}`);
          } finally {
            setIsUploading(false);
          }
        }
      );
    } catch (err: any) {
      console.error("Initial upload setup error:", err);
      setError(`Failed to start upload: ${err.message}`);
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    return new Date().toLocaleDateString();
  };

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
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800">Medical Reports</h2>
              </div>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 bg-medical-dark hover:bg-opacity-90 text-white px-5 py-2.5 rounded-xl transition duration-200 shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span className="font-bold">Upload Report</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map(report => (
                <div key={report.id} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex flex-col h-full">
                  <div className="flex-1">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
                       <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1 truncate" title={report.name}>
                      {report.name}
                    </h3>
                    <div className="flex flex-col space-y-1 mt-3">
                       <p className="text-sm text-slate-500 font-medium">
                         Added: {formatDate(report.createdAt)}
                       </p>
                       <p className="text-xs text-slate-400 font-medium">
                         Size: {formatFileSize(report.size)}
                       </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-50">
                    <a 
                      href={report.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center space-x-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-4 py-2.5 rounded-xl transition duration-200 group"
                    >
                      <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                      <span className="text-sm font-bold">View Document</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            {reports.length === 0 && (
              <div className="bg-white p-20 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                <div className="inline-flex p-4 bg-slate-50 rounded-2xl text-slate-300 mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No reports uploaded yet</h3>
                <p className="text-slate-400 font-medium max-w-md mx-auto mb-6">
                  You haven't uploaded any medical reports, test results, or scanned documents.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-5 py-2.5 rounded-xl transition duration-200"
                >
                  <Upload className="w-5 h-5" />
                  <span className="font-bold">Upload your first report</span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Upload Medical Report</h3>
              <button 
                onClick={() => !isUploading && setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
                disabled={isUploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="e.g. Blood Test Results - March 2026"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-medical-dark/20 focus:border-medical-dark transition text-slate-800 placeholder:text-slate-400"
                    disabled={isUploading}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Select File * (Max 10MB)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition relative overflow-hidden group">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={isUploading}
                      required={!selectedFile}
                    />
                    
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                      {selectedFile ? (
                        <>
                          <FileText className="w-8 h-8 text-blue-500 mb-2" />
                          <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                            {selectedFile.name}
                          </span>
                          <span className="text-xs text-slate-500 mt-1">
                            {formatFileSize(selectedFile.size)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-300 mb-2 group-hover:text-blue-500 transition-colors" />
                          <span className="text-sm font-bold text-slate-700">
                            Click or drag file to upload
                          </span>
                          <span className="text-xs text-slate-500 mt-1">
                            Supports PDF, Image, Word
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {isUploading && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm font-bold text-slate-700">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-medical-dark h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-8 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-medical-dark text-white hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Upload Report</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientMedicalReports;
