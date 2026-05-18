/**
 * usePaymentFlow — Shared payment flow hook for Patient dashboards
 *
 * Consolidates all payment state, redirect handling, polling, and debug logging
 * so Patient_Appointments.jsx and Patient_Dashboard.jsx share one implementation.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import * as apiService from "../services/apiService";

export default function usePaymentFlow() {
  const [paymentFlow, setPaymentFlow] = useState({
    ticket: null,
    view: "invoice", // 'invoice' | 'success' | 'failure'
    showModal: false,
    invoiceData: null,
    isVerifying: false, // true while waiting for verify-payment response
  });

  const isRedirectingRef = useRef(false);
  const paymentLogsRef = useRef([]);

  const paymentLog = useCallback((msg, data) => {
    const ts = new Date().toISOString().slice(11, 23);
    const line =
      `[${ts}] ${msg}` + (data !== undefined ? ` ${JSON.stringify(data)}` : "");
    console.log(`[Payment]${line}`);
    paymentLogsRef.current.push(line);
  }, []);

  const downloadPaymentLogs = useCallback(() => {
    const logs = paymentLogsRef.current;
    const md = [
      "# Payment Debug Log",
      "",
      `Generated: ${new Date().toISOString()}`,
      `Total entries: ${logs.length}`,
      "",
      "## Log Entries",
      "",
      ...logs.map((line, i) => `\`${i + 1}.\` \`${line}\``),
      "",
      "---",
      "## State Snapshot",
      "",
      `\`\`\`json\n${JSON.stringify({ paymentFlow }, null, 2)}\n\`\`\``,
    ].join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-debug-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [paymentFlow]);

  const getInvoiceData = useCallback((ticket) => {
    if (!ticket) return null;
    const amount = ticket.totalAmount > 0 ? ticket.totalAmount : 0;
    return {
      id: `INV-${ticket.ticketNumber}`,
      doctor: ticket.specialistName || "Assigned Specialist",
      consultationDate: ticket.preferredDate
        ? new Date(ticket.preferredDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "TBA",
      issuedDate: new Date().toLocaleDateString(),
      items: [
        {
          label: "Consultation Fee",
          sublabel: ticket.specialization || "General Consultation",
          amount,
          status: ticket.paymentStatus || "unpaid",
        },
      ],
      subtotal: amount,
      platformFee: 0,
      totalPaid: 0,
      amountDue: amount,
      grandTotal: amount,
    };
  }, []);

  // --- Handlers ---

  const openPayment = useCallback(
    (ticket) => {
      setPaymentFlow({
        ticket,
        view: "invoice",
        showModal: false,
        invoiceData: getInvoiceData(ticket),
        isVerifying: false,
      });
    },
    [getInvoiceData],
  );

  const initiatePayment = useCallback(() => {
    setPaymentFlow((prev) => ({ ...prev, showModal: true }));
  }, []);

  const cancelRedirect = useCallback(() => {
    setPaymentFlow((prev) => ({ ...prev, showModal: false }));
  }, []);

  const completeRedirect = useCallback(async () => {
    if (isRedirectingRef.current) {
      paymentLog("DUPLICATE CALL BLOCKED - already redirecting");
      return;
    }
    isRedirectingRef.current = true;
    paymentLog("handleRedirectComplete START");

    try {
      const ticketId = paymentFlow.ticket?.id;
      if (!ticketId) {
        paymentLog("ERROR: No ticket ID");
        isRedirectingRef.current = false;
        return;
      }

      paymentLog("Calling payTicket API...");
      const res = await apiService.payTicket(ticketId);
      paymentLog("payTicket response", res);

      if (res && res.invoiceUrl) {
        paymentLog("SUCCESS - redirecting to Xendit", res.invoiceUrl);
        sessionStorage.setItem("pendingPaymentTicketId", ticketId);
        window.location.href = res.invoiceUrl;
      } else {
        paymentLog("ERROR: No invoiceUrl in response");
        alert("Failed to generate payment link. Please try again.");
        setPaymentFlow((prev) => ({ ...prev, showModal: false }));
        isRedirectingRef.current = false;
      }
    } catch (err) {
      paymentLog("ERROR", err.message);
      alert(
        "An error occurred connecting to the payment gateway. Please try again.",
      );
      setPaymentFlow((prev) => ({ ...prev, showModal: false }));
      isRedirectingRef.current = false;
    }
  }, [paymentFlow.ticket?.id, paymentLog]);

  const closePayment = useCallback(() => {
    setPaymentFlow({
      ticket: null,
      view: "invoice",
      showModal: false,
      invoiceData: null,
      isVerifying: false,
    });
  }, []);

  // --- Xendit return listener (checks both hash and query string) ---

  useEffect(() => {
    const handlePaymentReturn = () => {
      // Try query string first (Xendit strips hashes from redirect URLs)
      const queryParams = new URLSearchParams(window.location.search);
      let paymentStatus = queryParams.get("payment");
      let paymentTicketId = queryParams.get("ticketId");

      // Fallback: also check hash fragment if query string params are missing
      if (!paymentStatus || !paymentTicketId) {
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.split("?")[1] || "");
        paymentStatus = hashParams.get("payment") || paymentStatus;
        paymentTicketId = hashParams.get("ticketId") || paymentTicketId;
      }

      if (!paymentStatus || !paymentTicketId) return;

      paymentLog("Payment redirect detected", {
        paymentStatus,
        paymentTicketId,
      });

      setPaymentFlow((prev) => ({ ...prev, isVerifying: true }));

      const verifyIfSuccess =
        paymentStatus === "success"
          ? apiService.verifyTicketPayment(paymentTicketId).then((r) => {
              paymentLog("verifyTicketPayment response", r);
              return r;
            })
          : Promise.resolve();

      verifyIfSuccess
        .then(() => apiService.fetchPatientActiveTickets())
        .then((response) => {
          const tickets =
            response?.activeTickets || response?.data || response || [];
          paymentLog("Fetched tickets after verify", { count: tickets.length });
          const pTicket = tickets.find(
            (a) => String(a.id) === String(paymentTicketId),
          );

          if (pTicket) {
            paymentLog("Found ticket", {
              id: pTicket.id,
              status: pTicket.status,
              paymentStatus: pTicket.paymentStatus,
            });
            const actualView =
              pTicket.paymentStatus === "paid"
                ? "success"
                : paymentStatus === "failure"
                  ? "failure"
                  : "invoice";
            paymentLog("Resolved view", { actualView });
            setPaymentFlow({
              ticket: pTicket,
              view: actualView,
              showModal: false,
              invoiceData: getInvoiceData(pTicket),
              isVerifying: false,
            });
          } else {
            paymentLog("Ticket NOT found in fetched results - closing overlay");
            closePayment();
          }
          // Clean the URL params
          const cleanPath = window.location.pathname + window.location.hash;
          window.history.replaceState(null, "", cleanPath);
        })
        .catch((err) => {
          paymentLog("Redirect handler ERROR", err.message);
          console.error("Error during payment redirect handling:", err);
          closePayment();
        });
    };

    handlePaymentReturn();
    window.addEventListener("hashchange", handlePaymentReturn);
    return () => window.removeEventListener("hashchange", handlePaymentReturn);
  }, [closePayment, getInvoiceData, paymentLog]);

  // --- SessionStorage restore on mount ---

  useEffect(() => {
    const pendingId = sessionStorage.getItem("pendingPaymentTicketId");
    if (pendingId) {
      sessionStorage.removeItem("pendingPaymentTicketId");
      paymentLog("Restored pending payment from sessionStorage", { pendingId });
      apiService
        .fetchPatientActiveTickets()
        .then((response) => {
          const tickets =
            response?.activeTickets || response?.data || response || [];
          const ticket = tickets.find(
            (t) => String(t.id) === String(pendingId),
          );
          if (ticket) {
            openPayment(ticket);
          }
        })
        .catch(() => {});
    }
  }, [openPayment, paymentLog]);

  // --- Polling: auto-verify unpaid tickets every 10s ---

  useEffect(() => {
    const interval = setInterval(() => {
      apiService
        .fetchPatientActiveTickets()
        .then((response) => {
          const tickets =
            response?.activeTickets || response?.data || response || [];
          const unpaidTickets = tickets.filter(
            (t) => t.status === "for_payment" && t.xenditInvoiceId,
          );
          if (unpaidTickets.length > 0) {
            paymentLog("Polling: found unpaid tickets", {
              count: unpaidTickets.length,
            });
            unpaidTickets.forEach((t) => {
              apiService.verifyTicketPayment(t.id).catch(() => {});
            });
          }
        })
        .catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, [paymentLog]);

  return {
    ticket: paymentFlow.ticket,
    view: paymentFlow.view,
    showModal: paymentFlow.showModal,
    invoiceData: paymentFlow.invoiceData,
    isVerifying: paymentFlow.isVerifying,

    openPayment,
    initiatePayment,
    cancelRedirect,
    completeRedirect,
    closePayment,
    paymentLog,

    downloadPaymentLogs,
    showDebugButton: import.meta.env.DEV,
  };
}
