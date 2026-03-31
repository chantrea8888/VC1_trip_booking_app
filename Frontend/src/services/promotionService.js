import { apiRequest } from './api';

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.promotions)) return payload.promotions;
  return [];
}

function dedupePromotions(records) {
  const seen = new Set();
  const merged = [];

  for (const record of records) {
    if (!record || typeof record !== 'object') continue;
    const key = record.id ?? record._id ?? record.promotion_id ?? `${record.title ?? ''}:${record.start_date ?? ''}:${record.end_date ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(record);
  }

  return merged;
}

/**
 * Get all promotions for the current owner
 */
export async function getPromotions() {
  const data = await apiRequest('/promotions', {
    method: 'GET',
  });
  return data.data || [];
}

/**
 * Get a single promotion by ID
 */
export async function getPromotion(id) {
  const data = await apiRequest(`/promotions/${id}`, {
    method: 'GET',
  });
  return data.data;
}

/**
 * Create a new promotion
 */
export async function createPromotion(promotionData) {
  const data = await apiRequest('/promotions', {
    method: 'POST',
    body: JSON.stringify(promotionData),
  });
  return data.data;
}

/**
 * Update an existing promotion
 */
export async function updatePromotion(id, promotionData) {
  const data = await apiRequest(`/promotions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(promotionData),
  });
  return data.data;
}

/**
 * Delete a promotion
 */
export async function deletePromotion(id) {
  const data = await apiRequest(`/promotions/${id}`, {
    method: 'DELETE',
  });
  return data;
}

export async function getPublicPromotions() {
  const endpoints = ['/promotions/public', '/promotions'];

  const settled = await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      const response = await apiRequest(endpoint, { method: 'GET' });
      return asArray(response);
    }),
  );

  const records = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  return dedupePromotions(records);
}

export const promotionService = {
  getPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPublicPromotions,
};

