 import axios from 'axios';
 import { dummyLabResults } from "../../api/Patient/test";
 
 const API_BASE_URL = "http://localhost:8080/api";
 
 const api = axios.create({
   baseURL: API_BASE_URL,
 });
 
 export const fetchLabResults = async (userId) => {
   try {
     if (!userId) throw new Error("User ID is required");
     console.log(`[Backend] Fetching lab results for user ${userId}...`);
     const response = await api.get(`/lab-results/${userId}`);
     return response.data || [];
   } catch (err) {
     console.error("[Backend] Failed to fetch lab results:", err);
     console.log("[Fallback] Using dummy lab results.");
     return dummyLabResults;
   }
 };