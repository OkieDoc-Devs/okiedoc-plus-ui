/**
 * Global API Client
 * Centralizes duplicate fetch logic across Patient and Specialist services
 */

const resolvedApiUrl =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';

if (import.meta.env.PROD) {
  if (!resolvedApiUrl) {
    throw new Error('VITE_API_URL must be set in production.');
  }

  if (!resolvedApiUrl.startsWith('https://')) {
    throw new Error('VITE_API_URL must use HTTPS in production.');
  }
}

export const API_BASE_URL = resolvedApiUrl || 'http://localhost:1337';

// Global variable to cache the CSRF token so we don't fetch it on every single click
let cachedCsrfToken = null;

/**
 * Fetches the CSRF token from the Sails.js backend.
 */
async function getCsrfToken() {
  if (cachedCsrfToken) return cachedCsrfToken;
  try {
    let response = await fetch(`${API_BASE_URL}/api/v1/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.status === 404) {
      response = await fetch(`${API_BASE_URL}/csrfToken`, {
        method: 'GET',
        credentials: 'include',
      });
    }

    if (response.ok) {
      const data = await response.json();
      cachedCsrfToken = data._csrf || data.csrfToken;
      return cachedCsrfToken;
    }
  } catch (error) {
    console.warn('Failed to fetch CSRF token:', error);
  }
  return null;
}

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

  const jwtToken = localStorage.getItem('jwt_token');
  if (jwtToken) {
    mergedHeaders['Authorization'] = `Bearer ${jwtToken}`;
  }

  const method = (options.method || 'GET').toUpperCase();

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      mergedHeaders['X-CSRF-Token'] = csrfToken;
    }
  }

  const { disableAuthRedirect = false, ...fetchOptions } = options;

  if (options.body instanceof FormData) {
    delete mergedHeaders['Content-Type'];
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  if (import.meta.env.PROD && url.startsWith('http://')) {
    throw new Error('Insecure API request blocked in production.');
  }

  try {
    let response = await fetch(url, {
      ...defaultOptions,
      ...fetchOptions,
      headers: mergedHeaders,
      method, 
    });

    if (response.status === 403 && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        cachedCsrfToken = null; 
        const freshToken = await getCsrfToken();
        if (freshToken) {
           mergedHeaders['X-CSRF-Token'] = freshToken;
           response = await fetch(url, {
              ...defaultOptions,
              ...fetchOptions,
              headers: mergedHeaders,
              method
           });
        }
    }

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
      if (response.status === 401) {
        if (!disableAuthRedirect) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }

      if (typeof responseData === 'string') {
        throw new Error(responseData || `HTTP error! status: ${response.status}`);
      }

      // Create error object to preserve all response data for better error handling
      const error = new Error(responseData?.message || responseData?.error || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.response = responseData;
      
      throw error;
    }

    return responseData;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}