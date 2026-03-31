export const handleExport = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object');

  const csvRows = [];

  csvRows.push(headers.map(header => `"${header}"`).join(','));

  const formatDateValue = (key, value) => {
    if (value === null || value === undefined || value === '') return '';
    
    const lowerKey = key.toLowerCase();

    const isDateColumn = 
      lowerKey.includes('date') || 
      lowerKey.endsWith('at') || 
      lowerKey.includes('time') || 
      lowerKey === 'birthday';

    if (isDateColumn) {
      if (value === 0 || value === '0') return 'N/A';

      const isNumeric = !isNaN(value) && !isNaN(parseFloat(value));
      const dateObj = isNumeric ? new Date(Number(value)) : new Date(value);

      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleString(); 
      }
    }
    
    return String(value);
  };

  data.forEach(row => {
    const values = headers.map(header => {
      let val = formatDateValue(header, row[header]);
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};