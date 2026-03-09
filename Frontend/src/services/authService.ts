import { apiRequest } from './api';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthUser(): any {
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

export function setAuthUser(user: any): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getUserRole(): string | null {
  return getAuthUser()?.role ?? null;
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export async function login(payload: any): Promise<any> {
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

export async function register(payload: any): Promise<any> {
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

export async function logout(): Promise<void> {
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
