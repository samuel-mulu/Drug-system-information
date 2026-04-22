const API_BASE_URL = '';
const REQUEST_TIMEOUT_MS = 20000;
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

interface ApiErrorPayload {
  message?: string;
  error?: string;
  errors?: unknown;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function buildHeaders(options: RequestInit): HeadersInit {
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined && !(options.body instanceof FormData);

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

async function parseJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function mergeAbortSignals(
  signalA?: AbortSignal | null,
  signalB?: AbortSignal | null
): AbortSignal | undefined {
  if (!signalA) return signalB ?? undefined;
  if (!signalB) return signalA ?? undefined;

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signalA.addEventListener('abort', onAbort);
  signalB.addEventListener('abort', onAbort);
  return controller.signal;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: mergeAbortSignals(options.signal, timeoutController.signal),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(
        'The server is taking too long to respond. It may be waking up on Render, please try again in a few seconds.',
        408
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function isRetriableNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const requestOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: buildHeaders(options),
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, requestOptions);

      if (!response.ok) {
        if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS);
          continue;
        }

        const payload = await parseJson<ApiErrorPayload>(response).catch(() => undefined);
        const message = payload?.message || payload?.error || response.statusText || 'Request failed';
        throw new ApiError(message, response.status, payload?.errors);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return parseJson<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (attempt < MAX_RETRIES && isRetriableNetworkError(error)) {
        await delay(RETRY_DELAY_MS);
        continue;
      }

      throw new ApiError(
        'Cannot reach server. If you use Render free tier, wait 20-60 seconds for cold start and try again.',
        503
      );
    }
  }

  throw new ApiError('Request failed after retries', 503);
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export const api = {
  get: <T>(url: string) => apiRequest<T>(url, { method: 'GET' }),
  post: <T>(url: string, body?: unknown) =>
    apiRequest<T>(url, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(url: string, body?: unknown) =>
    apiRequest<T>(url, {
      method: 'PUT',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(url: string, body?: unknown) =>
    apiRequest<T>(url, {
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(url: string) => apiRequest<T>(url, { method: 'DELETE' }),
};
