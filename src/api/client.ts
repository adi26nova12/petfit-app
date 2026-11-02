/**
 * Thin HTTP client for the PetFit backend.
 *
 * Backend hand-off: set EXPO_PUBLIC_API_URL and EXPO_PUBLIC_USE_MOCKS=false in `.env`
 * and every call in `src/api/index.ts` goes to the network instead of the demo data.
 */

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://api.petfit.co.in/api/v1').replace(/\/$/, '');
export const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS !== 'false';

let authToken: string | null = null;
/** Called by the session store after OTP verification / on logout. Persist it in expo-secure-store. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      accept: 'application/json',
      ...(body !== undefined && { 'content-type': 'application/json' }),
      ...(authToken && { authorization: `Bearer ${authToken}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, json?.message ?? res.statusText, json);
  // The PetFit API wraps collections as { data: [...] }.
  return (json && typeof json === 'object' && 'data' in json ? json.data : json) as T;
}

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};

/** Simulated latency for demo data so loading states are visible in the design. */
export const mock = <T>(value: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(JSON.parse(JSON.stringify(value)) as T), ms));
