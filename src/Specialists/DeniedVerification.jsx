import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from './authService';

export default function DeniedVerification() {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/specialist-login');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7f6', textAlign: 'center', padding: '20px' }}>
            <img src="/okie-doc-logo.png" alt="OkieDoc+" style={{ width: '150px', marginBottom: '30px' }} />
            <h1 style={{ color: '#e74c3c', marginBottom: '15px' }}>Application Denied</h1>
            <p style={{ color: '#7f8c8d', maxWidth: '500px', lineHeight: '1.6', fontSize: '1.1rem' }}>
                We have reviewed your application to join the OkieDoc+ Specialist Network. Unfortunately, we cannot approve your account at this time.
            </p>
            <div style={{ padding: '20px', backgroundColor: '#fdeded', borderRadius: '8px', borderLeft: '4px solid #e74c3c', marginTop: '30px', maxWidth: '500px' }}>
                <p style={{ margin: 0, color: '#c0392b' }}>
                    <strong>Status: Denied.</strong> If you believe this was in error or you have updated credentials, please contact admin@okiedocplus.com.
                </p>
            </div>
            <button
                onClick={handleLogout}
                style={{ marginTop: '40px', padding: '12px 30px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}
            >
                Sign Out
            </button>
        </div>
    );
}
