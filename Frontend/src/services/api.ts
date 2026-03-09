const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) ?? 'http://127.0.0.1:8000/api';

export async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const rawBody = await response.text();
  let data: any = {};

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { message: rawBody };
    }
  }

  if (!response.ok) {
    const error = new Error((data as any)?.message ?? 'Request failed');
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data;
}

export const api = {
  request: apiRequest,
};
