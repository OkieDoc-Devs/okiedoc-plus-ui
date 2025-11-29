import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:1337', // Your Sails.js backend URL
  withCredentials: true,
});

/**
 * This is an interceptor. It automatically adds the authorization token 
 * to every request you make, so you don't have to do it manually.
 */
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

/**
 * Handles the admin login. 
 * This triggers the 'last_login' update on the backend for the audit trail.
 */
export const loginAdmin = async (email, password) => {
  try {
    const response = await apiClient.post('/api/v1/admin/login', { email, password });
    // In a real app with tokens, you would save the token here.
    if (response.data.token) {
      localStorage.setItem('admin_token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Admin login failed:', error.response?.data || error.message);
    throw error.response?.data || new Error('Login failed');
  }
};

/**
 * Handles the admin logout. 
 * This triggers the 'last_active' timestamp update on the backend for the audit trail.
 */
export const logoutAdmin = async () => {
    try {
        // The backend identifies the user via their token to log the 'last_active' time.
        await apiClient.post('/api/v1/admin/logout');
    } catch (error) {
        console.error('Admin logout failed:', error.response?.data || error.message);
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
    const response = await apiClient.get('/api/v1/admin/specialists');
    return response.data;
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
    const response = await apiClient.get('/api/v1/admin/pending-applications');
    // Handle both array and object responses
    return Array.isArray(response.data) 
      ? response.data 
      : (response.data?.applications || response.data?.data || []);
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
        const response = await apiClient.get('/api/v1/admin/transactions');
        // Handle both array and object responses
        return Array.isArray(response.data)
          ? response.data
          : (response.data?.transactions || response.data?.data || []);
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
        const response = await apiClient.get('/api/v1/admin/consultations');
        // Handle both array and object responses
        return Array.isArray(response.data)
          ? response.data
          : (response.data?.consultations || response.data?.data || []);
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
    const response = await apiClient.get('/api/v1/admin/users');
    // Handle both array and object responses
    const users = Array.isArray(response.data)
      ? response.data
      : (response.data?.users || response.data?.data || []);
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
 * Updates a user's information.
 * @param {string} userId - The ID of the user to update.
 * @param {object} userData - The data to update.
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/api/v1/admin/users/${userId}`, userData);
    return response.data;
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
    const response = await apiClient.delete(`/api/v1/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete user ${userId}:`, error);
    throw error;
  }
};