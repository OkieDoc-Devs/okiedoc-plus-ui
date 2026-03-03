 import axios from 'axios';
 
 const API_BASE_URL = "http://localhost:8080/api";
 
 const api = axios.create({
   baseURL: API_BASE_URL,
 });
 
 export const fetchMedicalRecords = async (userId) => {
   if (!userId) throw new Error("User ID is required");
   const response = await api.get(`/medical-records/${userId}`);
   return response.data || {};
 };
 
 export const deleteMedicalItem = async (category, itemId) => {
   await api.delete(`/medical-records/${category}/${itemId}`);
 };
 
 export const saveMedicalItem = async (category, item) => {
     const currentUser = JSON.parse(localStorage.getItem("currentUser"));
     const payload = { ...item, userId: currentUser?.id };
     const response = await api.post(`/medical-records/${category}`, payload);
     return response.data;
 };