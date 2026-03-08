import axios from 'axios';

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
     throw err;
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
     throw err;
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
     throw err;
   }
 };
