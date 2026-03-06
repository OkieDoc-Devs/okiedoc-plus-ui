import React, { useState } from 'react';
import { FaPhoneAlt, FaComments, FaTimes, FaCalendarAlt, FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';
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
        preferredTime: '10:00 AM'
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
            preferredTime: '10:00 AM'
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
            const response = await createTicket(formData);
            setSuccess(`Success! Your ticket number is ${response.ticketNumber}. Pending nurse triage.`);

            // Build a temporary ticket object to immediately reflect in the UI without re-fetching
            const tempTicket = {
                id: response.ticketNumber,
                title: `Ticket #${response.ticketNumber} - ${formData.chiefComplaint}`,
                status: 'Pending',
                specialist: 'Unassigned',
                specialty: 'General',
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                description: formData.symptoms,
                consultationChannel: formData.consultationChannel
            };

            setTimeout(() => {
                closeModal();
                if (onAppointmentAdded) onAppointmentAdded(tempTicket);
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to create consultation ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button className="patient-hotline-btn" onClick={handleBookingClick}>
                <FaCalendarAlt className="patient-hotline-icon" />
                Book Consultation
            </button>

            {showModal && (
                <div className="patient-booking-modal-overlay" onClick={closeModal}>
                    <div className="patient-booking-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="patient-booking-header">
                            <h2 className="patient-booking-title">
                                <FaComments className="patient-booking-title-icon" />
                                Book an Appointment
                            </h2>
                            <button className="patient-booking-close" onClick={closeModal} disabled={loading}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="patient-booking-content">
                            {error && (
                                <div className="patient-alert patient-alert-error" style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fee' }}>
                                    <FaExclamationTriangle /> {error}
                                </div>
                            )}
                            {success && (
                                <div className="patient-alert patient-alert-success" style={{ color: 'green', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#efe' }}>
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="patient-form-section">
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label htmlFor="chiefComplaint" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Chief Complaint *</label>
                                    <input
                                        type="text"
                                        id="chiefComplaint"
                                        name="chiefComplaint"
                                        required
                                        value={formData.chiefComplaint}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        placeholder="e.g. Severe Headache"
                                        disabled={loading || success}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label htmlFor="symptoms" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Symptoms *</label>
                                    <textarea
                                        id="symptoms"
                                        name="symptoms"
                                        required
                                        value={formData.symptoms}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
                                        placeholder="Provide detailed symptoms"
                                        disabled={loading || success}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label htmlFor="consultationChannel" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Consultation Channel *</label>
                                    <select
                                        id="consultationChannel"
                                        name="consultationChannel"
                                        value={formData.consultationChannel}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        disabled={loading || success}
                                    >
                                        <option value="chat">Chat</option>
                                        <option value="mobile_call">Mobile Call</option>
                                        <option value="platform_call">Platform Audio/Video</option>
                                        <option value="viber_audio">Viber Audio</option>
                                        <option value="viber_video">Viber Video</option>
                                    </select>
                                </div>

                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label htmlFor="preferredDate" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Preferred Date *</label>
                                    <input
                                        type="date"
                                        id="preferredDate"
                                        name="preferredDate"
                                        required
                                        value={formData.preferredDate}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        min={new Date().toISOString().split('T')[0]}
                                        disabled={loading || success}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label htmlFor="preferredTime" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Preferred Time *</label>
                                    <input
                                        type="time"
                                        id="preferredTime"
                                        name="preferredTime"
                                        required
                                        value={formData.preferredTime}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        disabled={loading || success}
                                    />
                                </div>

                                <div className="patient-booking-actions" style={{ marginTop: '2rem' }}>
                                    <button
                                        type="button"
                                        className="patient-booking-cancel"
                                        onClick={closeModal}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="patient-booking-submit"
                                        style={{ background: '#0b5388', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
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
