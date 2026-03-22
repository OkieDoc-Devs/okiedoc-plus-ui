import { apiRequest, API_BASE_URL } from '../apiClient';

/**
 * Utility to format database enums (e.g., "platform_call" -> "Platform Call")
 */
const formatString = (str) => {
  if (!str) return 'N/A';
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Formats a raw status string (e.g., "for_payment") into a readable string ("For Payment")
 */
const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Handles the admin login.
 * This triggers the 'last_login' update on the backend for the audit trail.
 */
export const loginAdmin = async (email, password) => {
  try {
    const data = await apiRequest('/api/v1/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      localStorage.setItem('admin_token', data.token);
    }
    return data;
  } catch (error) {
    console.error('Admin login failed:', error);
    throw error;
  }
};

/**
 * Handles the admin logout.
 * This triggers the 'last_active' timestamp update on the backend for the audit trail.
 */
export const logoutAdmin = async () => {
  try {
    await apiRequest('/api/v1/admin/logout', { method: 'POST' });
  } catch (error) {
    console.error('Admin logout failed:', error);
  } finally {
    localStorage.removeItem('admin_token');
  }
};

/**
 * Fetches the list of active specialists for the admin dashboard.
 */
export const getSpecialists = async () => {
  try {
    const data = await apiRequest('/api/v1/admin/specialists');
    const rawData = Array.isArray(data) ? data : data?.specialists || data?.data || [];
    
    return rawData.map(spec => ({
      ...spec,
      barangay: spec.barangay || '',
      city: spec.city || '',
      province: spec.province || '',
      region: spec.region || '',
      zipCode: spec.zipCode || ''
    }));
  } catch (error) {
    console.error('Failed to fetch specialists:', error);
    throw error;
  }
};

/**
 * Fetches the list of pending specialist applications.
 */
export const getPendingApplications = async () => {
  try {
    const data = await apiRequest('/api/v1/admin/view-pending');
    const rawData = Array.isArray(data)
      ? data
      : data?.pendingApplications || data?.applications || data?.data || [];

    return rawData.map((app) => {
      const u = app.user || {};
      return {
        id: app.id,
        userId: u.id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Pending Specialist',
        email: u.email || 'N/A',
        role: 'Specialist',
        status: app.applicationStatus || 'Pending',
        date: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : 'N/A',
        details: {
          specializations: app.primarySpecialty ? [app.primarySpecialty] : [],
          subspecializations: app.subSpecialties ? app.subSpecialties.split(',').map((s) => s.trim()) : [],
          prcId: {
            number: app.licenseNumber || u.licenseNumber || 'N/A',
            imageUrl: app.prcIdUrl || null,
          },
          s2: {
            number: app.s2Number || 'N/A',
            imageUrl: app.s2LicenseUrl || null,
          },
          ptr: {
            number: app.ptrNumber || 'N/A',
            imageUrl: app.ptrUrl || null,
          },
          eSig: app.eSignatureUrl ? `${API_BASE_URL}${app.eSignatureUrl}` : null,
          profilePicture: app.profilePictureUrl || u.profileImage || null,
          addressLine1: app.addressLine1 || '',
          addressLine2: app.addressLine2 || '',
          barangay: app.barangay || '',
          city: app.city || '',
          province: app.province || '',
          region: app.region || '',
          zipCode: app.zipCode || '',
        },
      };
    });
  } catch (error) {
    console.error('Failed to fetch pending applications:', error);
    throw error;
  }
};

/**
 * Fetches the transaction history.
 */
export const getTransactions = async () => {
  try {
    const data = await apiRequest('/api/v1/admin/transactions');
    const rawData = Array.isArray(data) ? data : data?.transactions || data?.data || [];
    
    return rawData.map(t => ({
      ...t,
      patientName: t.patientName || 'N/A',
      specialistName: t.specialistName || 'Unassigned',
      specialty: t.specialty || 'N/A',
      date: t.date || t.transactionDate || t.createdAt,
      channel: formatString(t.channel),
      chiefComplaint: t.chiefComplaint || 'N/A',
      barangay: t.barangay || '',
      city: t.city || '',
      status: formatStatus(t.status)
    }));
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw error;
  }
};

/**
 * Fetches the consultation history.
 */
export const getConsultations = async () => {
  try {
    const data = await apiRequest('/api/v1/admin/consultations');
    const rawData = Array.isArray(data) ? data : data?.consultations || data?.data || [];
    
    return rawData.map(c => ({
      ...c,
      patientName: c.patientName || 'N/A',
      specialistName: c.specialistName || 'Unassigned',
      date: c.date || c.createdAt,
      ticket: c.ticket || c.ticketNumber,
      chiefComplaint: c.chiefComplaint || 'N/A',
      barangay: c.barangay || '',
      city: c.city || '',
      status: formatStatus(c.status)
    }));
  } catch (error) {
    console.error('Failed to fetch consultations:', error);
    throw error;
  }
};

/**
 * Fetches the list of all patient and nurse users.
 */
export const getPatientAndNurseUsers = async () => {
  try {
    const data = await apiRequest('/api/v1/admin/users');
    return Array.isArray(data) ? data : data?.users || data?.data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
};

/**
 * Approve or deny a pending specialist application.
 * @param {object} payload - { specialistId, action ('approve' | 'deny'), reason }
 */
export const approveSpecialist = async (payload) => {
  try {
    return await apiRequest('/api/v1/admin/approve', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to approve/deny specialist:', error);
    throw error;
  }
};

/**
 * Create a new staff account (Nurse or Admin).
 * @param {object} payload - { fullName, email, password, mobileNumber, role, licenseNumber, prcExpiryDate }
 */
export const createStaff = async (payload) => {
  try {
    return await apiRequest('/api/v1/admin/create-staff', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to create staff:', error);
    throw error;
  }
};

/**
 * Updates a user's information.
 * @param {string} userId - The ID of the user to update.
 * @param {object} userData - The data to update.
 */
export const updateUser = async (userId, userData) => {
  try {
    return await apiRequest(`/api/v1/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error(`Failed to update user ${userId}:`, error);
    throw error;
  }
};

/**
 * Deletes a user.
 * @param {string} userId - The ID of the user to delete.
 */
export const deleteUser = async (userId) => {
  try {
    return await apiRequest(`/api/v1/admin/users/${userId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Failed to delete user ${userId}:`, error);
    throw error;
  }
};

/**
 * Update Specialist Status
 * Sends a command to manually update a specialist's operational status.
 * @param {Object} payload - The update payload
 * @param {number} payload.specialistId - The ID of the specialist (user ID).
 * @param {string} payload.status - The new status ('approved', 'inactive', 'suspended').
 * @returns {Promise<Object>} The API response confirming the update.
 */
export const updateSpecialistStatus = async ({ specialistId, status }) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await fetch('/api/v1/admin/update-specialist-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ specialistId, status })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update specialist status');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};