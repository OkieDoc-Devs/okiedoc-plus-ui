import { apiRequest, API_BASE_URL } from '../apiClient';

/**
 * Handles the admin login.
 * This triggers the 'last_login' update on the backend for the audit trail.
 */
export const loginAdmin = async (email, password) => {
    try {
        const data = await apiRequest('/api/v1/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        // In a real app with tokens, you would save the token here.
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
        // The backend identifies the user via their token to log the 'last_active' time.
        await apiRequest('/api/v1/admin/logout', { method: 'POST' });
    } catch (error) {
        console.error('Admin logout failed:', error);
    } finally {
        // Always clear local session data on logout.
        localStorage.removeItem('admin_token');
    }
};

/**
 * Fetches the list of active specialists for the admin dashboard.
 */
export const getSpecialists = async () => {
    try {
        return await apiRequest('/api/v1/admin/specialists');
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
        // Extract base array
        const rawData = Array.isArray(data)
            ? data
            : (data?.pendingApplications || data?.applications || data?.data || []);

        // Map raw backend SpecialistProfile to frontend PendingTable shape
        return rawData.map(app => {
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
                    subspecializations: app.subSpecialties ? app.subSpecialties.split(',').map(s => s.trim()) : [],
                    prcId: {
                        number: app.licenseNumber || u.licenseNumber || 'N/A',
                        imageUrl: app.prcIdUrl || null
                    },
                    s2: {
                        number: app.s2Number || 'N/A',
                        imageUrl: app.s2LicenseUrl || null
                    },
                    ptr: {
                        number: app.ptrNumber || 'N/A',
                        imageUrl: app.ptrUrl || null
                    },
                    eSig: app.eSignatureUrl ? `${API_BASE_URL}${app.eSignatureUrl}` : null,
                    profilePicture: app.profilePictureUrl || u.profileImage || null
                }
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
        // Handle both array and object responses
        return Array.isArray(data)
            ? data
            : (data?.transactions || data?.data || []);
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
        // Handle both array and object responses
        return Array.isArray(data)
            ? data
            : (data?.consultations || data?.data || []);
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
        // Handle both array and object responses
        const users = Array.isArray(data)
            ? data
            : (data?.users || data?.data || []);
        return users;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return [
            { id: 'p1', userType: 'Patient', firstName: 'John', lastName: 'Doe', email: 'patient@gmail.com', mobileNumber: '98765485', subscription: 'Paid' },
            { id: 'n1', userType: 'Nurse', firstName: 'Leslie', lastName: 'Rowland', email: 'les@row@gmail.com', mobileNumber: '97685334', subscription: 'Free' }
        ];
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
            body: JSON.stringify(payload)
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
            body: JSON.stringify(payload)
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
            body: JSON.stringify(userData)
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
            method: 'DELETE'
        });
    } catch (error) {
        console.error(`Failed to delete user ${userId}:`, error);
        throw error;
    }
};
