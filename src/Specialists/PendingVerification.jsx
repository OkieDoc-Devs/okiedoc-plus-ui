import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from './authService';

export default function PendingVerification() {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/specialist-login');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7f6', textAlign: 'center', padding: '20px' }}>
            <img src="/okie-doc-logo.png" alt="OkieDoc+" style={{ width: '150px', marginBottom: '30px' }} />
            <h1 style={{ color: '#2c3e50', marginBottom: '15px' }}>Application Under Review</h1>
            <p style={{ color: '#7f8c8d', maxWidth: '500px', lineHeight: '1.6', fontSize: '1.1rem' }}>
                Thank you for applying to join the OkieDoc+ Specialist Network. Your submitted credentials and PRC details are currently being reviewed by our administrative team.
            </p>
            <div style={{ padding: '20px', backgroundColor: '#e8f4f8', borderRadius: '8px', borderLeft: '4px solid #3498db', marginTop: '30px', maxWidth: '500px' }}>
                <p style={{ margin: 0, color: '#2980b9' }}>
                    <strong>Status: Pending.</strong> We will notify you via email once a decision has been made.
                </p>
            </div>
            <button
                onClick={handleLogout}
                style={{ marginTop: '40px', padding: '12px 30px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}
            >
                Sign Out
            </button>
        </div>
    );
}
