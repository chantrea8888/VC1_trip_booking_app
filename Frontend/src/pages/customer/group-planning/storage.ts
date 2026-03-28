import type { StoredGroup } from './types';

const STORAGE_KEY = 'vc1.groupPlanning.groups';

type StoredGroupsMap = Record<string, StoredGroup>;

const safeParseGroups = (raw: string | null): StoredGroupsMap => {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as StoredGroupsMap;
  } catch {
    return {};
  }
};

export function normalizeAccessCode(value: string): string {
  return String(value ?? '')
    .replace(/\s+/g, '')
    .trim()
    .toUpperCase();
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function loadGroupsFromStorage(): StoredGroupsMap {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  return safeParseGroups(window.localStorage.getItem(STORAGE_KEY));
}

const saveGroupsToStorage = (groups: StoredGroupsMap): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
};

export function upsertGroupInStorage(group: StoredGroup): void {
  const groups = loadGroupsFromStorage();
  groups[group.id] = group;
  saveGroupsToStorage(groups);
}

export function findGroupByCode(code: string): StoredGroup | null {
  const normalized = normalizeAccessCode(code);
  if (!normalized) return null;

  const groups = loadGroupsFromStorage();
  for (const group of Object.values(groups)) {
    if (!group) continue;
    const groupCode = normalizeAccessCode(group.accessCode ?? group.id);
    const groupId = normalizeAccessCode(group.id);
    if (normalized === groupCode || normalized === groupId) return group;
  }

  return null;
}

