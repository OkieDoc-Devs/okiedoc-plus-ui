import axios from 'axios';
 
 const API_BASE_URL = "http://localhost:8080/api";
 
 const api = axios.create({
   baseURL: API_BASE_URL,
 });
 
 export const fetchPatientProfile = async () => {
   try {
     const currentUser = JSON.parse(localStorage.getItem("currentUser"));
     const userId = currentUser?.id;
     if (!userId) throw new Error("No user ID found");
     
     const response = await api.get(`/patient/profile/${userId}`);
     return response.data;
   } catch (error) {
     console.error("Error fetching profile:", error);
     return null;
   }
 };
 
 export const updatePatientProfile = async (profileData) => {
   const currentUser = JSON.parse(localStorage.getItem("currentUser"));
   const userId = currentUser?.id;
   const response = await api.put(`/patient/profile/`, profileData);
   return response.data;
 };
 
 export const changePassword = async (passwordData) => {
   const currentUser = JSON.parse(localStorage.getItem("currentUser"));
   const userId = currentUser?.id;
   const response = await api.post(`/auth/change-password/`, passwordData);
   return response.data;
 };
