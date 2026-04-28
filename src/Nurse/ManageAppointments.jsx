import '../App.css';
import './NurseStyles.css';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import Avatar from '../components/Avatar';
import {
  getNurseFirstName,
  getNurseProfileImage,
} from './services/storageService.js';
import {
  filterTicketsByStatus,
  updateTicketStatus,
  rescheduleTicket,
} from './services/ticketService.js';
import { addNotification } from './services/notificationService.js';
import {
  createInitialInvoiceData,
  initializeInvoice,
  calculateInvoiceTotal,
  generateInvoicePDF,
} from './services/invoiceService.js';
import {
  fetchTicketsFromAPI,
  updateTicket,
  triageTicket,
  assignSpecialist,
  fetchDoctorsFromAPI,
} from './services/apiService.js';
import NotificationBell from '../components/Notifications/NotificationBell';
import { useAuth } from '../contexts/AuthContext';

const USE_API = true;
const TRIAGE_DRAFTS_STORAGE_KEY = 'nurse.triageDraftsByTicket';
const getTicketDraftFingerprint = (ticket) =>
  String(ticket?.createdAt || ticket?.updatedAt || '').trim();

export default function ManageAppointment() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (!USE_API) {
      // console.log('ManageAppointments: API disabled, no data will be loaded');
      return;
    }

    const loadTicketsData = async () => {
      /* console.log(
        'ManageAppointments: Loading tickets from API for logged-in nurse...',
      ); */
      try {
        const data = await fetchTicketsFromAPI();
        // console.log('ManageAppointments: Tickets loaded from API:', data);
        /* console.log(
          'ManageAppointments: API returned',
          data?.length,
          'tickets',
        ); */
        /* console.log(
          'ManageAppointments: Checking claimedBy fields:',
          data?.map((t) => ({
            id: t.id,
            status: t.status,
            claimedBy: t.claimedBy,
          })),
        ); */

        setTickets((prevTickets) => {
          let triageDraftsByTicketId = {};
          try {
            const rawDrafts = localStorage.getItem(TRIAGE_DRAFTS_STORAGE_KEY);
            const parsedDrafts = rawDrafts ? JSON.parse(rawDrafts) : {};
            triageDraftsByTicketId =
              parsedDrafts && typeof parsedDrafts === 'object' ? parsedDrafts : {};
          } catch {
            triageDraftsByTicketId = {};
          }

          const apiTickets = data || [];
          const apiTicketIds = new Set(apiTickets.map((t) => t.id));

          const prunedDrafts = {};
          for (const apiTicket of apiTickets) {
            const draft = triageDraftsByTicketId[Number(apiTicket.id)];
            if (!draft) continue;

            const ticketFingerprint = getTicketDraftFingerprint(apiTicket);
            if (
              !draft.__ticketFingerprint ||
              !ticketFingerprint ||
              draft.__ticketFingerprint === ticketFingerprint
            ) {
              prunedDrafts[Number(apiTicket.id)] = draft;
            }
          }

          try {
            localStorage.setItem(
              TRIAGE_DRAFTS_STORAGE_KEY,
              JSON.stringify(prunedDrafts),
            );
          } catch {
            // Ignore localStorage write failures.
          }

          const localOnlyTickets = prevTickets.filter(
            (t) => !apiTicketIds.has(t.id),
          );

          const mergedApiTickets = apiTickets.map((apiTicket) => {
            const localTicket = prevTickets.find((t) => t.id === apiTicket.id);
            const localDraft = prunedDrafts[Number(apiTicket.id)] || {};
            const draftStatus = localDraft.status || localDraft.triageStatus || null;

            return {
              ...apiTicket,
              status: draftStatus || apiTicket.status || localTicket?.status,
              claimedBy: apiTicket.claimedBy || localTicket?.claimedBy || null,
            };
          });

          const mergedTickets = [...mergedApiTickets, ...localOnlyTickets];

          /* console.log('ManageAppointments: Merged tickets count:', {
            fromAPI: apiTickets.length,
            localOnly: localOnlyTickets.length,
            total: mergedTickets.length,
          }); */

          /* console.log(
            'ManageAppointments: Sample ticket after merge:',
            mergedTickets[0],
          ); */

          return mergedTickets;
        });
      } catch (error) {
        console.error(
          'ManageAppointments: Error loading tickets from API:',
          error,
        );
      }
    };

    loadTicketsData();

    const interval = setInterval(loadTicketsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceTicket, setInvoiceTicket] = useState(null);
  const [invoiceData, setInvoiceData] = useState(createInitialInvoiceData());
  const [specialistAvailable, setSpecialistAvailable] = useState(null);
  const [hmoVerified, setHmoVerified] = useState(null);
  const [assignedSpecialist, setAssignedSpecialist] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);
  const [ticketDetailTab, setTicketDetailTab] = useState('assessment');
  const [urgency, setUrgency] = useState('medium');
  const [targetSpecialty, setTargetSpecialty] = useState('');
  const [isTriaging, setIsTriaging] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const nurseName = getNurseFirstName();
  const nurseId = user?.id ?? null;

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const doctorsData = await fetchDoctorsFromAPI();
        setDoctors(doctorsData || []);
      } catch (error) {
        console.error('Error loading doctors:', error);
        setDoctors([
          { id: 1, name: 'Dr. Smith', specialization: 'General Medicine' },
          { id: 2, name: 'Dr. Lee', specialization: 'Cardiology' },
          { id: 3, name: 'Dr. Patel', specialization: 'Neurology' },
        ]);
      }
    };
    loadDoctors();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/');
  };

  const updateStatus = async (ticketId, newStatus) => {
    /* console.log(
      'ManageAppointments: Updating ticket status:',
      ticketId,
      newStatus,
    ); */

    if (!USE_API) {
      // console.log('ManageAppointments: API disabled, updating status locally');
      setTickets((prev) => updateTicketStatus(prev, ticketId, newStatus));

      if (newStatus === 'For Payment')
        addNotification('Payment', `Invoice generated for ticket ${ticketId}`);
      if (newStatus === 'Confirmed')
        addNotification(
          'Payment Confirmation',
          `Payment confirmed for ticket ${ticketId}`,
        );
      return;
    }

    try {
      await updateTicket(ticketId, { status: newStatus });
      /* console.log(
        'ManageAppointments: Ticket status updated successfully in API',
      ); */

      setTickets((prev) => updateTicketStatus(prev, ticketId, newStatus));

      if (newStatus === 'For Payment')
        addNotification('Payment', `Invoice generated for ticket ${ticketId}`);
      if (newStatus === 'Confirmed')
        addNotification(
          'Payment Confirmation',
          `Payment confirmed for ticket ${ticketId}`,
        );
    } catch (error) {
      console.error(
        'ManageAppointments: Error updating ticket status in API:',
        error,
      );

      setTickets((prev) => updateTicketStatus(prev, ticketId, newStatus));

      if (newStatus === 'For Payment')
        addNotification(
          'Payment',
          `Invoice generated locally (API unavailable)`,
        );
      if (newStatus === 'Confirmed')
        addNotification(
          'Payment Confirmation',
          `Payment confirmed locally (API unavailable)`,
        );
    }
  };

  const openInvoice = (ticket) => {
    const invoiceInitData = initializeInvoice();
    setInvoiceData(invoiceInitData);
    setInvoiceTicket(ticket);
    setShowInvoiceModal(true);
  };

  const addInvoiceItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: '', description: '', quantity: 1, amount: 0 },
      ],
    }));
  };
  const removeInvoiceItem = (index) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };
  const updateInvoiceItem = (index, field, value) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((it, i) =>
        i === index ? { ...it, [field]: value } : it,
      ),
    }));
  };
  const invoiceTotal = useMemo(
    () => calculateInvoiceTotal(invoiceData),
    [invoiceData],
  );

  const sendInvoice = (e) => {
    e.preventDefault();
    if (!invoiceTicket) return;
    updateStatus(invoiceTicket.id, 'Processing');
    setShowInvoiceModal(false);
    alert("Invoice sent to patient's email (simulated).");
  };

  const simulatePayment = (ticketId) => {
    updateStatus(ticketId, 'Confirmed');
  };

  const handleReschedule = async (ticketId) => {
    if (!rescheduleDate || !rescheduleTime) {
      alert('Please select both date and time for rescheduling.');
      return;
    }

    // console.log('ManageAppointments: Rescheduling ticket:', ticketId);

    if (!USE_API) {
      // console.log('ManageAppointments: API disabled, rescheduling locally');
      setTickets((prev) =>
        rescheduleTicket(prev, ticketId, rescheduleDate, rescheduleTime),
      );
      setRescheduleDate('');
      setRescheduleTime('');
      alert('Appointment rescheduled successfully!');
      addNotification(
        'Reschedule',
        `Ticket ${ticketId} rescheduled to ${rescheduleDate} at ${rescheduleTime}`,
      );
      return;
    }

    try {
      await updateTicket(ticketId, {
        preferredDate: rescheduleDate,
        preferredTime: rescheduleTime,
      });
      // console.log('ManageAppointments: Ticket rescheduled successfully in API');

      setTickets((prev) =>
        rescheduleTicket(prev, ticketId, rescheduleDate, rescheduleTime),
      );
      setRescheduleDate('');
      setRescheduleTime('');
      alert('Appointment rescheduled successfully!');
      addNotification(
        'Reschedule',
        `Ticket ${ticketId} rescheduled to ${rescheduleDate} at ${rescheduleTime}`,
      );
    } catch (error) {
      console.error(
        'ManageAppointments: Error rescheduling ticket in API:',
        error,
      );

      setTickets((prev) =>
        rescheduleTicket(prev, ticketId, rescheduleDate, rescheduleTime),
      );
      setRescheduleDate('');
      setRescheduleTime('');
      alert('Appointment rescheduled locally (API unavailable)');
      addNotification('Reschedule', `Ticket ${ticketId} rescheduled locally`);
    }
  };

  const handleCompleteTriage = async (ticketId) => {
    if (!targetSpecialty) {
      alert('Please enter a target specialty.');
      return;
    }

    setIsTriaging(true);
    try {
      const triageData = {
        ticketId: parseInt(ticketId, 10),
        targetSpecialty,
        urgency,
      };

      await triageTicket(triageData);

      if (assignedSpecialist) {
        await assignSpecialist(
          parseInt(ticketId, 10),
          parseInt(assignedSpecialist, 10),
        );
      }

      alert('Ticket triaged successfully!');
      setSelectedTicket(null);
      window.location.reload();
    } catch (error) {
      console.error('Error triaging ticket:', error);
      alert('Failed to triage ticket: ' + error.message);
    } finally {
      setIsTriaging(false);
    }
  };

  const processingTickets = filterTicketsByStatus(
    tickets,
    'Processing',
    nurseId,
  );

  const handleDownloadInvoice = () => {
    generateInvoicePDF(invoiceData, invoiceTicket);
  };

  return (
    <div className='dashboard nurse-manage-dashboard'>
      <div className='dashboard-header'>
        <div className='header-center'>
          <img
            src='/okie-doc-logo.png'
            alt='Okie-Doc+'
            className='logo-image'
          />
        </div>
        <h3 className='dashboard-title'>Manage Appointments</h3>
        <div className='nurse-header-actions'>
          <NotificationBell />
          <div className='user-account'>
            <Avatar
              profileImageUrl={getNurseProfileImage() !== '/account.svg' ? getNurseProfileImage() : null}
              firstName={nurseName}
              lastName={localStorage.getItem('nurse.lastName') || ''}
              userType='nurse'
              size={40}
              alt='Account'
              className='account-icon'
            />
            <span className='account-name'>{nurseName}</span>
            <div className='account-dropdown'>
              <button
                className='dropdown-item'
                onClick={() => navigate('/nurse-myaccount')}
              >
                My Account
              </button>
              <button
                className='dropdown-item logout-item'
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className='dashboard-nav'>
          <button
            className='nav-tab'
            onClick={() => navigate('/nurse-dashboard')}
          >
            Dashboard
          </button>
          <button className='nav-tab active'>Manage Appointments</button>
          <button
            className='nav-tab'
            onClick={() => navigate('/nurse-messages')}
          >
            Messages
          </button>
        </div>
      </div>

      <div className='appointments-section'>
        <div className='tickets-container'>
          <div className='processing-tickets'>
            <h2>Processing Tickets ({processingTickets.length})</h2>
            {processingTickets.map((ticket) => (
              <div
                key={ticket.id}
                className='ticket-card-new'
                onClick={() => {
                  setSelectedTicket(ticket);
                  setShowTicketDetailModal(true);
                  setTicketDetailTab('assessment');
                }}
                style={{ cursor: 'pointer', borderLeftColor: '#2196f3' }}
              >
                <div className='ticket-card-header'>
                  <span className='ticket-number'>TICKET #{ticket.id}</span>
                </div>

                <div className='ticket-card-body'>
                  <div className='ticket-left-section'>
                    <div className='ticket-patient-details'>
                      <h4 className='ticket-section-title'>PATIENT DETAILS</h4>
                      <div className='ticket-details-grid'>
                        <div className='ticket-details-col'>
                          <p>
                            <strong>Name:</strong> {ticket.patientName}
                          </p>
                          <p>
                            <strong>Age:</strong>{' '}
                            {ticket.age ||
                              calculateAge(ticket.patientBirthdate) ||
                              'N/A'}
                          </p>
                          <p>
                            <strong>Birthdate:</strong>{' '}
                            {formatDate(ticket.patientBirthdate) || 'N/A'}
                          </p>
                        </div>
                        <div className='ticket-details-col'>
                          <p>
                            <strong>Email:</strong> {ticket.email}
                          </p>
                          <p>
                            <strong>Mobile:</strong> {ticket.mobile}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='ticket-assignments'>
                      <p>
                        <strong>Assigned Nurse:</strong>{' '}
                        {ticket.assignedNurse || nurseName}
                      </p>
                      <p>
                        <strong>Assigned Specialist:</strong>{' '}
                        {ticket.assignedSpecialist ||
                          ticket.preferredSpecialist ||
                          'Not specified'}
                      </p>
                      <p>
                        <strong>Consultation Type:</strong>{' '}
                        {ticket.consultationType || ticket.chiefComplaint}
                      </p>
                    </div>
                  </div>

                  <div className='ticket-right-section'>
                    <div className='ticket-meta'>
                      <p>
                        <strong>Date Created:</strong>{' '}
                        {formatDate(ticket.createdAt) || ticket.dateCreated}
                      </p>
                      <p>
                        <strong>Status:</strong>{' '}
                        <span
                          className='ticket-status-text processing'
                          style={{ color: '#2196f3' }}
                        >
                          {ticket.status}
                        </span>
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {ticket.claimedBy ? (
                        <button
                          className='ticket-history-btn'
                          onClick={() => openInvoice(ticket)}
                        >
                          Generate Invoice
                        </button>
                      ) : (
                        <button
                          className='ticket-history-btn'
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          Manage
                        </button>
                      )}
                      <button
                        className='ticket-history-btn'
                        style={{ background: '#4caf50' }}
                        onClick={() => simulatePayment(ticket.id)}
                      >
                        Simulate Payment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {selectedTicket && !showTicketDetailModal && (
        <div className='modal-overlay'>
          <div className='ticket-modal'>
            <div className='modal-header'>
              <h2>Patient Ticket Details</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className='close-btn'
              >
                ×
              </button>
            </div>
            <div className='modal-body'>
              <div className='patient-info'>
                <h3>Patient Information</h3>
                <div className='info-grid'>
                  <div className='info-item'>
                    <label>Name:</label>
                    <span>{selectedTicket.patientName}</span>
                  </div>
                  <div className='info-item'>
                    <label>Email:</label>
                    <span>{selectedTicket.email}</span>
                  </div>
                  <div className='info-item'>
                    <label>Mobile:</label>
                    <span>{selectedTicket.mobile}</span>
                  </div>
                </div>
              </div>

              <div className='medical-info'>
                <h3>Medical Information</h3>
                <div className='info-grid'>
                  <div className='info-item'>
                    <label>Chief Complaint:</label>
                    <span>{selectedTicket.chiefComplaint}</span>
                  </div>
                  <div className='info-item'>
                    <label>Symptoms:</label>
                    <span>{selectedTicket.symptoms}</span>
                  </div>
                  <div className='info-item'>
                    <label>Other Symptoms:</label>
                    <span>{selectedTicket.otherSymptoms || 'None'}</span>
                  </div>
                  <div className='info-item'>
                    <label>Actual Chief Complaint (Nurse):</label>
                    <span>{selectedTicket.actualChiefComplaint || ''}</span>
                  </div>
                  <div className='info-item'>
                    <label>Medical Records:</label>
                    <div className='view-pills-container'>
                      {selectedTicket.medicalRecordsPills &&
                      selectedTicket.medicalRecordsPills.length > 0 ? (
                        <div className='view-pills'>
                          {selectedTicket.medicalRecordsPills.map(
                            (text, index) => (
                              <div key={index} className='view-pill'>
                                <span>{text}</span>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <span>No data</span>
                      )}
                    </div>
                  </div>
                  <div className='info-item'>
                    <label>Family History:</label>
                    <div className='view-pills-container'>
                      {selectedTicket.familyHistoryPills &&
                      selectedTicket.familyHistoryPills.length > 0 ? (
                        <div className='view-pills'>
                          {selectedTicket.familyHistoryPills.map(
                            (text, index) => (
                              <div key={index} className='view-pill'>
                                <span>{text}</span>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <span>No data</span>
                      )}
                    </div>
                  </div>
                  <div className='info-item'>
                    <label>Allergies:</label>
                    <div className='view-pills-container'>
                      {selectedTicket.allergiesPills &&
                      selectedTicket.allergiesPills.length > 0 ? (
                        <div className='view-pills'>
                          {selectedTicket.allergiesPills.map((text, index) => (
                            <div key={index} className='view-pill'>
                              <span>{text}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span>No data</span>
                      )}
                    </div>
                  </div>
                  <div className='info-item'>
                    <label>Smoking:</label>
                    <span>{selectedTicket.smoking || ''}</span>
                  </div>
                  <div className='info-item'>
                    <label>Drinking:</label>
                    <span>{selectedTicket.drinking || ''}</span>
                  </div>
                </div>
              </div>

              <div className='appointment-info'>
                <h3>Appointment Details</h3>
                <div className='info-grid'>
                  <div className='info-item'>
                    <label>Preferred Date:</label>
                    <span>{formatDate(selectedTicket.preferredDate)}</span>
                  </div>
                  <div className='info-item'>
                    <label>Preferred Time:</label>
                    <span>{selectedTicket.preferredTime}</span>
                  </div>
                  <div className='info-item'>
                    <label>Preferred Specialist:</label>
                    <span>{selectedTicket.preferredSpecialist}</span>
                  </div>
                  <div className='info-item'>
                    <label>Consultation Channel:</label>
                    <span>{selectedTicket.consultationChannel}</span>
                  </div>
                </div>
              </div>

              {selectedTicket.hmo && (
                <div className='hmo-info'>
                  <h3>HMO Information</h3>
                  <div className='info-grid'>
                    <div className='info-item'>
                      <label>Company:</label>
                      <span>{selectedTicket.hmo.company}</span>
                    </div>
                    <div className='info-item'>
                      <label>Member ID:</label>
                      <span>{selectedTicket.hmo.memberId}</span>
                    </div>
                    <div className='info-item'>
                      <label>Expiration Date:</label>
                      <span>{selectedTicket.hmo.expirationDate}</span>
                    </div>
                    <div className='info-item'>
                      <label>LOA Code:</label>
                      <span>{selectedTicket.hmo.loaCode}</span>
                    </div>
                    <div className='info-item'>
                      <label>eLOA File:</label>
                      <span>{selectedTicket.hmo.eLOAFile}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className='specialist-verification'>
                <h3>Specialist & HMO Verification</h3>
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    marginBottom: 12,
                    justifyContent: 'center',
                  }}
                >
                  <button
                    className='action-btn confirm'
                    style={{ background: '#4caf50', color: '#fff' }}
                    onClick={() => setSpecialistAvailable(true)}
                  >
                    Specialist Available
                  </button>
                  <button
                    className='action-btn warn'
                    style={{ background: '#ff9800', color: '#fff' }}
                    onClick={() => setSpecialistAvailable(false)}
                  >
                    Specialist Unavailable
                  </button>
                </div>
                {selectedTicket.hasHMO && (
                  <div
                    style={{
                      marginBottom: 12,
                      display: 'flex',
                      gap: 16,
                      justifyContent: 'center',
                    }}
                  >
                    <button
                      className='action-btn confirm'
                      style={{ background: '#2196f3', color: '#fff' }}
                      onClick={() => setHmoVerified(true)}
                    >
                      Verify HMO
                    </button>
                    <button
                      className='action-btn warn'
                      style={{ background: '#f44336', color: '#fff' }}
                      onClick={() => setHmoVerified(false)}
                    >
                      Reject HMO
                    </button>
                  </div>
                )}
                {specialistAvailable === true && (
                  <div style={{ marginBottom: 12, color: '#4caf50' }}>
                    Specialist is available for consultation.
                  </div>
                )}
                {specialistAvailable === false && (
                  <div style={{ marginBottom: 12, color: '#ff9800' }}>
                    Specialist is unavailable. Please call patient for
                    arrangement or reschedule.
                  </div>
                )}
                {hmoVerified === true && (
                  <div style={{ marginBottom: 12, color: '#2196f3' }}>
                    HMO verified. You may proceed to generate invoice charged to
                    HMO.
                  </div>
                )}
                {hmoVerified === false && (
                  <div style={{ marginBottom: 12, color: '#f44336' }}>
                    HMO details cannot be verified. Please contact patient for
                    arrangement.
                  </div>
                )}
              </div>

              <div
                className='specialist-actions'
                style={{ marginTop: 24, marginBottom: 16 }}
              >
                <h3 style={{ marginBottom: 16 }}>Triage & Assign</h3>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    Target Specialty:
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. Pediatrics, Cardiology'
                    value={targetSpecialty}
                    onChange={(e) => setTargetSpecialty(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 4,
                    }}
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    Urgency:
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 4,
                    }}
                  >
                    <option value='low'>Low</option>
                    <option value='medium'>Medium</option>
                    <option value='high'>High</option>
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    Assign Specialist (Optional):
                  </label>
                  <select
                    id='specialist-select'
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 4,
                    }}
                    value={assignedSpecialist}
                    onChange={(e) => setAssignedSpecialist(e.target.value)}
                  >
                    <option value=''>Select Specialist</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className='action-btn'
                  style={{
                    width: '100%',
                    background: '#28a745',
                    color: '#fff',
                    padding: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderRadius: 4,
                  }}
                  disabled={isTriaging}
                  onClick={() => handleCompleteTriage(selectedTicket.id)}
                >
                  {isTriaging ? 'Completing Triage...' : 'Complete Triage'}
                </button>
              </div>
              <div
                className='reschedule-actions'
                style={{ marginTop: 16, marginBottom: 0 }}
              >
                <h3 style={{ marginBottom: 8 }}>Reschedule</h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    justifyContent: 'center',
                  }}
                >
                  <label htmlFor='reschedule-date' style={{ marginRight: 4 }}>
                    Date:
                  </label>
                  <input
                    id='reschedule-date'
                    type='date'
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    style={{
                      marginRight: 8,
                      padding: '6px 12px',
                      borderRadius: 4,
                    }}
                  />
                  <label htmlFor='reschedule-time' style={{ marginRight: 4 }}>
                    Time:
                  </label>
                  <input
                    id='reschedule-time'
                    type='time'
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    style={{
                      marginRight: 8,
                      padding: '6px 12px',
                      borderRadius: 4,
                    }}
                  />
                  <button
                    className='action-btn'
                    style={{
                      background: '#2196f3',
                      color: '#fff',
                      padding: '6px 16px',
                      borderRadius: 4,
                    }}
                    onClick={() => handleReschedule(selectedTicket.id)}
                  >
                    Reschedule
                  </button>
                </div>
              </div>

              <div className='ros-info' style={{ marginTop: 24 }}>
                <h3>Review of Systems</h3>
                <div className='info-grid'>
                  {selectedTicket.ros &&
                  Object.values(selectedTicket.ros).flat().length > 0 ? (
                    Object.values(selectedTicket.ros)
                      .flat()
                      .map((item, idx) => (
                        <div key={idx} className='info-item'>
                          <span>{item}</span>
                        </div>
                      ))
                  ) : (
                    <div className='info-item'>No ROS data provided.</div>
                  )}
                </div>
              </div>

              <div className='painmap-info' style={{ marginTop: 24 }}>
                <h3>Pain Map</h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <img
                    src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/1506_Referred_Pain_Chart.jpg/1280px-1506_Referred_Pain_Chart.jpg'
                    alt='Pain Map'
                    style={{
                      height: 180,
                      borderRadius: 8,
                      border: '1px solid #ccc',
                      background: '#fff',
                      marginBottom: 12,
                    }}
                  />
                  <div style={{ textAlign: 'center' }}>
                    {selectedTicket.painMap &&
                    selectedTicket.painMap.length > 0 ? (
                      selectedTicket.painMap.map((area, idx) => (
                        <div key={idx} className='info-item'>
                          <span>{area}</span>
                        </div>
                      ))
                    ) : (
                      <div className='info-item'>No pain areas selected.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className='ticket-actions' style={{ marginTop: 12 }}>
                {!selectedTicket.claimedBy &&
                  selectedTicket.status !== 'Pending' && (
                    <button
                      className='action-btn edit'
                      onClick={() => openInvoice(selectedTicket)}
                    >
                      Generate Invoice
                    </button>
                  )}
                {selectedTicket.status === 'Processing' && (
                  <button
                    className='action-btn edit'
                    onClick={() => {
                      updateStatus(selectedTicket.id, 'Completed');
                    }}
                    style={{ backgroundColor: '#28a745' }}
                  >
                    Mark Completed
                  </button>
                )}
                <button
                  className='action-btn'
                  onClick={() => updateStatus(selectedTicket.id, 'Incomplete')}
                >
                  Mark Incomplete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className='modal-overlay'>
          <div className='invoice-modal'>
            <div className='modal-header'>
              <img
                src='/okie-doc-logo.png'
                alt='OkieDoc+ Logo'
                style={{ height: 48, marginBottom: 8, opacity: 1 }}
              />
              <h2>Generate Invoice</h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className='close-btn'
              >
                ×
              </button>
            </div>
            <div className='modal-body' style={{ padding: 20, opacity: 1 }}>
              <div className='invoice-info'>
                <p>
                  <strong>Invoice No.:</strong> {invoiceData.invoiceNumber}
                </p>
                <p>
                  <strong>Date of Consultation:</strong>{' '}
                  {formatDate(invoiceTicket?.preferredDate)}{' '}
                  {invoiceTicket?.preferredTime}
                </p>
                <p>
                  <strong>Patient Name:</strong> {invoiceTicket?.patientName}
                </p>
                <p>
                  <strong>Mobile Number:</strong> {invoiceTicket?.mobile}
                </p>
                <p>
                  <strong>Email Address:</strong> {invoiceTicket?.email}
                </p>
              </div>
              <form onSubmit={sendInvoice} className='invoice-form'>
                <div className='invoice-items'>
                  <h3>Invoice Items</h3>
                  {invoiceData.items.map((item, idx) => (
                    <div key={idx} className='invoice-item'>
                      <input
                        type='text'
                        placeholder='Item name'
                        value={item.name}
                        onChange={(e) =>
                          updateInvoiceItem(idx, 'name', e.target.value)
                        }
                        required
                      />
                      <input
                        type='text'
                        placeholder='Description'
                        value={item.description}
                        onChange={(e) =>
                          updateInvoiceItem(idx, 'description', e.target.value)
                        }
                      />
                      <input
                        type='number'
                        placeholder='Qty'
                        value={item.quantity}
                        onChange={(e) =>
                          updateInvoiceItem(
                            idx,
                            'quantity',
                            parseInt(e.target.value) || 0,
                          )
                        }
                        min='1'
                        required
                      />
                      <input
                        type='number'
                        placeholder='Amount'
                        value={item.amount}
                        onChange={(e) =>
                          updateInvoiceItem(
                            idx,
                            'amount',
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        min='0'
                        step='0.01'
                        required
                      />
                      <button
                        type='button'
                        onClick={() => removeInvoiceItem(idx)}
                        className='remove-item-btn'
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type='button'
                    onClick={addInvoiceItem}
                    className='add-item-btn'
                  >
                    + Add Item
                  </button>
                </div>
                <div className='invoice-fees'>
                  <div className='fee-item'>
                    <label>Platform Fee:</label>
                    <input
                      type='number'
                      value={invoiceData.platformFee}
                      onChange={(e) =>
                        setInvoiceData((prev) => ({
                          ...prev,
                          platformFee: parseFloat(e.target.value) || 0,
                        }))
                      }
                      min='0'
                      step='0.01'
                    />
                  </div>
                  <div className='fee-item'>
                    <label>E-Nurse Fee:</label>
                    <input
                      type='number'
                      value={invoiceData.eNurseFee}
                      onChange={(e) =>
                        setInvoiceData((prev) => ({
                          ...prev,
                          eNurseFee: parseFloat(e.target.value) || 0,
                        }))
                      }
                      min='0'
                      step='0.01'
                    />
                  </div>
                </div>
                <div style={{ padding: '0 20px 10px 20px', opacity: 1 }}>
                  <h3>Items</h3>
                  {invoiceData.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8 }}>
                      <span>{item.name}</span>
                      <span>{item.description}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>Amount: ₱{item.amount}</span>
                    </div>
                  ))}
                  <p>
                    <strong>Platform Fee:</strong> ₱{invoiceData.platformFee}
                  </p>
                  <p>
                    <strong>E-Nurse Fee:</strong> ₱{invoiceData.eNurseFee}
                  </p>
                  <h3>Total Amount: ₱{invoiceTotal.toFixed(2)}</h3>
                  <p>
                    <strong>Payment Link:</strong> {invoiceData.paymentLink}
                  </p>
                  <footer style={{ marginTop: 16, fontSize: 12, opacity: 1 }}>
                    <strong>OkieDoc+ Address:</strong> 123 Health St, Wellness
                    City, Country
                  </footer>
                </div>
                <div className='modal-actions'>
                  <button type='submit' className='submit-btn'>
                    Send Invoice
                  </button>
                  <button
                    type='button'
                    onClick={handleDownloadInvoice}
                    className='submit-btn'
                    style={{ marginLeft: 8 }}
                  >
                    Download PDF
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowInvoiceModal(false)}
                    className='cancel-btn'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showTicketDetailModal && selectedTicket && (
        <div className='modal-overlay'>
          <div
            className='ticket-detail-modal'
            style={{ maxWidth: 900, width: '90%' }}
          >
            <div
              className='modal-header'
              style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: 16 }}
            >
              <div>
                <h2 style={{ margin: 0, color: '#0b5388' }}>
                  TICKET #{selectedTicket.id}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowTicketDetailModal(false);
                  setSelectedTicket(null);
                }}
                className='close-btn'
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: '16px 24px',
                background: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: '0 0 4px',
                      fontSize: 12,
                      color: '#666',
                      textTransform: 'uppercase',
                    }}
                  >
                    Patient Details
                  </p>
                  <p style={{ margin: '0 0 4px' }}>
                    <strong>Name:</strong> {selectedTicket.patientName}
                  </p>
                  <p style={{ margin: '0 0 4px' }}>
                    <strong>Email:</strong> {selectedTicket.email}
                  </p>
                  <p style={{ margin: '0 0 4px' }}>
                    <strong>Age:</strong>{' '}
                    {selectedTicket.age ||
                      calculateAge(selectedTicket.patientBirthdate) ||
                      'N/A'}
                  </p>
                  <p style={{ margin: '0 0 4px' }}>
                    <strong>Mobile:</strong> {selectedTicket.mobile}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Birthdate:</strong>{' '}
                    {formatDate(selectedTicket.patientBirthdate) || 'N/A'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 4px', color: '#0b5388' }}>
                    <strong>Date Created:</strong>{' '}
                    {formatDate(selectedTicket.createdAt)}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Status:</strong>{' '}
                    <span
                      style={{
                        color:
                          selectedTicket.status === 'Confirmed'
                            ? '#4caf50'
                            : selectedTicket.status === 'Processing'
                              ? '#2196f3'
                              : '#ff9800',
                      }}
                    >
                      {selectedTicket.status}
                    </span>
                  </p>
                </div>
              </div>
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid #e0e0e0',
                }}
              >
                <p style={{ margin: '0 0 4px' }}>
                  <strong>Assigned Nurse:</strong>{' '}
                  {selectedTicket.assignedNurse || nurseName || 'N/A'}
                </p>
                <p style={{ margin: '0 0 4px' }}>
                  <strong>Assigned Specialist:</strong>{' '}
                  {selectedTicket.assignedSpecialist || 'Not specified'}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Consultation Type:</strong>{' '}
                  {selectedTicket.consultationChannel ||
                    selectedTicket.chiefComplaint}
                </p>
              </div>
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <button
                  className='action-btn'
                  style={{
                    background: '#0b5388',
                    color: '#fff',
                    padding: '8px 20px',
                    borderRadius: 20,
                  }}
                  onClick={() => alert('Feature in progress')}
                >
                  Consultation Histories
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                borderBottom: '2px solid #e0e0e0',
                background: '#fff',
              }}
            >
              {[
                'assessment',
                'medicalHistory',
                'laboratoryRequest',
                'prescription',
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTicketDetailTab(tab)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: 'none',
                    background:
                      ticketDetailTab === tab ? '#e3f2fd' : 'transparent',
                    color: ticketDetailTab === tab ? '#0b5388' : '#666',
                    fontWeight: ticketDetailTab === tab ? 600 : 400,
                    cursor: 'pointer',
                    borderBottom:
                      ticketDetailTab === tab
                        ? '2px solid #0b5388'
                        : '2px solid transparent',
                    marginBottom: '-2px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab === 'assessment' && 'Assessment'}
                  {tab === 'medicalHistory' && 'Medical History'}
                  {tab === 'laboratoryRequest' && 'Laboratory Request'}
                  {tab === 'prescription' && 'Prescription'}
                </button>
              ))}
            </div>

            <div
              className='modal-body'
              style={{
                padding: 24,
                maxHeight: 400,
                overflowY: 'auto',
                background: '#e8f4fc',
              }}
            >
              {ticketDetailTab === 'assessment' && (
                <div>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    "Sed ut perspiciatis unde omnis iste natus error sit
                    voluptatem accusantium doloremque laudantium, totam rem
                    aperiam, eaque ipsa quae ab illo inventore veritatis et
                    quasi architecto beatae vitae dicta sunt explicabo. Nemo
                    enim ipsam
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    voluptatem quia voluptas sit aspernatur aut odit aut fugit,
                    sed quia consequuntur magni dolores eos qui ratione
                    voluptatem sequi nesciunt. Neque porro quisquam est, qui
                    dolorem ipsum quia dolor sit amet, consectetur, adipisci
                    velit, sed quia non numquam eius modi tempora incidunt ut
                    labore et dolore magnam aliquam quaerat voluptatem.
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    Ut enim ad minima veniam, quis nostrum exercitationem ullam
                    corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
                    consequatur? Quis autem vel eum iure reprehenderit qui in ea
                    voluptate velit esse quam nihil molestiae consequatur, vel
                    illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
                  </p>
                </div>
              )}

              {ticketDetailTab === 'medicalHistory' && (
                <div>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                    sed do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum."
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    Sed ut perspiciatis unde omnis iste natus error sit
                    voluptatem accusantium doloremque laudantium, totam rem
                    aperiam, eaque ipsa quae ab illo inventore veritatis et
                    quasi architecto beatae vitae dicta sunt explicabo.
                  </p>
                </div>
              )}

              {ticketDetailTab === 'laboratoryRequest' && (
                <div>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    "At vero eos et accusamus et iusto odio dignissimos ducimus
                    qui blanditiis praesentium voluptatum deleniti atque
                    corrupti quos dolores et quas molestias excepturi sint
                    occaecati cupiditate non provident.
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    Similique sunt in culpa qui officia deserunt mollitia animi,
                    id est laborum et dolorum fuga. Et harum quidem rerum
                    facilis est et expedita distinctio."
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    Nam libero tempore, cum soluta nobis est eligendi optio
                    cumque nihil impedit quo minus id quod maxime placeat facere
                    possimus, omnis voluptas assumenda est, omnis dolor
                    repellendus.
                  </p>
                </div>
              )}

              {ticketDetailTab === 'prescription' && (
                <div>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    "Temporibus autem quibusdam et aut officiis debitis aut
                    rerum necessitatibus saepe eveniet ut et voluptates
                    repudiandae sint et molestiae non recusandae. Itaque earum
                    rerum hic tenetur a sapiente delectus.
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    Ut aut reiciendis voluptatibus maiores alias consequatur aut
                    perferendis doloribus asperiores repellat. Nam libero
                    tempore, cum soluta nobis est eligendi optio cumque nihil
                    impedit quo minus id quod maxime placeat facere possimus."
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    Omnis voluptas assumenda est, omnis dolor repellendus.
                    Temporibus autem quibusdam et aut officiis debitis aut rerum
                    necessitatibus saepe eveniet ut et voluptates repudiandae
                    sint et molestiae non recusandae.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
