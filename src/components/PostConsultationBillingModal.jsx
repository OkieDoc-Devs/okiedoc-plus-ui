import { useEffect, useMemo, useState } from 'react';
import './PostConsultationBillingModal.css';
import { Clock3, CreditCard, Download, Send } from 'lucide-react';

const DEFAULT_ADDITIONAL_SERVICES = [
  { id: 'medical-certificate', label: 'Medical Certificate', amount: 200 },
  { id: 'medical-clearance', label: 'Medical Clearance', amount: 300 },
  { id: 'lab-request', label: 'Lab Request', amount: 150 },
  { id: 'treatment-plan', label: 'Treatment Plan', amount: 250 },
  { id: 'specialist-addon-fee', label: 'Specialist Add-on Fee', amount: 500 },
  { id: 'followup-consultation', label: 'Follow-up Consultation', amount: 400 },
];

function toPeso(value) {
  return `PHP ${Number(value || 0).toFixed(2)}`;
}

export default function PostConsultationBillingModal({
  isOpen,
  ticket,
  onClose,
  onDownloadPDF,
  onSendToPatient,
  onRedirectPaymentGateway,
  onViewHistory,
}) {
  const [paymentType, setPaymentType] = useState('Private');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [additionalServices, setAdditionalServices] = useState(
    DEFAULT_ADDITIONAL_SERVICES.map((service) => ({ ...service, selected: false })),
  );
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServiceAmount, setCustomServiceAmount] = useState('');
  const [customServices, setCustomServices] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    setPaymentType('Private');
    setPaymentStatus('Pending');
    setAdditionalServices(
      DEFAULT_ADDITIONAL_SERVICES.map((service) => ({ ...service, selected: false })),
    );
    setCustomServiceName('');
    setCustomServiceAmount('');
    setCustomServices([]);
  }, [isOpen, ticket?.id]);

  const baseConsultationFee = Number(ticket?.consultationFee || 500);

  const additionalTotal = useMemo(
    () =>
      additionalServices.reduce(
        (sum, service) => sum + (service.selected ? Number(service.amount) : 0),
        0,
      ),
    [additionalServices],
  );

  const customTotal = useMemo(
    () =>
      customServices.reduce(
        (sum, service) => sum + Number(service.amount || 0),
        0,
      ),
    [customServices],
  );

  const subtotal = baseConsultationFee + additionalTotal + customTotal;
  const finalTotal = subtotal;

  if (!isOpen || !ticket) return null;

  const ticketId = `T-${String(ticket.id).padStart(3, '0')}`;

  const toggleAdditionalService = (serviceId) => {
    setAdditionalServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? { ...service, selected: !service.selected }
          : service,
      ),
    );
  };

  const handleAddCustomService = () => {
    const trimmedName = customServiceName.trim();
    const parsedAmount = Number(customServiceAmount);
    if (!trimmedName || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    setCustomServices((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, label: trimmedName, amount: parsedAmount },
    ]);
    setCustomServiceName('');
    setCustomServiceAmount('');
  };

  const billingPayload = {
    patientName: ticket.patientName || 'N/A',
    ticketId,
    consultationType: ticket.consultationType || ticket.chiefComplaint || 'N/A',
    assignedDoctor:
      ticket.assignedSpecialist || ticket.preferredSpecialist || 'Not yet assigned',
    consultationDate: ticket.preferredDate || ticket.createdAt || '',
    paymentType,
    paymentStatus,
    baseConsultationFee,
    selectedAdditionalServices: additionalServices.filter((service) => service.selected),
    customServices,
    subtotal,
    finalTotal,
  };
  const consultationDateLabel = billingPayload.consultationDate
    ? (() => {
        const date = new Date(billingPayload.consultationDate);
        return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
      })()
    : 'N/A';

  return (
    <div className='modal-overlay'>
      <div className='post-consultation-billing-modal'>
        <div className='post-consultation-billing-header'>
          <h2>Post-Consultation Billing</h2>
          <button className='close-btn' onClick={onClose}>
            ×
          </button>
        </div>

        <div className='post-consultation-billing-meta'>
          <div>
            <p className='billing-label'>Patient Name</p>
            <p className='billing-value'>{billingPayload.patientName}</p>
          </div>
          <div>
            <p className='billing-label'>Ticket ID</p>
            <p className='billing-value'>{billingPayload.ticketId}</p>
          </div>
          <div>
            <p className='billing-label'>Consultation Type</p>
            <p className='billing-value'>{billingPayload.consultationType}</p>
          </div>
          <div>
            <p className='billing-label'>Assigned Doctor</p>
            <p className='billing-value'>{billingPayload.assignedDoctor}</p>
          </div>
        </div>

        <div className='post-consultation-billing-body'>
          <section className='billing-section'>
            <h3>Consultation Summary</h3>
            <div className='billing-grid'>
              <div>
                <p className='billing-label'>Base Consultation Fee</p>
                <p className='billing-value billing-amount'>{toPeso(baseConsultationFee)}</p>
              </div>
              <div>
                <p className='billing-label'>Consultation Date</p>
                <p className='billing-value'>{consultationDateLabel}</p>
              </div>
              <div>
                <p className='billing-label'>Duration</p>
                <p className='billing-value'>30 mins</p>
              </div>
              <div>
                <p className='billing-label'>Payment Type</p>
                <select
                  value={paymentType}
                  onChange={(event) => setPaymentType(event.target.value)}
                  className='billing-payment-type-select'
                >
                  <option value='Private'>Private</option>
                  <option value='HMO'>HMO</option>
                  <option value='Insurance'>Insurance</option>
                </select>
              </div>
            </div>
          </section>

          <section className='billing-section'>
            <h3>Additional Billable Services</h3>
            <div className='billing-services-list'>
              {additionalServices.map((service) => (
                <label key={service.id} className='billing-service-row'>
                  <input
                    type='checkbox'
                    checked={service.selected}
                    onChange={() => toggleAdditionalService(service.id)}
                  />
                  <span>{service.label}</span>
                  <span className='billing-service-amount'>
                    <span>₱</span>
                    <span>{Number(service.amount || 0)}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className='billing-section'>
            <h3>Add Custom Service</h3>
            <div className='billing-custom-service'>
              <input
                type='text'
                placeholder='Service name...'
                value={customServiceName}
                onChange={(event) => setCustomServiceName(event.target.value)}
              />
              <input
                type='number'
                min='0'
                step='0.01'
                placeholder='Amount'
                value={customServiceAmount}
                onChange={(event) => setCustomServiceAmount(event.target.value)}
              />
              <button
                type='button'
                className='billing-add-service-btn'
                onClick={handleAddCustomService}
              >
                +
              </button>
            </div>
            {customServices.length > 0 && (
              <div className='billing-custom-list'>
                {customServices.map((service) => (
                  <div key={service.id} className='billing-service-row'>
                    <span>{service.label}</span>
                    <span>{toPeso(service.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className='billing-section billing-final-summary'>
            <h3>Final Billing Summary</h3>
            <div className='billing-summary-row'>
              <span>Base Consultation Fee</span>
              <span>{toPeso(baseConsultationFee)}</span>
            </div>
            <div className='billing-summary-row'>
              <span>Subtotal</span>
              <span>{toPeso(subtotal)}</span>
            </div>
            <div className='billing-summary-row billing-summary-total'>
              <span>Final Total</span>
              <span>{toPeso(finalTotal)}</span>
            </div>
            <div className='billing-status-row'>
              <span>Payment Status</span>
              <div className='billing-status-actions'>
                {['Pending', 'Partial', 'Paid'].map((status) => (
                  <button
                    type='button'
                    key={status}
                    className={`billing-status-btn ${paymentStatus === status ? 'active' : ''}`}
                    onClick={() => setPaymentStatus(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className='post-consultation-billing-footer'>
          <button type='button' className='billing-footer-action-btn' onClick={onClose}>
            Cancel
          </button>
          <button
            type='button'
            className='billing-footer-action-btn'
            onClick={() => onDownloadPDF?.(billingPayload)}
          >
            <Download size={18} strokeWidth={2.1} />
            Download PDF
          </button>
          <button
            type='button'
            className='billing-footer-action-btn'
            onClick={() => onSendToPatient?.(billingPayload)}
          >
            <Send size={18} strokeWidth={2.1} />
            Send to Patient
          </button>
          <button
            type='button'
            className='billing-footer-action-btn'
            onClick={() => onViewHistory?.(billingPayload)}
          >
            <Clock3 size={18} strokeWidth={2.1} />
            View History
          </button>
          <button
            type='button'
            className='billing-redirect-btn'
            onClick={() => onRedirectPaymentGateway?.(billingPayload)}
          >
            <CreditCard size={18} strokeWidth={2.1} />
            Redirect to Payment Gateway
          </button>
        </div>
      </div>
    </div>
  );
}
