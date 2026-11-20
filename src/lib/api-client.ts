import { API_BASE_URL, ENDPOINTS } from '@/lib/endpoints';
import {
  clearStoredTokens,
  getStoredTokens,
  saveStoredTokens,
} from '@/lib/token-storage';

export { clearStoredTokens, getStoredTokens, saveStoredTokens } from '@/lib/token-storage';

interface AuthCallbacks {
  onTokensUpdated?: (access: string, refresh: string) => void;
  onAuthExpired?: () => void;
}

let authCallbacks: AuthCallbacks = {};
let refreshPromise: Promise<string | null> | null = null;

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function setAuthCallbacks(callbacks: AuthCallbacks): void {
  authCallbacks = callbacks;
}

export function extractErrorMessage(payload: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (!payload) return fallback;
  if (typeof payload === 'string') return payload.trim() || fallback;
  if (Array.isArray(payload)) {
    return payload.length > 0 ? extractErrorMessage(payload[0], fallback) : fallback;
  }
  if (typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (typeof obj.detail === 'string' && obj.detail.trim()) return obj.detail;
    if (typeof obj.error === 'string' && obj.error.trim()) return obj.error;
    if (Array.isArray(obj.non_field_errors) && obj.non_field_errors.length > 0) {
      return extractErrorMessage(obj.non_field_errors[0], fallback);
    }
    const firstKey = Object.keys(obj)[0];
    if (firstKey) return extractErrorMessage(obj[firstKey], fallback);
  }
  return fallback;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json().catch(() => undefined);
  }
  const text = await response.text().catch(() => '');
  return text || undefined;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const { refresh } = await getStoredTokens();
    if (!refresh) return null;

    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.auth.refresh}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) return null;
      const data = (await response.json()) as { access?: string; refresh?: string };
      if (!data.access) return null;

      const nextRefresh = data.refresh || refresh;
      await saveStoredTokens(data.access, nextRefresh);
      authCallbacks.onTokensUpdated?.(data.access, nextRefresh);
      return data.access;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  signal?: AbortSignal;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  hasRetried = false,
): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth = false, signal } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  const reqHeaders: Record<string, string> = { Accept: 'application/json', ...headers };
  if (!isFormData && body !== undefined && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json';
  }
  if (!skipAuth) {
    const { access } = await getStoredTokens();
    if (access) reqHeaders.Authorization = `Bearer ${access}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: reqHeaders,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : '';
    if (
      detail &&
      !/network|fetch|timed out|abort|failed|connection|socket|dns/i.test(detail)
    ) {
      throw new ApiError(`Error al enviar la solicitud: ${detail}`, 0);
    }
    throw new ApiError('No se pudo conectar con el servidor. Verifica tu conexión.', 0);
  }

  if (response.status === 401 && !skipAuth && !hasRetried) {
    const newAccess = await refreshAccessToken();
    if (newAccess) return apiRequest<T>(path, options, true);
    await clearStoredTokens();
    authCallbacks.onAuthExpired?.();
    throw new ApiError('Tu sesión expiró. Inicia sesión nuevamente.', 401);
  }

  const parsed = await parseResponseBody(response);
  if (!response.ok) {
    const fallback =
      response.status === 402
        ? 'No tienes créditos suficientes para esta acción.'
        : `Error de red (${response.status}).`;
    throw new ApiError(extractErrorMessage(parsed, fallback), response.status, parsed);
  }

  return parsed as T;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
  postForm: <T>(path: string, formData: FormData, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'POST', body: formData }),
};
