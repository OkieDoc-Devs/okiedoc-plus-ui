import { useState, useEffect, useRef } from "react";

function RedirectModal({ amount = "₱800", invoice = "INV-2026-0328-001", onCancel, onComplete }) {
  const [count, setCount] = useState(3);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setDone(true);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleCancel = () => {
    clearInterval(timerRef.current);
    onCancel?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Decorative top strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500" />

        <div className="px-8 py-8 flex flex-col items-center text-center gap-5">
          {/* Spinner / checkmark — spins while counting down, shows checkmark when done */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full bg-teal-500 flex items-center justify-center ${!done ? "animate-pulse" : ""}`}>
              {done ? (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-snug">
              Redirecting to Payment<br />Gateway
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Please wait while we securely redirect you to our payment partner
            </p>
          </div>

          {/* Countdown — hidden once done */}
          {!done && (
            <div className="flex flex-col items-center gap-1">
              <span className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 font-bold text-2xl flex items-center justify-center">
                {count}
              </span>
              <span className="text-xs text-slate-400 tracking-wide">seconds remaining</span>
            </div>
          )}
          {done && (
            <p className="text-sm text-teal-600 font-medium animate-pulse">Connecting…</p>
          )}

          {/* Amount card */}
          <div className="w-full rounded-2xl bg-gradient-to-br from-sky-50 to-teal-50 border border-teal-100 px-6 py-4">
            <p className="text-xs text-slate-500 mb-1">Amount to Pay</p>
            <p className="text-3xl font-extrabold text-slate-800">{amount}</p>
            <p className="text-xs text-teal-600 mt-1">Invoice: {invoice}</p>
          </div>

          {/* Trust badges */}
          <div className="flex flex-col gap-1.5 text-xs text-slate-500 w-full">
            {[
              { icon: "🛡️", label: "Secure Payment Gateway" },
              { icon: "🔒", label: "256-bit SSL Encryption" },
              { icon: "💳", label: "PCI DSS Compliant" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 justify-center">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Cancel button */}
          <button
            onClick={handleCancel}
            className="w-full mt-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <p className="text-[11px] text-slate-400 leading-relaxed -mt-2">
            You will be redirected to a secure payment page. Do not close this window or press the back button during the payment process.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (!status) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${status === "paid"
      ? "bg-green-100 text-green-600"
      : "bg-amber-100 text-amber-600"
      }`}>
      {status === "paid" ? (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M12 7v5l3 3" />
        </svg>
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const INVOICE_DATA = {
  id: "INV-2026-0328-001",
  doctor: "Dr. Maria Santos - General Physician",
  consultationDate: "March 28, 2026",
  issuedDate: "March 28, 2026",
  items: [
    { label: "Video Consultation Fee", amount: 1200, status: "paid" },
    { label: "Medical Certificate", amount: 350, status: "unpaid" },
    { label: "Medical Clearance", amount: 450, status: "unpaid" },
    { label: "Platform Fee", sublabel: "Service charge", amount: 50, status: null },
  ],
  subtotal: 2000,
  platformFee: 50,
  totalPaid: 1200,
  amountDue: 850,
  grandTotal: 2050,
};

function InvoiceView({ invoice = INVOICE_DATA, onPay }) {
  const inv = invoice;
  return (
    <div className="flex flex-col gap-4">
      {/* Header card — teal gradient with invoice meta and amount due */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-extrabold">Invoice</p>
              <p className="text-xs text-white/70">{inv.id}</p>
            </div>
          </div>
          <span className="bg-amber-400 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-full">⏰ Unpaid</span>
        </div>
        <div className="mt-4 space-y-1 text-sm text-white/80">
          <p>👤 {inv.doctor}</p>
          <p>📅 Consultation Date: {inv.consultationDate}</p>
          <p>📄 Issued: {inv.issuedDate}</p>
        </div>
        <div className="mt-3">
          <p className="text-xs text-white/60">Total Amount Due</p>
          <p className="text-3xl font-extrabold">₱{inv.amountDue.toLocaleString()}</p>
        </div>
      </div>

      {/* Billing breakdown — line items with status badges */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <p className="font-semibold text-slate-800">Billing Breakdown</p>
        </div>
        <div className="divide-y divide-slate-50 px-5">
          {inv.items.map(item => (
            <div key={item.label} className="py-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                  {item.sublabel && <p className="text-xs text-slate-400">{item.sublabel}</p>}
                  {item.status && <StatusBadge status={item.status} />}
                </div>
                <p className="text-sm font-semibold text-slate-700">₱{item.amount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Totals summary */}
        <div className="border-t border-slate-100 px-5 py-3 space-y-1 text-sm">
          <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>₱{inv.subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-slate-500"><span>Platform Fee</span><span>₱{inv.platformFee}</span></div>
          <div className="flex justify-between text-slate-500"><span>Total Paid</span><span className="text-green-600">-₱{inv.totalPaid.toLocaleString()}</span></div>
          <div className="flex justify-between font-extrabold text-base pt-1 border-t border-slate-100">
            <span className="text-slate-800">Amount Due</span>
            <span className="text-amber-500">₱{inv.amountDue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400"><span>Grand Total</span><span>₱{inv.grandTotal.toLocaleString()}</span></div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="font-semibold text-slate-700 text-sm">Actions</p>
        </div>
        <div className="px-5 py-4 flex flex-col gap-2">
          {/* Primary CTA — triggers redirect modal */}
          <button
            onClick={onPay}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Pay Now - ₱{inv.amountDue.toLocaleString()}
          </button>
          {/* Secondary actions — wire up handlers as needed */}
          <button className="w-full py-3 rounded-xl border border-teal-400 text-teal-600 font-semibold text-sm hover:bg-teal-50 transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Invoice PDF
          </button>
          <button className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Invoice to Email
          </button>
        </div>
      </div>
    </div>
  );
}


function PaymentSuccess({ amount, invoice, paymentDate, documents, onViewInvoice, onBackToHistory }) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Hero — green checkmark */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
          <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-800">Payment Successful!</h2>
          <p className="text-sm text-slate-500 mt-0.5">Your payment has been processed successfully</p>
        </div>
      </div>

      {/* Amount paid card */}
      <div className="w-full rounded-2xl bg-green-50 border border-green-200 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Amount Paid</p>
          <p className="text-3xl font-extrabold text-slate-800">₱{amount.toLocaleString()}</p>
        </div>
        <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Paid
        </span>
      </div>

      {/* Payment detail rows */}
      <div className="w-full divide-y divide-slate-100 rounded-2xl border border-slate-100 overflow-hidden text-sm">
        {[
          { label: "Invoice Number", value: invoice },
          { label: "Payment Date", value: paymentDate },
          { label: "Payment Method", value: "Online Payment Gateway" },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center px-5 py-3 bg-white">
            <span className="text-slate-500">{label}</span>
            <span className="font-semibold text-slate-800">{value}</span>
          </div>
        ))}
      </div>

      {/* Confirmation note */}
      <div className="w-full rounded-xl bg-sky-50 border border-sky-100 px-4 py-3 text-xs text-slate-600 leading-relaxed">
        <strong>Note:</strong> A payment confirmation email has been sent to your registered email address. Please keep this for your records.
      </div>

      {/* Downloadable documents */}
      <div className="w-full rounded-2xl border border-slate-100 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800">Your Documents Are Ready</p>
            <p className="text-xs text-slate-500">Download your requested documents below</p>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {documents.map(doc => (
            <div key={doc.name} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                  <p className="text-xs text-slate-500">{doc.sub}</p>
                </div>
              </div>
              {/* Wire doc.url or an onDownload(doc) handler here */}
              <button className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer navigation */}
      <div className="w-full flex flex-col gap-2">
        <button
          onClick={onViewInvoice}
          className="w-full py-3 rounded-xl border border-teal-400 text-teal-600 text-sm font-semibold hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          View Invoice
        </button>
        <button
          onClick={onBackToHistory}
          className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Return to Consultation History
        </button>
      </div>
    </div>
  );
}

function PaymentFailure({ amount, invoice, onRetry, onCancel }) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Hero — red X */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-200">
          <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-800">Payment Failed</h2>
          <p className="text-sm text-slate-500 mt-0.5">We couldn't process your payment. Please try again.</p>
        </div>
      </div>

      {/* Failed amount card */}
      <div className="w-full rounded-2xl bg-red-50 border border-red-200 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Amount</p>
          <p className="text-3xl font-extrabold text-slate-800">₱{amount.toLocaleString()}</p>
        </div>
        <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Failed
        </span>
      </div>

      {/* Decline reason — customize message based on error code from payment gateway */}
      <div className="w-full rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-slate-600 leading-relaxed">
        <strong>Reason:</strong> Transaction was declined by your bank or payment provider. Please check your payment details or try a different payment method.
      </div>

      {/* Invoice reference */}
      <div className="w-full rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden text-sm">
        <div className="flex justify-between px-5 py-3 bg-white">
          <span className="text-slate-500">Invoice Number</span>
          <span className="font-semibold text-slate-800">{invoice}</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="w-full flex flex-col gap-2">
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry Payment
        </button>
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}


export default function App() {
  // view: "invoice" | "success" | "failure"
  const [view, setView] = useState("invoice");
  const [showModal, setShowModal] = useState(false);

  // Triggered by InvoiceView's "Pay Now" button
  const handlePay = () => {
    setShowModal(true);
  };

  // Triggered by RedirectModal's Cancel button
  const handleCancel = () => {
    setShowModal(false);
  };

  // Triggered when RedirectModal countdown reaches 0.
  // Replace Math.random() with your real gateway result handler.
  const handleRedirectComplete = () => {
    setTimeout(() => {
      setShowModal(false);
      setView(Math.random() > 0.4 ? "success" : "failure");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-50 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-md">

        {/* DEV ONLY: state switcher — remove before production */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["invoice", "success", "failure"].map(v => (
            <button
              key={v}
              onClick={() => { setView(v); setShowModal(false); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${view === v
                ? "bg-teal-500 text-white"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Page views */}
        {view === "invoice" && (
          <InvoiceView invoice={INVOICE_DATA} onPay={handlePay} />
        )}
        {view === "success" && (
          <PaymentSuccess
            amount={850}
            invoice="INV-2026-0328-001"
            paymentDate="May 5, 2026 at 10:37 AM"
            documents={[
              { name: "Medical Certificate", sub: "Sick leave - 3 days" },
              { name: "Medical Clearance", sub: "Fitness to work certificate" },
            ]}
            onViewInvoice={() => setView("invoice")}
            onBackToHistory={() => alert("Navigate to consultation history")}
          />
        )}
        {view === "failure" && (
          <PaymentFailure
            amount={850}
            invoice="INV-2026-0328-001"
            onRetry={handlePay}
            onCancel={() => setView("invoice")}
          />
        )}

        {/* Redirect modal — floats above page content */}
        {showModal && (
          <RedirectModal
            amount="₱850"
            invoice="INV-2026-0328-001"
            onCancel={handleCancel}
            onComplete={handleRedirectComplete}
          />
        )}

      </div>
    </div>
  );
}

export { RedirectModal, InvoiceView, PaymentSuccess, PaymentFailure, INVOICE_DATA };