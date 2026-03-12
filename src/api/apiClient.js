/**
 * Global API Client
 * Centralizes duplicate fetch logic across Patient and Specialist services
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:1337';

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint (relative to API_BASE_URL or absolute path)
 * @param {object} options - Fetch options
 * @returns {Promise<any>} API response payload
 */
export async function apiRequest(endpoint, options = {}) {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedHeaders = {
    ...defaultOptions.headers,
    ...options.headers,
  };

  const adminToken = localStorage.getItem('admin_token');
  if (adminToken && !mergedHeaders['Authorization']) {
    mergedHeaders['Authorization'] = `Bearer ${adminToken}`;
  }

  if (options.body instanceof FormData) {
    delete mergedHeaders['Content-Type'];
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: mergedHeaders,
    });

    const contentType = response.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json().catch(() => ({}));
    } else {
      responseData = await response.text();
      try {
        responseData = responseData ? JSON.parse(responseData) : {};
      } catch (e) {}
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("okiedoc_user_type");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("nurse.id");
        localStorage.removeItem("nurse.firstName");
        window.location.href = "/login";
      }

      const errorPayload =
        typeof responseData === 'object'
          ? responseData
          : { error: responseData };
      throw (
        errorPayload.error ||
        errorPayload.message ||
        errorPayload ||
        new Error(`HTTP error! status: ${response.status}`)
      );
    }

    return responseData;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}
