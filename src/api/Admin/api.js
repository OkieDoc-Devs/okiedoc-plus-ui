import { apiRequest, API_BASE_URL } from '../apiClient';

/**
 * Handles the admin login.
 * This triggers the 'last_login' update on the backend for the audit trail.
 */
export const loginAdmin = async (email, password) => {
  try {
    const data = await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const role = data?.user?.role || data?.user?.userType;
    if (role !== 'admin' && role !== 'super_admin' && role !== 'nurse_admin' && role !== 'barangay_admin') {
      await apiRequest('/api/v1/auth/logout', { method: 'POST' }).catch(
        () => {},
      );
      throw new Error('Access denied: this portal is for admin accounts.');
    }

    return data;
  } catch (error) {
    console.error('Admin login failed:', error);
    throw error;
  }
};

/**
 * Handles the admin logout.
 */
export const logoutAdmin = async () => {
  try {
    await apiRequest('/api/v1/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Admin logout failed:', error);
  }
};

/**
 * Fetches the list of active specialists for the admin dashboard.
 */
export const getSpecialists = async () => {
  try {
    const data = await apiRequest('/api/v1/admin/specialists');
    return Array.isArray(data) ? data : data?.specialists || data?.data || [];
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
    return Array.isArray(data) ? data : data?.transactions || data?.data || [];
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
    return Array.isArray(data) ? data : data?.consultations || data?.data || [];
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
 * Fetches the authenticated admin's profile information.
 */
export const getAdminProfile = async () => {
  try {
    return await apiRequest('/api/v1/admin/profile');
  } catch (error) {
    console.error('Failed to fetch admin profile:', error);
    throw error;
  }
};

/**
 * Uploads a new avatar image for the admin.
 */
export const uploadAdminAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    return await fetch(`${API_BASE_URL}/api/v1/admin/avatar`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
      },
    }).then((res) => {
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      return res.json();
    });
  } catch (error) {
    console.error('Failed to upload admin avatar:', error);
    throw error;
  }
};

/**
 * Updates a specialist's approval status.
 */
export const updateSpecialistStatus = async ({ specialistId, status }) => {
  try {
    return await apiRequest(`/api/v1/admin/update-specialist-status`, {
      method: 'POST',
      body: JSON.stringify({ specialistId, status }),
    });
  } catch (error) {
    console.error(`Failed to update specialist status:`, error);
    throw error;
  }
};