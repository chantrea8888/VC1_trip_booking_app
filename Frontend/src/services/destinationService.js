import { apiRequest } from '@/services/api';

const DESTINATION_ENDPOINTS = ['/destinations', '/destinations/public', '/destinations/public/all'];

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.destinations)) return payload.destinations;

  return [];
}

function dedupeDestinations(records) {
  const seen = new Set();
  const merged = [];

  for (const record of records) {
    if (!record || typeof record !== 'object') continue;

    const key =
      record.id ??
      record._id ??
      record.destinationId ??
      record.slug ??
      `${record.name ?? ''}:${record.location ?? ''}:${record.city ?? ''}`;

    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(record);
  }

  return merged;
}

async function fetchEndpoint(endpoint) {
  return apiRequest(endpoint);
}

export async function getPublicDestinations() {
  const settled = await Promise.allSettled(DESTINATION_ENDPOINTS.map((endpoint) => fetchEndpoint(endpoint)));

  const records = settled.flatMap((result) => {
    if (result.status !== 'fulfilled') return [];
    return asArray(result.value);
  });

  return dedupeDestinations(records);
}
