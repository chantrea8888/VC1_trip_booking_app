import { apiRequest, clearApiAuthToken, getApiAuthToken, setApiAuthToken } from './api';

const STORAGE_KEYS = {
  token: 'auth_token',
  user: 'auth_user',
};

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStorage = (key) => {
  if (!canUseStorage()) {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key, value) => {
  if (!canUseStorage()) {
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage write errors (e.g. private mode).
  }
};

const removeStorage = (key) => {
  if (!canUseStorage()) {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage removal errors.
  }
};

let cachedUser = null;

const hydrateAuthFromStorage = () => {
  const storedToken = readStorage(STORAGE_KEYS.token);
  if (storedToken) {
    setApiAuthToken(storedToken);
  }

  const storedUser = readStorage(STORAGE_KEYS.user);
  if (storedUser) {
    try {
      cachedUser = JSON.parse(storedUser);
    } catch {
      cachedUser = null;
    }
  }
};

hydrateAuthFromStorage();

export function getAuthToken() {
  return getApiAuthToken();
}

export function setAuthToken(token) {
  setApiAuthToken(token);
  if (token) {
    writeStorage(STORAGE_KEYS.token, token);
  } else {
    removeStorage(STORAGE_KEYS.token);
  }
}

export function clearAuthToken() {
  clearApiAuthToken();
  removeStorage(STORAGE_KEYS.token);
}

export function getAuthUser() {
  return cachedUser;
}

export function setAuthUser(user) {
  cachedUser = user ?? null;
  if (cachedUser) {
    writeStorage(STORAGE_KEYS.user, JSON.stringify(cachedUser));
  } else {
    removeStorage(STORAGE_KEYS.user);
  }
}

export function clearAuthUser() {
  cachedUser = null;
  removeStorage(STORAGE_KEYS.user);
}

export function getUserRole() {
  return getAuthUser()?.role ?? null;
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export async function login(payload) {
  const normalizedPayload = {
    ...payload,
    email: typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : payload?.email,
  };
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(normalizedPayload),
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
  const normalizedPayload = {
    ...payload,
    email: typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : payload?.email,
  };
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(normalizedPayload),
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

  if (token) {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore logout API errors and still clear local auth.
    }
  }

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
