import React, { useState } from 'react';
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
    middleName: '',
    email: '',
    mobileNumber: '',
    dateOfBirth: '',
    gender: '',
    addressLine1: '',
    addressLine2: '',
    barangay: '',
    city: '',
    province: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactAddress: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === 'mobileNumber' || name === 'emergencyContactPhone') {
      sanitizedValue = value.replace(/[^\d\s\-+]/g, '');
    } else if (name === 'zipCode') {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 6);
    }

    setFormData({ ...formData, [name]: sanitizedValue });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Ensure strict numeric stripping before sending to backend, just in case
    const cleanPayload = {
      ...formData,
      birthday: formData.dateOfBirth,
      // Strip all formatting spaces/dashes before sending to backend DB (optional, but good practice)
      mobileNumber: formData.mobileNumber.replace(/[\s-]/g, ''),
      emergencyContactPhone: formData.emergencyContactPhone.replace(/[\s-]/g, ''),
    };

    // Remove the duplicate dateOfBirth key to match backend expectations cleanly
    delete cleanPayload.dateOfBirth;

    try {
      const response = await apiRequest('/api/v1/admin/create-patient', {
        method: 'POST',
        body: JSON.stringify(cleanPayload)
      });

      const finalPassword = response?.generatedPassword || 'System-Generated';
      
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

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 transition-colors placeholder-gray-400";
  const labelClass = "block text-[13px] font-semibold text-gray-700 mb-1.5";
  const asterisk = <span className="text-red-500 ml-1">*</span>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center pb-16">
      
      {/* Top Navigation */}
      <div className="w-full max-w-6xl flex justify-between items-center py-6 px-6 lg:px-8">
        <img 
          src="/okie-doc-logo.png" 
          alt="OkieDoc+" 
          className="h-8 md:h-10 object-contain cursor-pointer" 
          onClick={() => navigate('/admin/nurse-dashboard')}
        />
        <button
          type="button"
          onClick={() => navigate('/admin/nurse-dashboard')}
          className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm border border-gray-200 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Return to Dashboard
        </button>
      </div>

      <main className="w-full max-w-3xl flex flex-col items-center px-4 mt-2">
        
        {!successData.isSuccess ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">Create Patient Account</h1>
              <p className="text-gray-500 text-[15px]">Register a new patient securely into the OkieDoc+ system</p>
            </div>

            {errorMsg && (
              <div className="w-full max-w-[800px] bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-3 shadow-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 md:p-10 w-full max-w-[800px] border border-gray-100">
              
              <h2 className="text-lg font-bold text-gray-800 mb-5 border-b border-gray-100 pb-2">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <div>
                  <label className={labelClass}>First Name {asterisk}</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Juan" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Middle Name</label>
                  <input name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Reyes" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Last Name {asterisk}</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Dela Cruz" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className={labelClass}>Email Address {asterisk}</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="juan.delacruz@email.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Mobile Number {asterisk}</label>
                  <input required type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="+63 912 345 6789" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div>
                  <label className={labelClass}>Date of Birth {asterisk}</label>
                  <input required type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={`${inputClass} text-gray-600`} />
                </div>
                <div>
                  <label className={labelClass}>Gender {asterisk}</label>
                  <select required name="gender" value={formData.gender} onChange={handleChange} className={`${inputClass} text-gray-600`}>
                    <option value="" disabled>Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-5 border-b border-gray-100 pb-2">Delivery Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>Address Line 1 (Unit, Building, Street)</label>
                  <input name="addressLine1" value={formData.addressLine1} onChange={handleChange} placeholder="123 Main St" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Address Line 2 (Subdivision, Area)</label>
                  <input name="addressLine2" value={formData.addressLine2} onChange={handleChange} placeholder="Apt 4B" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Barangay</label>
                  <input name="barangay" value={formData.barangay} onChange={handleChange} placeholder="Barangay Name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input name="city" value={formData.city} onChange={handleChange} placeholder="City Name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Province</label>
                  <input name="province" value={formData.province} onChange={handleChange} placeholder="Province Name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Zip Code</label>
                  <input name="zipCode" type="text" inputMode="numeric" value={formData.zipCode} onChange={handleChange} placeholder="1234" className={inputClass} />
                </div>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-5 border-b border-gray-100 pb-2 mt-8">Emergency Contact</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div>
                  <label className={labelClass}>Contact Name</label>
                  <input name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder="Maria Dela Cruz" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Contact Phone</label>
                  <input name="emergencyContactPhone" type="tel" value={formData.emergencyContactPhone} onChange={handleChange} placeholder="+63 919 000 0000" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Contact Address</label>
                  <input name="emergencyContactAddress" value={formData.emergencyContactAddress} onChange={handleChange} placeholder="Emergency contact's address" className={inputClass} />
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg shadow-sm transition-colors text-[15px] disabled:opacity-50">
                  {loading ? 'Processing Registration...' : 'Create Patient Account'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-10 w-full max-w-[600px] border border-gray-100 text-center mt-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-500 mb-8 text-[15px]">The patient has been successfully registered in the system.</p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8 text-left">
              <p className="text-[13px] font-semibold text-gray-700 mb-3">System-Generated Password</p>
              
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-4 py-3 shadow-sm">
                <code className="text-lg font-mono text-gray-800 tracking-wider font-semibold">{successData.password}</code>
                <button 
                  type="button"
                  onClick={handleCopyPassword}
                  className={`text-sm font-semibold px-4 py-1.5 rounded transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-[12px] text-gray-500 mt-3 leading-relaxed">
                Please securely share this password with the patient. They will need this to log in to their account.
              </p>
            </div>

            <button 
              type="button"
              onClick={() => navigate('/admin/nurse-dashboard')} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition-colors text-[15px]"
            >
              Done & Return to Dashboard
            </button>
          </div>
        )}

      </main>
    </div>
  );
}