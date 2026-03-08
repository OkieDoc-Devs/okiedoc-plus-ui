 import axios from 'axios';
 
 const API_BASE_URL = "http://localhost:8080/api";
 
 const api = axios.create({
   baseURL: API_BASE_URL,
 });
 
 export const fetchMedicalRecords = async (userId) => {
   try {
     if (!userId) throw new Error("User ID is required");
     console.log(`[Backend] Fetching medical records for user ${userId}...`);
     const response = await api.get(`/medical-records/${userId}`);
     return response.data || {};
   } catch (err) {
     console.error("[Backend] Failed to fetch medical records:", err);
     throw err;
   }
 };
 
 export const deleteMedicalItem = async (category, itemId) => {
   try {
     console.log(`[Backend] Deleting item ${itemId} from ${category}...`);
     await api.delete(`/medical-records/${category}/${itemId}`);
   } catch (err) {
     console.error("[Backend] Failed to delete item:", err);
     throw err;
   }
 };
 
 export const saveMedicalItem = async (category, item) => {
     try {
       const currentUser = JSON.parse(localStorage.getItem("currentUser"));
       const payload = { ...item, userId: currentUser?.id };
       const response = await api.post(`/medical-records/${category}`, payload);
       return response.data;
     } catch (err) {
       console.error("[Backend] Failed to save item:", err);
       throw err;
     }
 };