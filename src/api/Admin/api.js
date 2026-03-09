import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:1337', // Your Sails.js backend URL
  withCredentials: true,
});

/**
 * Interceptor automatically adds the authorization token 
 * to every request made by the admin client.
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
 */
export const loginAdmin = async (email, password) => {
  try {
    const response = await apiClient.post('/api/v1/admin/login', { email, password });
    if (response.data && response.data.token) {
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
 */
export const logoutAdmin = async () => {
  try {
    await apiClient.post('/api/v1/admin/logout');
  } catch (error) {
    console.error('Admin logout failed:', error.response?.data || error.message);
  } finally {
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
    return Array.isArray(response.data)
      ? response.data
      : (response.data?.data || response.data?.users || []);
  } catch (error) {
    console.error('Failed to fetch users from MySQL:', error);
    return [];
  }
};

/**
 * Updates a user's information.
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