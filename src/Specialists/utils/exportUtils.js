// Export utility functions for specialists

/**
 * Export data to CSV format
 * @param {Array} data - Data to export
 * @param {Array} headers - Column headers
 * @param {string} filename - Filename for the export
 * @returns {boolean} True if successful
 */
export const exportToCSV = (data, headers, filename = "export.csv") => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return false;
  }

  try {
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes in values
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    alert('Error exporting data. Please try again.');
    return false;
  }
};

/**
 * Export transactions to CSV
 * @param {Array} transactions - Transactions to export
 * @param {string} filename - Filename for the export
 * @returns {boolean} True if successful
 */
export const exportTransactionsToCSV = (transactions, filename = "transaction_history.csv") => {
  const headers = [
    "ID", 
    "Patient Name", 
    "Specialist Name", 
    "Specialty", 
    "Date", 
    "Status", 
    "Channel", 
    "Payment Method"
  ];

  return exportToCSV(transactions, headers, filename);
};

/**
 * Generate medical history request HTML
 * @param {Object} request - Medical history request data
 * @param {Object} ticket - Ticket data
 * @returns {string} HTML content
 */
export const generateMedicalHistoryHTML = (request, ticket) => {
  return `
    <h1>Medical History Request</h1>
    <div class="meta">
      <div><strong>Patient:</strong> ${ticket.patient || ''}</div>
      <div><strong>Ticket:</strong> ${ticket.id || ''}</div>
      <div><strong>Created:</strong> ${new Date(request.createdAt).toLocaleString()}</div>
      <div><strong>Status:</strong> ${request.status}</div>
    </div>
    <div class="box">
      <div><strong>Reason:</strong> ${request.reason || '—'}</div>
      <div><strong>Date range:</strong> ${request.from || '—'} to ${request.to || '—'}</div>
      <div><strong>Consent:</strong> Yes</div>
    </div>
  `;
};

/**
 * Open print window with HTML content
 * @param {string} html - HTML content to print
 * @param {string} title - Window title
 * @returns {boolean} True if successful
 */
export const openPrintWindow = (html, title = "Document") => {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print documents.');
      return false;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Poppins, Arial, sans-serif;
              padding: 24px;
              color: #111;
              line-height: 1.6;
            }
            h1 {
              font-size: 20px;
              margin-bottom: 8px;
              color: #0B5388;
            }
            h2 {
              font-size: 16px;
              margin: 10px 0;
              color: #333;
            }
            .meta div {
              margin: 4px 0;
              font-size: 14px;
            }
            .box {
              background: #f2f2f2;
              padding: 16px;
              border-radius: 10px;
              margin-top: 16px;
            }
            .box div {
              margin: 8px 0;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Focus and print after a short delay
    setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (e) {
        console.warn('Could not focus print window:', e);
      }
    }, 300);

    return true;
  } catch (error) {
    console.error('Error opening print window:', error);
    alert('Error opening print window. Please try again.');
    return false;
  }
};

/**
 * Download medical history request as PDF
 * @param {Object} request - Medical history request data
 * @param {Object} ticket - Ticket data
 * @returns {boolean} True if successful
 */
export const downloadMedicalHistoryPDF = (request, ticket) => {
  const html = generateMedicalHistoryHTML(request, ticket);
  return openPrintWindow(html, "Medical History Request");
};

/**
 * Generate encounter summary HTML
 * @param {Object} encounter - Encounter data
 * @param {Object} ticket - Ticket data
 * @returns {string} HTML content
 */
export const generateEncounterSummaryHTML = (encounter, ticket) => {
  return `
    <h1>Encounter Summary</h1>
    <div class="meta">
      <div><strong>Patient:</strong> ${ticket.patient || ''}</div>
      <div><strong>Ticket:</strong> ${ticket.id || ''}</div>
      <div><strong>Date:</strong> ${new Date().toLocaleString()}</div>
    </div>
    
    <div class="section">
      <h2>SOAP Notes</h2>
      <div class="soap-section">
        <h3>Subjective</h3>
        <p>${encounter.subjective || 'No subjective notes'}</p>
      </div>
      <div class="soap-section">
        <h3>Objective</h3>
        <p>${encounter.objective || 'No objective notes'}</p>
      </div>
      <div class="soap-section">
        <h3>Assessment</h3>
        <p>${encounter.assessment || 'No assessment notes'}</p>
      </div>
      <div class="soap-section">
        <h3>Plan</h3>
        <p>${encounter.plan || 'No plan notes'}</p>
      </div>
    </div>

    ${encounter.medicines && encounter.medicines.length > 0 ? `
      <div class="section">
        <h2>Prescriptions</h2>
        <ol>
          ${encounter.medicines.map(med => `
            <li>
              <strong>${med.brand || med.generic}</strong>
              ${med.dosage ? ` - ${med.dosage}` : ''}
              ${med.form ? ` / ${med.form}` : ''}
              ${med.quantity ? ` (Qty: ${med.quantity})` : ''}
              <br><em>Instructions: ${med.instructions}</em>
            </li>
          `).join('')}
        </ol>
      </div>
    ` : ''}

    ${encounter.labRequests && encounter.labRequests.length > 0 ? `
      <div class="section">
        <h2>Lab Requests</h2>
        <ol>
          ${encounter.labRequests.map(lab => `
            <li>
              <strong>${lab.test}</strong>
              ${lab.remarks ? ` - ${lab.remarks}` : ''}
            </li>
          `).join('')}
        </ol>
      </div>
    ` : ''}

    ${encounter.referral ? `
      <div class="section">
        <h2>Referral</h2>
        <p>${encounter.referral}</p>
      </div>
    ` : ''}

    ${encounter.followUp ? `
      <div class="section">
        <h2>Follow-up Required</h2>
        <p>Patient requires follow-up consultation</p>
      </div>
    ` : ''}
  `;
};

/**
 * Download encounter summary as PDF
 * @param {Object} encounter - Encounter data
 * @param {Object} ticket - Ticket data
 * @returns {boolean} True if successful
 */
export const downloadEncounterSummaryPDF = (encounter, ticket) => {
  const html = generateEncounterSummaryHTML(encounter, ticket);
  return openPrintWindow(html, "Encounter Summary");
};

/**
 * Export data to JSON format
 * @param {Array} data - Data to export
 * @param {string} filename - Filename for the export
 * @returns {boolean} True if successful
 */
export const exportToJSON = (data, filename = "export.json") => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return false;
  }

  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    return true;
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    alert('Error exporting data. Please try again.');
    return false;
  }
};
