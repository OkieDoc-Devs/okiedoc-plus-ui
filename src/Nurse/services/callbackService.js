
import { apiRequest } from "../../api/apiClient";

export async function fetchCallbackRequestsFromAPI() {
  try {
    const data = await apiRequest("/api/v1/nurse/callback-requests");

    if (data.success) {
      return data.data || [];
    } else {
      throw new Error(data.message || "Failed to load callback requests");
    }
  } catch (error) {
    console.error("Error fetching callback requests from API:", error);
    throw error;
  }
}

export async function updateCallbackRequest(id, patch) {
  try {
    const data = await apiRequest(`/api/v1/nurse/callback-requests/${id}`, "PATCH", patch);

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || "Failed to update callback request");
    }
  } catch (error) {
    console.error("Error updating callback request:", error);
    throw error;
  }
}
