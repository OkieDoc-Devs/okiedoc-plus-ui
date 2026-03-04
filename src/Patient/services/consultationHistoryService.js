 import axios from 'axios';
 import { dummyConsultationHistory, dummyPendingApprovals, dummyConsultationSummary } from "../../api/Patient/test";
 
 const API_BASE_URL = "http://localhost:8080/api";
 
 const api = axios.create({
   baseURL: API_BASE_URL,
 });
 
 export const fetchConsultationHistory = async (userId) => {
   try {
     if (!userId) throw new Error("User ID is required");
     console.log(`[Backend] Fetching consultation history for user ${userId}...`);
     const response = await api.get(`/consultations/history/${userId}`);
     return response.data || [];
   } catch (err) {
     console.error("[Backend] Failed to fetch consultation history:", err);
     console.log("[Fallback] Using dummy consultation history.");
     return dummyConsultationHistory;
   }
 };
 
 export const fetchPendingApprovals = async (userId) => {
   try {
     if (!userId) throw new Error("User ID is required");
     console.log(`[Backend] Fetching pending approvals for user ${userId}...`);
     const response = await api.get(`/consultations/approvals/${userId}`);
     return response.data || [];
   } catch (err) {
     console.error("[Backend] Failed to fetch pending approvals:", err);
     console.log("[Fallback] Using dummy pending approvals.");
     return dummyPendingApprovals;
   }
 };
 
 export const fetchConsultationSummary = async (consultationId) => {
   try {
     console.log(`[Backend] Fetching summary for consultation ${consultationId}...`);
     const response = await api.get(`/consultations/${consultationId}/summary`);
     return response.data;
   } catch (err) {
     console.error("[Backend] Failed to fetch summary:", err);
     console.log("[Fallback] Using dummy consultation summary.");
     return dummyConsultationSummary;
   }
 };
