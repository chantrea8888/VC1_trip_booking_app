import { apiRequest } from './api';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthUser(user) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getUserRole() {
  return getAuthUser()?.role ?? null;
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export async function login(payload) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (data?.access_token) {
    setAuthToken(data.access_token);
  }

  if (data?.user) {
    setAuthUser(data.user);
  }

  return data;
}

export async function register(payload) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (data?.access_token) {
    setAuthToken(data.access_token);
  }

  if (data?.user) {
    setAuthUser(data.user);
  }

  return data;
}

export async function logout() {
  const token = getAuthToken();

  if (!token) {
    return;
  }

  await apiRequest('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  clearAuthToken();
  clearAuthUser();
}

export const authService = {
  login,
  register,
  logout,
  getAuthToken,
  getAuthUser,
  setAuthUser,
  clearAuthUser,
  getUserRole,
  clearAuthToken,
  isAuthenticated,
};
