import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/apiClient';

export default function CreatePatient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState({ isSuccess: false, password: '' });
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: ''
  });

  // generate a secure random password for the UI
  useEffect(() => {
    const generatePassword = () => {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      let pass = "";
      for (let i = 0; i < 10; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setFormData(prev => ({ ...prev, password: pass, confirmPassword: pass }));
    };
    generatePassword();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const cleanPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      birthday: formData.dateOfBirth,
      gender: formData.gender
    };

    try {
      const response = await apiRequest('/api/v1/admin/create-patient', {
        method: 'POST',
        body: JSON.stringify(cleanPayload)
      });

      const finalPassword = response?.generatedPassword || formData.password;
      
      setSuccessData({ isSuccess: true, password: finalPassword });
    } catch (error) {
      let exactProblem = error.message;
      if (error.problems && Array.isArray(error.problems)) {
        exactProblem = `Validation failed for: ${error.problems.join(', ')}`;
      }
      setErrorMsg(exactProblem);
      if (error.problems) console.error("Validation Problems:", error.problems);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(successData.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass = "w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#0aadef] focus:ring-1 focus:ring-[#0aadef] text-gray-800 transition-colors placeholder-gray-400";
  const labelClass = "block text-[13px] font-bold text-gray-900 mb-1.5";
  const asterisk = <span className="text-red-500">*</span>;

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-sans flex flex-col items-center pb-16">
      
      {/* Top Navigation */}
      <div className="w-full max-w-6xl flex justify-between items-center py-6 px-6 lg:px-8">
        <img 
          src="/okie-doc-logo.png" 
          alt="OkieDoc+" 
          className="h-8 md:h-10 object-contain cursor-pointer" 
          onClick={() => navigate('/admin/nurse-dashboard')}
        />
        <button
          onClick={() => navigate('/admin/nurse-dashboard')}
          className="text-[13px] font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          Back to Nurse Admin Dashboard
        </button>
      </div>

      <main className="w-full max-w-3xl flex flex-col items-center px-4 mt-2">
        
        {!successData.isSuccess ? (
          <>
            {/* Title Section */}
            <div className="text-center mb-8">
              <h1 className="text-[32px] font-extrabold text-[#0f172a] mb-2 tracking-tight">Create Patient Account</h1>
              <p className="text-[#64748b] text-[15px]">Register a new patient into the OkieDoc+ system</p>
            </div>

            {/* Inline Error Banner */}
            {errorMsg && (
              <div className="w-full max-w-[800px] bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errorMsg}
              </div>
            )}

            {/* Form Card */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-10 w-full max-w-[800px] border border-gray-100">
              
              <h2 className="text-[18px] font-bold text-gray-900 mb-8">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={labelClass}>First Name {asterisk}</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Juan" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Last Name {asterisk}</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Dela Cruz" className={inputClass} />
                </div>
              </div>

              <div className="mb-6">
                <label className={labelClass}>Email Address {asterisk}</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="juan.delacruz@email.com" className={inputClass} />
              </div>

              <div className="mb-6">
                <label className={labelClass}>Mobile Number {asterisk}</label>
                <input required name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="+63 912 345 6789" className={inputClass} />
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-1">
                <div>
                  <label className={labelClass}>Password {asterisk}</label>
                  <input required readOnly type="password" value={formData.password} placeholder="••••••••" className={`${inputClass} text-gray-400 cursor-not-allowed`} />
                </div>
                <div>
                  <label className={labelClass}>Confirm Password {asterisk}</label>
                  <input required readOnly type="password" value={formData.confirmPassword} placeholder="••••••••" className={`${inputClass} text-gray-400 cursor-not-allowed`} />
                </div>
              </div>
              <p className="text-[12px] text-[#0aadef] mb-8 font-medium mt-1">Auto-generated by system</p>

              {/* Date of Birth & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div>
                  <label className={labelClass}>Date of Birth {asterisk}</label>
                  <input required type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={`${inputClass} text-gray-500`} />
                </div>
                <div>
                  <label className={labelClass}>Gender {asterisk}</label>
                  <select required name="gender" value={formData.gender} onChange={handleChange} className={`${inputClass} text-gray-500`}>
                    <option value="" disabled>Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#0aadef] hover:bg-[#0998d3] text-white font-semibold py-3.5 rounded-lg transition-colors text-[15px]">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-10 w-full max-w-[600px] border border-gray-100 text-center mt-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h2 className="text-[24px] font-bold text-[#0f172a] mb-2">Account Created!</h2>
            <p className="text-gray-500 mb-8 text-[15px]">The patient has been successfully registered in the system.</p>

            <div className="bg-[#f8fafc] border border-gray-200 rounded-lg p-6 mb-8 text-left">
              <p className="text-[13px] font-bold text-gray-700 mb-3">Auto-generated Password</p>
              
              <div className="flex items-center justify-between bg-white border border-gray-300 rounded-md px-4 py-3 shadow-sm">
                <code className="text-lg font-mono text-gray-900 tracking-wider">{successData.password}</code>
                <button 
                  type="button"
                  onClick={handleCopyPassword}
                  className={`text-sm font-semibold px-4 py-1.5 rounded transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-[12px] text-gray-500 mt-3 leading-relaxed">
                Please copy and securely share this password with the patient. They will need this to log in to their account.
              </p>
            </div>

            <button 
              type="button"
              onClick={() => navigate('/admin/nurse-dashboard')} 
              className="w-full bg-[#0aadef] hover:bg-[#0998d3] text-white font-semibold py-3.5 rounded-lg transition-colors text-[15px]"
            >
              Done & Return to Dashboard
            </button>
          </div>
        )}

      </main>
    </div>
  );
}