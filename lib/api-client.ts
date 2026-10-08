import type {
  TransactionLookupRequest,
  TransactionLookupResponse,
  HistoryListResponse,
  OverviewResponse,
  ApiErrorPayload,
} from './api-types';
import { ConfigurationError, ApiClientError } from './api-errors';

export const LOCAL_DEVELOPMENT_API_BASE_URL = 'http://localhost:4000';
const sessions = new Map<string, Promise<void>>();

export function normalizeAndValidateBaseUrl(rawUrl: string): string {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new ConfigurationError('API base URL must be an absolute HTTP or HTTPS URL.');
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/'
  ) {
    throw new ConfigurationError(
      'API base URL must be an HTTP or HTTPS origin without a path or credentials.',
    );
  }
  return url.origin;
}

export function isIntentionalCancellation(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export class ApiClient {
  private readonly baseUrl: string;
  constructor(
    baseUrl: string,
    private readonly timeoutMs = 45000,
  ) {
    this.baseUrl = normalizeAndValidateBaseUrl(baseUrl);
  }
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  // Bootstrap once before concurrent history and lookup requests can issue competing cookies.
  public async initializeSession(): Promise<void> {
    let pending = sessions.get(this.baseUrl);
    if (!pending) {
      pending = this.request<void>('/v1/session').catch((error) => {
        sessions.delete(this.baseUrl);
        throw error;
      });
      sessions.set(this.baseUrl, pending);
    }
    return pending;
  }

  public async lookupTransaction(
    request: TransactionLookupRequest,
    signal?: AbortSignal,
  ): Promise<TransactionLookupResponse> {
    signal?.throwIfAborted();
    await this.waitForSession(signal);
    signal?.throwIfAborted();
    return this.request(
      '/v1/transactions/lookup',
      { method: 'POST', body: JSON.stringify(request) },
      signal,
    );
  }

  public async getHistory(limit = 20, signal?: AbortSignal): Promise<HistoryListResponse> {
    signal?.throwIfAborted();
    await this.waitForSession(signal);
    signal?.throwIfAborted();
    return this.request(`/v1/history?limit=${limit}`, {}, signal);
  }

  public async getOverview(signal?: AbortSignal): Promise<OverviewResponse> {
    return this.request('/v1/overview', { credentials: 'omit' }, signal);
  }

  private async waitForSession(signal?: AbortSignal): Promise<void> {
    if (!signal) return this.initializeSession();
    let cancel: (() => void) | undefined;
    try {
      await Promise.race([
        this.initializeSession(),
        new Promise<never>((_, reject) => {
          cancel = () => reject(new DOMException('Request cancelled.', 'AbortError'));
          signal.addEventListener('abort', cancel, { once: true });
          if (signal.aborted) cancel();
        }),
      ]);
    } finally {
      if (cancel) signal.removeEventListener('abort', cancel);
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    externalSignal?: AbortSignal,
  ): Promise<T> {
    const controller = new AbortController();
    const abort = () => controller.abort(externalSignal?.reason);
    externalSignal?.throwIfAborted();
    externalSignal?.addEventListener('abort', abort, { once: true });
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        credentials: 'include',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        ...options,
        signal: controller.signal,
      });
      if (!response.ok) {
        let payload: ApiErrorPayload | null = null;
        try {
          payload = (await response.json()) as ApiErrorPayload;
        } catch {
          /* Proxies may return an HTML error. */
        }
        const retry = response.headers.get('Retry-After');
        throw new ApiClientError(response.status, {
          code:
            payload?.error?.code || (response.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'API_ERROR'),
          message:
            (payload?.error?.message || `Request failed (${response.status}).`) +
            (retry && /^\d+$/.test(retry) ? ` Retry in ${retry} seconds.` : ''),
          requestId: payload?.error?.requestId || '',
        });
      }
      return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
    } catch (error) {
      if (externalSignal?.aborted) throw new DOMException('Request cancelled.', 'AbortError');
      if (error instanceof ApiClientError && !timedOut) throw error;
      throw new ApiClientError(0, {
        code: timedOut ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
        message: timedOut
          ? 'The request timed out. Please retry.'
          : 'Unable to connect to the transaction API. Please retry.',
        requestId: '',
      });
    } finally {
      clearTimeout(timer);
      externalSignal?.removeEventListener('abort', abort);
    }
  }
}

export function createApiClient(customBaseUrl?: string): ApiClient {
  const configured = customBaseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured && process.env.NODE_ENV === 'production')
    throw new ConfigurationError(
      'NEXT_PUBLIC_API_BASE_URL must be configured before the production build.',
    );
  return new ApiClient(configured ?? LOCAL_DEVELOPMENT_API_BASE_URL);
}
