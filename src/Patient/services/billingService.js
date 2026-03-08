import axios from 'axios';
 
 const API_BASE_URL = "http://localhost:8080/api";
 
 const api = axios.create({
   baseURL: API_BASE_URL,
 });
 
 export const fetchBillingTickets = async (userId) => {
   try {
     if (!userId) throw new Error("User ID is required");
     console.log(`[Backend] Fetching billing tickets for user ${userId}...`);
     const response = await api.get(`/billing/${userId}`);
     return response.data || [];
   } catch (err) {
     console.error("[Backend] Failed to fetch billing tickets:", err);
     throw err;
   }
 };
 
 export const payBillingTicket = async (ticketId) => {
   try {
     console.log(`[Backend] Processing payment for ticket ${ticketId}...`);
     await api.post(`/billing/pay/`, { ticketId }); // The original endpoint seems to be missing the ID.
   } catch (err) {
     console.error("[Backend] Failed to process payment:", err);
     throw err;
   }
 };
