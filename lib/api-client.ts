import type {
  TransactionLookupRequest,
  TransactionLookupResponse,
  HistoryListResponse,
  OverviewResponse,
  ApiErrorPayload,
} from './api-types';
import { ConfigurationError, ApiClientError } from './api-errors';

export const LOCAL_DEVELOPMENT_API_BASE_URL = 'http://localhost:4000';

/**
 * Validates and normalizes an API base URL without third-party dependencies.
 * - Trims whitespace
 * - Rejects empty strings
 * - Rejects malformed or non-absolute URLs
 * - Enforces http: or https: protocols
 * - Strips trailing slashes
 */
export function normalizeAndValidateBaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new ConfigurationError('API base URL cannot be empty.');
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new ConfigurationError(
      `Invalid API base URL "${trimmed}". Must be a valid absolute URL (e.g., http://localhost:4000).`,
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ConfigurationError(
      `Invalid API base URL protocol "${parsed.protocol}". Must be http: or https:.`,
    );
  }

  return trimmed.replace(/\/+$/, '');
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = normalizeAndValidateBaseUrl(baseUrl);
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Looks up a single EVM transaction hash on the selected chain.
   */
  public async lookupTransaction(
    request: TransactionLookupRequest,
  ): Promise<TransactionLookupResponse> {
    const url = `${this.baseUrl}/v1/transactions/lookup`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(request),
      });
    } catch (networkError) {
      throw new ApiClientError(0, {
        code: 'NETWORK_ERROR',
        message: `Unable to connect to the transaction tracking API at ${this.baseUrl}. ${(networkError as Error).message}`,
        requestId: '',
      });
    }

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return (await response.json()) as TransactionLookupResponse;
  }

  /**
   * Fetches recent search history scoped to the current anonymous session.
   */
  public async getHistory(limit = 20): Promise<HistoryListResponse> {
    const url = `${this.baseUrl}/v1/history?limit=${limit}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      });
    } catch (networkError) {
      throw new ApiClientError(0, {
        code: 'NETWORK_ERROR',
        message: `Unable to load search history from ${this.baseUrl}. ${(networkError as Error).message}`,
        requestId: '',
      });
    }

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return (await response.json()) as HistoryListResponse;
  }

  /**
   * Fetches market prices, 24h changes, latest block info, and suggested gas prices
   * across supported EVM networks.
   */
  public async getOverview(): Promise<OverviewResponse> {
    const url = `${this.baseUrl}/v1/overview`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      });
    } catch (networkError) {
      throw new ApiClientError(0, {
        code: 'NETWORK_ERROR',
        message: `Unable to load market and network overview from ${this.baseUrl}. ${(networkError as Error).message}`,
        requestId: '',
      });
    }

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return (await response.json()) as OverviewResponse;
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorDetail = {
      code: 'API_ERROR',
      message: `Request failed with status ${response.status}: ${response.statusText}`,
      requestId: '',
    };

    try {
      const errorPayload = (await response.json()) as ApiErrorPayload;
      if (errorPayload && errorPayload.error) {
        errorDetail = {
          code: errorPayload.error.code || 'API_ERROR',
          message: errorPayload.error.message || errorDetail.message,
          requestId: errorPayload.error.requestId || '',
        };
      }
    } catch {
      // Response body was not JSON; use default status message
    }

    throw new ApiClientError(response.status, errorDetail);
  }
}

/**
 * Factory function creating an ApiClient instance.
 * Reads process.env.NEXT_PUBLIC_API_BASE_URL with fallback to LOCAL_DEVELOPMENT_API_BASE_URL.
 */
export function createApiClient(customBaseUrl?: string): ApiClient {
  const resolvedUrl =
    customBaseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? LOCAL_DEVELOPMENT_API_BASE_URL;

  return new ApiClient(resolvedUrl);
}
