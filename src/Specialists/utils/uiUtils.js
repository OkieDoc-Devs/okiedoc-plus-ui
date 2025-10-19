// UI utility functions for specialists

/**
 * Get status badge CSS class
 * @param {string} status - Status string
 * @returns {string} CSS class name
 */
export const getStatusBadgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "confirmed" || s === "processing" || s === "completed") {
    return "status-confirmed";
  }
  if (s === "pending") return "status-pending";
  return "status-pending";
};

/**
 * Filter tickets by status
 * @param {Array} tickets - Array of tickets
 * @param {string} filter - Filter status ("All" or specific status)
 * @returns {Array} Filtered tickets
 */
export const filterTicketsByStatus = (tickets, filter) => {
  if (filter === "All") return tickets;
  return tickets.filter(ticket => 
    ticket.status.toLowerCase() === filter.toLowerCase()
  );
};

/**
 * Filter data by search term
 * @param {Array} data - Array of data to filter
 * @param {string} searchTerm - Search term
 * @param {Array} searchFields - Fields to search in
 * @returns {Array} Filtered data
 */
export const filterBySearchTerm = (data, searchTerm, searchFields) => {
  if (!searchTerm) return data;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return data.filter(item => 
    searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(lowerSearchTerm);
    })
  );
};

/**
 * Filter data by specialization
 * @param {Array} data - Array of data to filter
 * @param {string} specialization - Specialization to filter by
 * @param {string} fieldPath - Path to specialization field (e.g., "details.specializations")
 * @returns {Array} Filtered data
 */
export const filterBySpecialization = (data, specialization, fieldPath = "details.specializations") => {
  if (!specialization) return data;
  
  return data.filter(item => {
    const specializations = getNestedValue(item, fieldPath);
    return Array.isArray(specializations) && specializations.includes(specialization);
  });
};

/**
 * Get nested object value by path
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot-separated path (e.g., "details.specializations")
 * @returns {*} Value at path or undefined
 */
export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Filter transactions by multiple criteria
 * @param {Array} transactions - Array of transactions
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered transactions
 */
export const filterTransactions = (transactions, filters) => {
  const {
    searchTerm = "",
    specialization = "",
    status = "",
    dateFrom = "",
    dateTo = ""
  } = filters;

  return transactions.filter(transaction => {
    // Search term filter
    const searchFields = ['patientName', 'specialistName', 'channel', 'paymentMethod', 'status'];
    const matchesSearch = !searchTerm || 
      searchFields.some(field => 
        transaction[field]?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Specialization filter
    const matchesSpecialization = !specialization || 
      transaction.specialty === specialization;

    // Status filter
    const matchesStatus = !status || transaction.status === status;

    // Date range filter
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const transactionDate = new Date(transaction.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      if (fromDate) fromDate.setHours(0, 0, 0, 0);
      if (toDate) toDate.setHours(23, 59, 59, 999);

      matchesDate = (!fromDate || transactionDate >= fromDate) && 
                   (!toDate || transactionDate <= toDate);
    }

    return matchesSearch && matchesSpecialization && matchesStatus && matchesDate;
  });
};

/**
 * Get all unique specializations from data
 * @param {Array} data - Array of data containing specializations
 * @param {string} fieldPath - Path to specializations field
 * @returns {Array} Array of unique specializations
 */
export const getAllSpecializations = (data, fieldPath = "details.specializations") => {
  const specializations = data.flatMap(item => {
    const specs = getNestedValue(item, fieldPath);
    return Array.isArray(specs) ? specs : [];
  });
  return [...new Set(specializations)];
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate user initials from name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} User initials
 */
export const generateUserInitials = (firstName, lastName) => {
  const first = (firstName || "D")[0];
  const last = (lastName || "S")[0];
  return (first + last).toUpperCase();
};

/**
 * Validate form data
 * @param {Object} data - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result with isValid and errors
 */
export const validateFormData = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];

    if (rule.required && (!value || value.toString().trim() === "")) {
      errors[field] = rule.message || `${field} is required`;
    } else if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
    } else if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} format is invalid`;
    } else if (rule.custom && value && !rule.custom(value)) {
      errors[field] = rule.message || `${field} is invalid`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
