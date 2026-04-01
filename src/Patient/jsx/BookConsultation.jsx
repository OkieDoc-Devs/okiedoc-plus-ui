import React, { useState } from 'react';
import {
  FaPhoneAlt,
  FaComments,
  FaTimes,
  FaCalendarAlt,
  FaEnvelope,
  FaExclamationTriangle,
} from 'react-icons/fa';
import '../css/AppointmentBooking.css';
import { createTicket } from '../services/apiService';

const BookConsultation = ({ onAppointmentAdded }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    chiefComplaint: '',
    symptoms: '',
    consultationChannel: 'chat',
    preferredDate: '',
    preferredTime: '10:00 AM',
    prefMonth: '',
    prefDay: '',
    prefYear: '',
    prefHour: '',
    prefMinute: '',
    prefAmPm: 'AM',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBookingClick = () => {
    setShowModal(true);
    setError('');
    setSuccess('');
    setFormData({
      chiefComplaint: '',
      symptoms: '',
      consultationChannel: 'chat',
      preferredDate: '',
      preferredTime: '10:00 AM',
      prefMonth: '',
      prefDay: '',
      prefYear: '',
      prefHour: '',
      prefMinute: '',
      prefAmPm: 'AM',
    });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.prefMonth || !formData.prefDay || !formData.prefYear) {
        setError('Please select a complete preferred date');
        setLoading(false);
        return;
      }
      if (!formData.prefHour || !formData.prefMinute) {
        setError('Please select a complete preferred time');
        setLoading(false);
        return;
      }

      const combinedDate = `${formData.prefYear}-${formData.prefMonth}-${formData.prefDay}`;
      const combinedTime = `${formData.prefHour}:${formData.prefMinute} ${formData.prefAmPm}`;

      const selectedDate = new Date(combinedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setError('Please select a future date');
        setLoading(false);
        return;
      }

      if (selectedDate.getTime() === today.getTime()) {
        const now = new Date();
        const appointmentTime = new Date();
        let hour24 = parseInt(formData.prefHour, 10);
        if (formData.prefAmPm === 'PM' && hour24 !== 12) hour24 += 12;
        if (formData.prefAmPm === 'AM' && hour24 === 12) hour24 = 0;

        appointmentTime.setHours(
          hour24,
          parseInt(formData.prefMinute, 10),
          0,
          0,
        );

        if (appointmentTime <= now) {
          setError(
            'Cannot book appointments for times that have already passed',
          );
          setLoading(false);
          return;
        }

        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);
        if (appointmentTime < thirtyMinutesFromNow) {
          setError(
            'Appointments must be scheduled at least 30 minutes from the current time',
          );
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        preferredDate: combinedDate,
        preferredTime: combinedTime,
      };

      const response = await createTicket(payload);
      setSuccess(
        `Success! Your ticket number is ${response.ticketNumber}. Pending nurse triage.`,
      );

      const tempTicket = {
        id: response.ticketNumber,
        title: `Ticket #${response.ticketNumber} - ${formData.chiefComplaint}`,
        status: 'Pending',
        specialist: 'Unassigned',
        specialty: 'General',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        description: formData.symptoms,
        consultationChannel: formData.consultationChannel,
      };

      setTimeout(() => {
        closeModal();
        if (onAppointmentAdded) onAppointmentAdded(tempTicket);
      }, 3000);
    } catch (err) {
      console.log("Raw Error Object:", err.response);

  // Look for the message in multiple possible hiding spots
  const errorMessage = 
    err.response?.data?.error ||
    err.response?.data?.message ||
    (typeof err.response?.data === 'string' ? err.response.data : null) ||
    err.message ||
    (typeof err === 'string' ? err : null) ||
    'Failed to create consultation ticket. Please try again.';

  setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className='patient-hotline-btn' onClick={handleBookingClick}>
        <FaCalendarAlt className='patient-hotline-icon' />
        Book Consultation
      </button>

      {showModal && (
        <div className='patient-booking-modal-overlay' onClick={closeModal}>
          <div
            className='patient-booking-modal'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='patient-booking-header'>
              <h2 className='patient-booking-title'>
                <FaComments className='patient-booking-title-icon' />
                Book an Appointment
              </h2>
              <button
                className='patient-booking-close'
                onClick={closeModal}
                disabled={loading}
              >
                <FaTimes />
              </button>
            </div>

            <div className='patient-booking-content'>
              {error && (
                <div
                  className='patient-alert patient-alert-error'
                  style={{
                    color: 'red',
                    marginBottom: '1rem',
                    padding: '0.5rem',
                    backgroundColor: '#fee',
                  }}
                >
                  <FaExclamationTriangle /> {error}
                </div>
              )}
              {success && (
                <div
                  className='patient-alert patient-alert-success'
                  style={{
                    color: 'green',
                    marginBottom: '1rem',
                    padding: '0.5rem',
                    backgroundColor: '#efe',
                  }}
                >
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className='patient-form-section'>
                <div className='form-group' style={{ marginBottom: '1rem' }}>
                  <label
                    htmlFor='chiefComplaint'
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Chief Complaint *
                  </label>
                  <input
                    type='text'
                    id='chiefComplaint'
                    name='chiefComplaint'
                    required
                    value={formData.chiefComplaint}
                    onChange={handleChange}
                    className="patient-form-input"
                    placeholder='e.g. Severe Headache'
                    maxLength={50}
                    disabled={loading || success}
                  />
                  <span className='patient-form-char-count'>
                    {formData.chiefComplaint.length}/50
                  </span>
                </div>

                <div className='form-group' style={{ marginBottom: '1rem' }}>
                  <label
                    htmlFor='symptoms'
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Symptoms *
                  </label>
                  <textarea
                    id='symptoms'
                    name='symptoms'
                    required
                    value={formData.symptoms}
                    onChange={handleChange}
                    className="patient-form-textarea"
                    placeholder='Provide detailed symptoms'
                    maxLength={5000}
                    disabled={loading || success}
                  />
                  <span className='patient-form-char-count'>
                    {formData.symptoms.length}/5000
                  </span>
                </div>

                <div className='form-group' style={{ marginBottom: '1rem' }}>
                  <label
                    htmlFor='consultationChannel'
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Consultation Channel *
                  </label>
                  <select
                    id='consultationChannel'
                    name='consultationChannel'
                    value={formData.consultationChannel}
                    onChange={handleChange}
                    className="patient-form-select"
                    disabled={loading || success}
                  >
                    <option value='chat'>Chat</option>
                    <option value='mobile_call'>Mobile Call</option>
                    <option value='platform_call'>Platform Audio/Video</option>
                    <option value='viber_audio'>Viber Audio</option>
                    <option value='viber_video'>Viber Video</option>
                  </select>
                </div>

                <div className='form-group' style={{ marginBottom: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Preferred Date *
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                      name='prefMonth'
                      value={formData.prefMonth}
                      onChange={handleChange}
                      required
                      disabled={loading || success}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value=''>Month</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m.toString().padStart(2, '0')}>
                          {new Date(0, m - 1).toLocaleString('en-US', { month: 'short' })}
                        </option>
                      ))}
                    </select>
                    <select
                      name='prefDay'
                      value={formData.prefDay}
                      onChange={handleChange}
                      required
                      disabled={loading || success}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value=''>Day</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d.toString().padStart(2, '0')}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <select
                      name='prefYear'
                      value={formData.prefYear}
                      onChange={handleChange}
                      required
                      disabled={loading || success}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value=''>Year</option>
                      {Array.from(
                        { length: 2 },
                        (_, i) => new Date().getFullYear() + i
                      ).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='form-group' style={{ marginBottom: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Preferred Time *
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                      name='prefHour'
                      value={formData.prefHour}
                      onChange={handleChange}
                      required
                      disabled={loading || success}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value=''>Hour</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <option key={h} value={h.toString().padStart(2, '0')}>
                          {h.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <select
                      name='prefMinute'
                      value={formData.prefMinute}
                      onChange={handleChange}
                      required
                      disabled={loading || success}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value=''>Minute</option>
                      <option value='00'>00</option>
                      <option value='15'>15</option>
                      <option value='30'>30</option>
                      <option value='45'>45</option>
                    </select>
                    <select
                      name='prefAmPm'
                      value={formData.prefAmPm}
                      onChange={handleChange}
                      required
                      disabled={loading || success}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value='AM'>AM</option>
                      <option value='PM'>PM</option>
                    </select>
                  </div>
                </div>

                <div
                  className='patient-booking-actions'
                  style={{ marginTop: '2rem' }}
                >
                  <button
                    type='button'
                    className='patient-booking-cancel'
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='patient-booking-submit'
                    disabled={loading || success}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookConsultation;
