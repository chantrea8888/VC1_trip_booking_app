const DEFAULT_API_BASE_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}/api`
    : 'http://127.0.0.1:8000/api';
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

const normalizeApiBaseUrl = (value) => {
  const trimmed = String(value ?? '').trim();
  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
  if (withoutTrailingSlash.endsWith('/api')) {
    return withoutTrailingSlash;
<<<<<<< HEAD
  }
  return `${withoutTrailingSlash}/api`;
};

export const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);

let authToken = null;

export function getApiAuthToken() {
  return authToken;
}

export function setApiAuthToken(token) {
  authToken = token ?? null;
}

export function clearApiAuthToken() {
  authToken = null;
}

function getStoredAuthToken() {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('auth_token');
  } catch {
    return null;
=======
>>>>>>> social-account
  }
  return `${withoutTrailingSlash}/api`;
};

export const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);

let authToken = null;

export function getApiAuthToken() {
  return authToken;
}

export function setApiAuthToken(token) {
  authToken = token ?? null;
}

export function clearApiAuthToken() {
  authToken = null;
}

export async function apiRequest(path, options = {}) {
<<<<<<< HEAD
  const token = getApiAuthToken() ?? getStoredAuthToken();
=======
  const token = getApiAuthToken();
>>>>>>> social-account
  const hasAuthHeader = Boolean(
    options?.headers &&
      Object.keys(options.headers).some((key) => key.toLowerCase() === 'authorization'),
  );
  const isFormData =
    typeof FormData !== 'undefined' && options?.body instanceof FormData;
<<<<<<< HEAD

  let response;
  try {
    const headers = {
      Accept: 'application/json',
      ...(token && !hasAuthHeader ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    };

    response = await fetch(`${API_BASE_URL}${path}`, {
      headers,
      ...options,
    });
  } catch (cause) {
    const error = new Error(
      `Failed to reach API at ${API_BASE_URL}. Make sure the Laravel backend is running and CORS allows this origin.`,
    );
    error.cause = cause;
    error.status = 0;
    error.data = { message: error.message };
    throw error;
  }
=======

  const headers = {
    Accept: 'application/json',
    ...(token && !hasAuthHeader ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });
>>>>>>> social-account

  const rawBody = await response.text();
  let data = {};

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { message: rawBody };
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message ?? 'Request failed');
    error.status = response.status;
    error.data = data;
    error.errors = data?.errors ?? null;
    throw error;
  }

  return data;
}

// Create a wrapper object
export const api = {
  request: apiRequest,
};
