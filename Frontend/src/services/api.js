import { getAuthToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

const AUTH_TOKEN_KEY = 'auth_token';

function getStoredAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const token = getStoredAuthToken();
  const hasAuthHeader = Boolean(
    options?.headers &&
      Object.keys(options.headers).some((key) => key.toLowerCase() === 'authorization'),
  );

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token && !hasAuthHeader ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

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
    throw error;
  }

  return data;
}

// Create a wrapper object
export const api = {
  request: apiRequest,
};
