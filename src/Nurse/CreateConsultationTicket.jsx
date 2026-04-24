import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, User, Shield, Stethoscope, ClipboardList, Send, FileText } from 'lucide-react';
import PainMap from '../components/PainMap/PainMap';
import './TicketForm.css';

const CreateConsultationTicket = ({ callbackData: propsCallbackData, onBack }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Support both props (when embedded in Dashboard) and location state (when on its own route)
  const callbackData = propsCallbackData || location.state?.callbackData || {};

  const [formData, setFormData] = useState({
    // Patient Information
    firstName: callbackData.firstName || '',
    lastName: callbackData.lastName || '',
    fullName: callbackData.firstName && callbackData.lastName ? `${callbackData.firstName} ${callbackData.lastName}` : '',
    email: callbackData.email || '',
    phone: callbackData.contactNumber || '',
    birthDate: '',
    gender: '',
    
    // Address
    houseNumber: '',
    streetAddress: '',
    barangay: '',
    city: '',
    province: '',
    region: '',
    
    // Healthcare
    philHealthNumber: callbackData.philHealthNumber || '',
    healthInsurance: '',
    bloodType: '',
    allergies: '',
    existingConditions: '',
    
    // Consultation
    consultationType: 'General',
    priority: 'Normal',
    
    // Initial Intake
    chiefComplaint: callbackData.chiefComplaint || '',
    symptoms: '',
    duration: '',
    severity: 'Mild',
    
    // Pain Map
    painMapAreas: [],
    painMapView: 'front'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePainAreaToggle = (area) => {
    setFormData(prev => {
      const exists = prev.painMapAreas.find(a => a.id === area.id);
      if (exists) {
        return {
          ...prev,
          painMapAreas: prev.painMapAreas.filter(a => a.id !== area.id)
        };
      } else {
        return {
          ...prev,
          painMapAreas: [...prev.painMapAreas, area]
        };
      }
    });
  };

  const handlePainAreaRemove = (areaId) => {
    setFormData(prev => ({
      ...prev,
      painMapAreas: prev.painMapAreas.filter(a => a.id !== areaId)
    }));
  };

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/nurse-dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting ticket:', formData);
    alert('Ticket created successfully (Mock)');
    handleGoBack();
  };

  return (
    <div className="nurse-ticket-container">
      <header className="nurse-ticket-header">
        <div className="header-left">
          <button className="back-circle-btn" onClick={handleGoBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="title-group">
            <div className="title-row">
              <div className="user-plus-icon">
                <User size={20} strokeWidth={2.5} />
                <span className="plus-plus">+</span>
              </div>
              <h1>Create Consultation Ticket</h1>
            </div>
            <p className="subtitle">Nurse-assisted patient registration</p>
          </div>
        </div>
        
        <div className="header-actions">
           <button type="button" className="btn-draft">
             <FileText size={18} />
             <span>Save Draft</span>
           </button>
           <button type="button" className="btn-assign">
             <Send size={18} />
             <span>Assign to Nurse</span>
           </button>
           <button type="submit" className="btn-create-ticket" onClick={handleSubmit}>
             <ClipboardList size={18} />
             <span>Create Ticket</span>
           </button>
        </div>
      </header>

      <div className="ticket-form-content">
        {/* Section 1: Patient Information */}
        <section className="form-card">
          <h3 className="card-title">Patient Information</h3>
          <div className="field-row full-width">
            <div className="form-field">
              <label>Full Name *</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                placeholder="Enter full name"
                required 
              />
            </div>
          </div>
          <div className="field-row">
            <div className="form-field">
              <label>Mobile Number *</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+63 XXX XXX XXXX"
                required 
              />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div className="field-row">
            <div className="form-field">
              <label>Date of Birth</label>
              <input 
                type="date" 
                name="birthDate" 
                value={formData.birthDate} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-field">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 2: Address */}
        <section className="form-card">
          <h3 className="card-title">Address</h3>
          <div className="field-row full-width">
            <div className="form-field">
              <label>Street Address</label>
              <input 
                type="text" 
                name="streetAddress" 
                value={formData.streetAddress} 
                onChange={handleChange} 
                placeholder="House/Unit/Building No., Street Name"
              />
            </div>
          </div>
          <div className="field-row">
            <div className="form-field">
              <label>Region</label>
              <input 
                type="text" 
                name="region" 
                value={formData.region} 
                onChange={handleChange} 
                placeholder="e.g., NCR, Region III"
              />
            </div>
            <div className="form-field">
              <label>Province</label>
              <input 
                type="text" 
                name="province" 
                value={formData.province} 
                onChange={handleChange} 
                placeholder="Province"
              />
            </div>
          </div>
          <div className="field-row">
            <div className="form-field">
              <label>City / Municipality</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                placeholder="City / Municipality"
              />
            </div>
            <div className="form-field">
              <label>Barangay</label>
              <input 
                type="text" 
                name="barangay" 
                value={formData.barangay} 
                onChange={handleChange} 
                placeholder="Barangay"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Healthcare Information */}
        <section className="form-card">
          <h3 className="card-title">Healthcare Information</h3>
          <div className="field-row">
            <div className="form-field">
              <label>PhilHealth Number</label>
              <input 
                type="text" 
                name="philHealthNumber" 
                value={formData.philHealthNumber} 
                onChange={handleChange} 
                placeholder="XX-XXXXXXXXX-X" 
              />
            </div>
            <div className="form-field">
              <label>Insurance Provider</label>
              <input 
                type="text" 
                name="healthInsurance" 
                value={formData.healthInsurance} 
                onChange={handleChange} 
                placeholder="Insurance name"
              />
            </div>
          </div>
          <div className="field-row">
             <div className="form-field">
              <label>Blood Type</label>
              <select name="bloodType" value={formData.bloodType} onChange={handleChange}>
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Allergies</label>
            <textarea 
              name="allergies" 
              value={formData.allergies} 
              onChange={handleChange} 
              rows="2" 
              placeholder="List any known allergies..."
            ></textarea>
          </div>
        </section>

        {/* Section 4: Initial Intake */}
        <section className="form-card">
          <h3 className="card-title">Initial Intake</h3>
          <div className="form-field">
            <label>Chief Complaint *</label>
            <input 
              type="text" 
              name="chiefComplaint" 
              value={formData.chiefComplaint} 
              onChange={handleChange} 
              placeholder="Reason for consultation" 
              required 
            />
          </div>
          <div className="form-field">
            <label>Symptoms Description</label>
            <textarea 
              name="symptoms" 
              value={formData.symptoms} 
              onChange={handleChange} 
              rows="3" 
              placeholder="Describe symptoms in detail..."
            ></textarea>
          </div>
          <div className="field-row">
            <div className="form-field">
              <label>Duration</label>
              <input 
                type="text" 
                name="duration" 
                value={formData.duration} 
                onChange={handleChange} 
                placeholder="e.g. 3 days" 
              />
            </div>
            <div className="form-field">
              <label>Severity</label>
              <select name="severity" value={formData.severity} onChange={handleChange}>
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 5: Pain Map */}
        <section className="form-card">
          <PainMap 
            view={formData.painMapView} 
            selectedAreas={formData.painMapAreas} 
            onViewChange={(view) => setFormData(prev => ({ ...prev, painMapView: view }))}
            onAreaToggle={handlePainAreaToggle}
            onAreaRemove={handlePainAreaRemove}
          />
        </section>
      </div>
    </div>
  );
};

export default CreateConsultationTicket;
