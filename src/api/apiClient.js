/**
 * Global API Client
 * Centralizes duplicate fetch logic across Patient and Specialist services
 */

const resolvedApiUrl =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

if (import.meta.env.PROD) {
  if (!resolvedApiUrl) {
    throw new Error("VITE_API_URL must be set in production.");
  }

  if (!resolvedApiUrl.startsWith("https://")) {
    throw new Error("VITE_API_URL must use HTTPS in production.");
  }
}

export const API_BASE_URL = resolvedApiUrl || "http://localhost:1337";

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint (relative to API_BASE_URL or absolute path)
 * @param {object} options - Fetch options
 * @returns {Promise<any>} API response payload
 */
export async function apiRequest(endpoint, options = {}) {
  const defaultOptions = {
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const mergedHeaders = {
    ...defaultOptions.headers,
    ...options.headers,
  };

  const jwtToken = localStorage.getItem("jwt_token");
  if (jwtToken) {
    mergedHeaders["Authorization"] = `Bearer ${jwtToken}`;
  }

  const { disableAuthRedirect = false, ...fetchOptions } = options;

  if (options.body instanceof FormData) {
    delete mergedHeaders["Content-Type"];
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const method = (fetchOptions.method || "GET").toUpperCase();

  if (import.meta.env.PROD && url.startsWith("http://")) {
    throw new Error("Insecure API request blocked in production.");
  }

  try {
    let response = await fetch(url, {
      ...defaultOptions,
      ...fetchOptions,
      headers: mergedHeaders,
    });

    const contentType = response.headers.get("content-type");
    let responseData;

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json().catch(() => ({}));
    } else {
      responseData = await response.text();
      try {
        responseData = responseData ? JSON.parse(responseData) : {};
      } catch (e) {}
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        if (!disableAuthRedirect) {
          localStorage.removeItem("jwt_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }

      const errorPayload =
        typeof responseData === "object"
          ? responseData
          : { error: responseData };
      const errorMessage =
        errorPayload.error ||
        errorPayload.message ||
        `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    return responseData;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}
