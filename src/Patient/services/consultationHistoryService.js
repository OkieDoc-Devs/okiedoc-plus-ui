 import axios from 'axios';
 
 const API_BASE_URL = "http://localhost:8080/api";
 
 const api = axios.create({
   baseURL: API_BASE_URL,
 });
 
 export const fetchConsultationHistory = async (userId) => {
   if (!userId) throw new Error("User ID is required");
   const response = await api.get(`/consultations/history/${userId}`);
   return response.data || [];
 };
 
 export const fetchPendingApprovals = async (userId) => {
     if (!userId) throw new Error("User ID is required");
     const response = await api.get(`/consultations/approvals/${userId}`);
     return response.data || [];
 };
 
 export const fetchConsultationSummary = async (consultationId) => {
   const response = await api.get(`/consultations/${consultationId}/summary`);
   return response.data;
 };
