import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import JitsiMeetCall from './JitsiMeetCall';

const VideoCallPage = () => {
  const [searchParams] = useSearchParams();
  const { user: currentUser, loading } = useAuth();
  
  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>Loading secure session...</div>;
  }
  
  if (!currentUser) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: 'red' }}>Error: Not authenticated. Please log in first.</div>;
  }

  const ticketId = searchParams.get('ticketId');
  const callType = searchParams.get('callType') || 'video';
  const patientId = searchParams.get('patientId');
  const patientName = searchParams.get('patientName') || 'Patient';
  const patientAvatar = searchParams.get('patientAvatar') || '';

  const patient = {
    id: patientId,
    name: patientName,
    avatar: patientAvatar
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <JitsiMeetCall
        isOpen={true}
        onClose={() => window.close()}
        callType={callType}
        patient={patient}
        currentUser={currentUser}
        ticketId={ticketId}
        isPopout={true}
      />
    </div>
  );
};

export default VideoCallPage;
