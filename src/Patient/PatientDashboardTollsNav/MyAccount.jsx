import  { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Camera, Upload, PenTool } from 'lucide-react';
import './MyAccount.css';

export default function MyAccount() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    birthday: '',
    gender: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  return (
    <Sidebar>
      <div className="my-account-container">
        <h1 className="page-title">
          My Account
        </h1>

        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-grid">
            {/* Column 1: First Name, Mobile, Birthday */}
            <div className="form-column">
              <div className="form-group">
                <label className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter first name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Mobile #
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter mobile number"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Birthday
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Column 2: Last Name, Email, Gender */}
            <div className="form-column">
              <div className="form-group">
                <label className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter last name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Column 3: Upload Profile Photo and E-Signature */}
            <div className="form-column">
              <div className="upload-group">
                <div className="profile-photo-upload">
                  <div className="profile-photo-circle">
                    <Camera size={32} className="upload-icon" />
                  </div>
                  <label className="upload-button">
                    <span className="upload-button-text">
                      Upload Profile Photo
                    </span>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              </div>

              <div className="upload-group">
                <div className="e-signature-upload">
                  <div className="e-signature-box">
                    <PenTool size={32} className="upload-icon" />
                  </div>
                  <label className="upload-button">
                    <span className="upload-button-text">
                      Upload E-Signature
                    </span>
                    <input type="file" accept=".png,.jpg,.jpeg" className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="save-button"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </Sidebar>
  );
} 
 