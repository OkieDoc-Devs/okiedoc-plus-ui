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
    return response.data;
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
        return response.data;
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
        return response.data;
    } catch (error) {
        console.error('Failed to fetch consultations:', error);
        throw error;
    }
};