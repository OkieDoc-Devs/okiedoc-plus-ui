import axios from 'axios';
import { patientDummyData, dummyPatientCredentials } from '../../api/Patient/test';

 const API_BASE_URL = "http://localhost:8080/api";
 
 const api = axios.create({
   baseURL: API_BASE_URL,
 });
 
 export const login = async (email, password) => {
   try {
     const response = await axios.post("http://localhost:1337/api/auth/login", { email, password }, { withCredentials: true });
     if (response.data.success) {
       return { success: true, user: response.data.user };
     }
     return { success: false, error: response.data.message || "Login failed" };
   } catch (err) {
     console.error("[Backend] Login failed:", err);
     if (email === dummyPatientCredentials.email && password === dummyPatientCredentials.password) {
       console.log("[Fallback] Using dummy patient credentials.");
       return { success: true, user: patientDummyData };
     }
     return { success: false, error: err.message || "Login failed" };
   }
 };

 export const fetchPatientProfile = async () => {
   try {
     const currentUser = JSON.parse(localStorage.getItem("currentUser"));
     const userId = currentUser?.id;
     if (!userId) throw new Error("No user ID found");
     
     const response = await api.get(`/patient/profile/${userId}`);
     return response.data;
   } catch (err) {
     console.error("[Backend] Error fetching profile:", err);
     console.log("[Fallback] Using dummy patient profile data.");
     // The dashboard and MyAccount page can use this data.
     return patientDummyData;
   }
 };
 
 export const updatePatientProfile = async (profileData) => {
   try {
     const currentUser = JSON.parse(localStorage.getItem("currentUser"));
     const userId = currentUser?.id;
     console.log(`[Backend] Updating profile for user ${userId}...`);
     const response = await api.put(`/patient/profile/`, profileData);
     return response.data;
   } catch (err) {
     console.error("[Backend] Error updating profile:", err);
     console.log("[Fallback] Simulating successful profile update.");
     return profileData; // Return the data to simulate a successful update
   }
 };
 
 export const changePassword = async (passwordData) => {
   try {
     const currentUser = JSON.parse(localStorage.getItem("currentUser"));
     const userId = currentUser?.id;
     console.log(`[Backend] Changing password for user ${userId}...`);
     const response = await api.post(`/auth/change-password/`, passwordData);
     return response.data;
   } catch (err) {
     console.error("[Backend] Error changing password:", err);
     console.log("[Fallback] Simulating successful password change.");
     return { success: true }; // Simulate a success response
   }
 };
