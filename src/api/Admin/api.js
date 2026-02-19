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

// Mock data payload
const MOCK_CONSULTATIONS = [
  {
    id: "C-001",
    ticket: "TKT-001",
    date: "2026-02-19",
    patientName: "John Doe",
    chiefComplaint: "Persistent chest pain",
    specialistName: "Dr. Sarah Johnson",
    status: "Completed",
    symptoms: "Chest pain, shortness of breath, mild dizziness",
    soap: {
      subjective: "Patient reports sharp pain in the center of chest lasting for 2 days. Worsens with physical activity.",
      objective: "BP: 140/90, HR: 88, Temp: 37.2°C",
      assessment: "Suspected Angina Pectoris / Hypertension.",
      plan: "Prescribed Nitroglycerin. Scheduled ECG and Stress Test."
    }
  },
  {
    id: "C-002",
    ticket: "TKT-002",
    date: "2026-02-18",
    patientName: "Jane Smith",
    chiefComplaint: "Severe headache and blurred vision",
    specialistName: "Dr. Mark Lee",
    status: "Pending",
    symptoms: "Throbbing pain in head, light sensitivity, nausea",
    soap: {
      subjective: "Patient experiences headaches lasting 4+ hours, unresponsive to OTC meds.",
      objective: "Normal vitals, pupils reactive. No fever.",
      assessment: "Acute Migraine Episode",
      plan: "Prescribed Sumatriptan. Rest in dark room. Hydrate."
    }
  },
  {
    id: "C-003",
    ticket: "TKT-003",
    date: "2026-02-17",
    patientName: "Mark Johnson",
    chiefComplaint: "Skin rash on arms",
    specialistName: "Unassigned",
    status: "Processing",
    symptoms: "Itchy, red patches on forearms",
    soap: {
      subjective: "Rash appeared 2 days ago after hiking.",
      objective: "Erythematous plaques on bilateral forearms.",
      assessment: "Contact Dermatitis",
      plan: "Prescribed Topical Hydrocortisone. Avoid irritants."
    }
  }
];

const MOCK_USERS = [
  { 
    id: 'p1', 
    patient_number: 'PT-884920', 
    patient_name: 'John Doe', 
    philhealth_number: '12-3456789-0', 
    date_updated: '2026-02-19' 
  },
  { 
    id: 'p2', 
    patient_number: 'PT-884921', 
    patient_name: 'Jane Smith', 
    philhealth_number: '98-7654321-0', 
    date_updated: '2026-02-18' 
  },
  { 
    id: 'p3', 
    patient_number: 'PT-884922', 
    patient_name: 'Robert Brown', 
    philhealth_number: '45-1234567-8', 
    date_updated: '2026-02-15' 
  }
];

// simulated loading time
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


/**
 * Handles the admin login. 
 */
export const loginAdmin = async (email, password) => {
  /*
  try {
    const response = await apiClient.post('/api/v1/admin/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('admin_token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Admin login failed:', error.response?.data || error.message);
    throw error.response?.data || new Error('Login failed');
  }
  */
  await delay(300);
  return { success: true, token: "mock_admin_token_123" }; // MOCK RETURN
};

/**
 * Handles the admin logout. 
 */
export const logoutAdmin = async () => {
    /*
    try {
        await apiClient.post('/api/v1/admin/logout');
    } catch (error) {
        console.error('Admin logout failed:', error.response?.data || error.message);
    } finally {
        localStorage.removeItem('admin_token');
    }
    */
    localStorage.removeItem('admin_token'); // mock return
};

/**
 * Fetches the list of active specialists for the admin dashboard.
 */
export const getSpecialists = async () => {
  /*
  try {
    const response = await apiClient.get('/api/v1/admin/specialists');
    return response.data;
  } catch (error) {/
    console.error('Failed to fetch specialists:', error);
    throw error;
  }
  */
  await delay(300);
  return [{ id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiology", status: "Active" },
    { id: 2, name: "Dr. Mark Lee", specialty: "Neurology", status: "Active" }]; // mock return
};

/**
 * Fetches the list of pending specialist applications.
 */
export const getPendingApplications = async () => {
  /*
  try {
    const response = await apiClient.get('/api/v1/admin/pending-applications');
    return Array.isArray(response.data) 
      ? response.data 
      : (response.data?.applications || response.data?.data || []);
  } catch (error) {
    console.error('Failed to fetch pending applications:', error);
    throw error;
  }
  */
  await delay(300);
  return []; // MOCK RETURN
};

/**
 * Fetches the transaction history.
 */
export const getTransactions = async () => {
    /*
    try {
        const response = await apiClient.get('/api/v1/admin/transactions');
        return Array.isArray(response.data)
          ? response.data
          : (response.data?.transactions || response.data?.data || []);
    } catch (error) {
        console.error('Failed to fetch transactions:', error);
        throw error;
    }
    */
    await delay(300);
    return []; // mock return
};

/**
 * Fetches the consultation history.
 */
export const getConsultations = async () => {
    /*
    try {
        const response = await apiClient.get('/api/v1/admin/consultations');
        return Array.isArray(response.data)
          ? response.data
          : (response.data?.consultations || response.data?.data || []);
    } catch (error) {
        console.error('Failed to fetch consultations:', error);
        throw error;
    }
    */
    await delay(400);
    return MOCK_CONSULTATIONS; // mock return
};

/**
 * Fetches the list of all patient and nurse users.
 */
export const getPatientAndNurseUsers = async () => {
  /*
  try {
    const response = await apiClient.get('/api/v1/admin/users');
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
  */
  await delay(300);
  return MOCK_USERS; // MOCK RETURN
};

/**
 * Updates a user's information.
 */
export const updateUser = async (userId, userData) => {
  /*
  try {
    const response = await apiClient.put(`/api/v1/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update user ${userId}:`, error);
    throw error;
  }
  */
  await delay(300);
  return { success: true, ...userData }; // mock return
};

/**
 * Deletes a user.
 */
export const deleteUser = async (userId) => {
  /*
  try {
    const response = await apiClient.delete(`/api/v1/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete user ${userId}:`, error);
    throw error;
  }
  */
  await delay(300);
  return { success: true }; // mock return
};