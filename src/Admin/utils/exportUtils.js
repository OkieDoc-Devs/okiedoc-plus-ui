/**
 * Exports filtered transaction data to a CSV file.
 * Creates a CSV string from the data and triggers a download.
 *
 * @param {Array<object>} filteredTransactions - The array of transaction objects to export.
 * Each object should ideally have keys like id, patientName, specialistName, etc.
 */
export const handleExport = (filteredTransactions) => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      alert("No data to export.");
      return;
    }

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

    const rows = filteredTransactions.map(t =>
      [
        t.id || '', // Use empty string if id is missing
        `"${t.patientName || ''}"`, // Enclose in quotes, use empty string if missing
        `"${t.specialistName || ''}"`,
        t.specialty || '',
        t.date || '',
        t.status || '',
        t.channel || '',
        t.paymentMethod || ''
      ].join(',') // Join array elements with a comma
    );

    // Combine headers and rows into a single CSV string
    const csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(',') + "\n"
        + rows.join("\n");

    const encodedUri = encodeURI(csvContent);

    // Create a temporary link element to trigger the download
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transaction_history.csv");

    document.body.appendChild(link);

    // Programmatically click the link to start the download
    link.click();

    document.body.removeChild(link);
};