/**
 * Specialist Authentication Service
 * Handles authentication and session management for specialists
 */

import * as api from "./services/apiService.js";

const STORAGE_KEYS = {
  currentUser: "okiedoc_specialist_user",
  userType: "okiedoc_user_type",
  token: "okiedoc_auth_token",
};

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
  }

  /**
   * Initialize auth service - check for existing session
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Try to restore session from API
      const response = await api.getCurrentUser();
      if (response.success && response.user) {
        this.currentUser = response.user;
        localStorage.setItem(
          STORAGE_KEYS.currentUser,
          JSON.stringify(response.user)
        );
        localStorage.setItem(
          STORAGE_KEYS.userType,
          response.user.userType || "specialist"
        );
      }
    } catch (error) {
      // Session expired or not authenticated
      this.clearLocalStorage();
    }

    this.isInitialized = true;
  }

  /**
   * Login specialist with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} Login result
   */
  async loginSpecialist(email, password) {
    try {
      const response = await api.loginSpecialist(email, password);

      if (response.success) {
        this.currentUser = response.user;
        localStorage.setItem(
          STORAGE_KEYS.currentUser,
          JSON.stringify(response.user)
        );
        localStorage.setItem(STORAGE_KEYS.userType, "specialist");

        return {
          success: true,
          user: response.user,
          redirect: response.redirect || "/specialist-dashboard",
        };
      }

      return {
        success: false,
        error: response.message || "Login failed",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Login failed. Please try again.",
      };
    }
  }

  /**
   * Logout specialist
   * @returns {Promise<object>} Logout result
   */
  async logout() {
    try {
      await api.logoutSpecialist();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      this.clearLocalStorage();
      this.currentUser = null;
    }

    return { success: true };
  }

  /**
   * Get current user from memory or localStorage
   * @returns {object|null} Current user data or null
   */
  getCurrentUser() {
    if (this.currentUser) {
      return {
        user: this.currentUser,
        userType: "specialist",
      };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.currentUser);
      const userType = localStorage.getItem(STORAGE_KEYS.userType);

      if (stored && userType) {
        this.currentUser = JSON.parse(stored);
        return {
          user: this.currentUser,
          userType,
        };
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }

    return null;
  }

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  /**
   * Check if current user is a specialist
   * @returns {boolean}
   */
  isSpecialist() {
    const current = this.getCurrentUser();
    return current && current.userType === "specialist";
  }

  /**
   * Update current user data in memory and localStorage
   * @param {object} userData - Updated user data
   */
  updateCurrentUser(userData) {
    this.currentUser = { ...this.currentUser, ...userData };
    localStorage.setItem(
      STORAGE_KEYS.currentUser,
      JSON.stringify(this.currentUser)
    );
  }

  /**
   * Clear all auth data from localStorage
   */
  clearLocalStorage() {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    localStorage.removeItem(STORAGE_KEYS.userType);
    localStorage.removeItem(STORAGE_KEYS.token);
  }

  /**
   * Get redirect path based on user type
   * @param {string} userType
   * @returns {string} Redirect path
   */
  getRedirectPath(userType) {
    const paths = {
      specialist: "/specialist-dashboard",
      patient: "/patient/main",
      nurse: "/nurse-dashboard",
      admin: "/admin/specialist-dashboard",
    };
    return paths[userType] || "/dashboard";
  }

  // ==========================================
  // Validation Helpers
  // ==========================================

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password) {
    return password && password.length >= 6;
  }

  validateSpecialistData(data) {
    const errors = {};

    if (!data.firstName?.trim()) {
      errors.firstName = "First name is required";
    }

    if (!data.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!data.email?.trim()) {
      errors.email = "Email is required";
    } else if (!this.validateEmail(data.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!data.password) {
      errors.password = "Password is required";
    } else if (!this.validatePassword(data.password)) {
      errors.password = "Password must be at least 6 characters long";
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!data.specialization?.trim()) {
      errors.specialization = "Medical specialty is required";
    }

    if (!data.prcNumber?.trim()) {
      errors.prcNumber = "PRC license number is required";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;

// Also export the class for testing
export { AuthService };
