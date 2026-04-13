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

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
let cachedCsrfToken = null;

async function fetchCsrfToken(forceRefresh = false) {
  if (!forceRefresh && cachedCsrfToken) {
    return cachedCsrfToken;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/csrf-token`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Unable to retrieve CSRF token.');
  }

  const payload = await response.json().catch(() => ({}));
  const token = payload._csrf || payload.csrfToken;

  if (!token) {
    throw new Error('CSRF token response was invalid.');
  }

  cachedCsrfToken = token;
  return token;
}

function isLikelyCsrfFailure(responseData) {
  const text =
    typeof responseData === 'string'
      ? responseData
      : responseData?.error || responseData?.message || '';
  return /csrf|forgery token|forbidden/i.test(String(text));
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

  const { disableAuthRedirect = false, ...fetchOptions } = options;

  if (options.body instanceof FormData) {
    delete mergedHeaders['Content-Type'];
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const method = (fetchOptions.method || 'GET').toUpperCase();

  if (import.meta.env.PROD && url.startsWith('http://')) {
    throw new Error('Insecure API request blocked in production.');
  }

  try {
    if (
      MUTATING_METHODS.has(method) &&
      !mergedHeaders['x-csrf-token']
    ) {
      mergedHeaders['x-csrf-token'] = await fetchCsrfToken();
    }

    let response = await fetch(url, {
      ...defaultOptions,
      ...fetchOptions,
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

    if (
      !response.ok &&
      response.status === 403 &&
      MUTATING_METHODS.has(method) &&
      !options._hasRetriedCsrf &&
      isLikelyCsrfFailure(responseData)
    ) {
      mergedHeaders['x-csrf-token'] = await fetchCsrfToken(true);
      response = await fetch(url, {
        ...defaultOptions,
        ...fetchOptions,
        _hasRetriedCsrf: true,
        headers: mergedHeaders,
      });

      const retryContentType = response.headers.get('content-type');
      if (retryContentType && retryContentType.includes('application/json')) {
        responseData = await response.json().catch(() => ({}));
      } else {
        const retryText = await response.text();
        try {
          responseData = retryText ? JSON.parse(retryText) : {};
        } catch (e) {
          responseData = retryText;
        }
      }
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        if (!disableAuthRedirect) {
          window.location.href = '/login';
        }
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
