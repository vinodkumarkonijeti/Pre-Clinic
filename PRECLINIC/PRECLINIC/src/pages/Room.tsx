import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const elementRef = useRef<HTMLDivElement>(null);
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const zegoRef = useRef<any>(null);

  useEffect(() => {
    if (!roomId || !user || !elementRef.current) return;
    
    let isMounted = true;

    const initZego = async () => {
      // Ensure user document has name loaded
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userName = userDoc.exists() ? userDoc.data().name : 'User';

      if (!isMounted) return;

      // Generate kit token
      const appID = parseInt(import.meta.env.VITE_ZEGO_APP_ID);
      const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        user.uid,
        userName
      );

      // Create prebuilt instance
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zegoRef.current = zp;

      zp.joinRoom({
        container: elementRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: true,
        showScreenSharingButton: false,
        onJoinRoom: () => {
          // Record when the patient actually joins the room
          if (role === 'patient' && roomId) {
            const appRef = doc(db, 'appointments', roomId);
            updateDoc(appRef, { patientJoined: true }).catch(err => 
              console.error('Error marking patient joined:', err)
            );
          }
        },
        onLeaveRoom: async () => {
          // If the doctor leaves the call, mark it as completed ONLY if the patient actually joined
          if (role === 'doctor' && roomId) {
            try {
              const appRef = doc(db, 'appointments', roomId);
              const appSnap = await getDoc(appRef);
              
              if (appSnap.exists() && appSnap.data().patientJoined) {
                await updateDoc(appRef, { status: 'completed' });
              } else {
                console.log('Patient never joined. Appointment remains accepted.');
              }
            } catch (error) {
              console.error('Error marking appointment as completed:', error);
            }
          }
          navigate(role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');
        },
      });
      
    };

    initZego();

    return () => {
      isMounted = false;
      if (zegoRef.current) {
        zegoRef.current.destroy();
      }
    };
  }, [roomId, user, role, navigate]);

  return (
    <div className="w-full h-screen bg-slate-900 flex justify-center items-center">
      <div className="w-full h-full" ref={elementRef}></div>
    </div>
  );
};

export default Room;
