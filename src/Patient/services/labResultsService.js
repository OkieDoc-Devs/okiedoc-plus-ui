 import axios from 'axios';
 
 const API_BASE_URL = "http://localhost:8080/api";
 
 const api = axios.create({
   baseURL: API_BASE_URL,
 });
 
 export const fetchLabResults = async (userId) => {
   if (!userId) throw new Error("User ID is required");
   const response = await api.get(`/lab-results/${userId}`);
   return response.data || [];
 };