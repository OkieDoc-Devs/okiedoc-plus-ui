import { apiRequest } from "../../api/apiClient";

// Log out Patient for Audit
export const logoutPatient = async () => {
  try {
    await apiRequest("/api/v1/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("okiedoc_user_type");
  }
};
