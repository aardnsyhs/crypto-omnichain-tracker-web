import type { TransactionLookupRequest, TransactionLookupResponse } from './api-types';
import { ConfigurationError } from './api-errors';

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
   * NOTE: Intentionally unimplemented in Milestone 1B (Foundation only).
   * Live network calls are deferred to Milestone 4.
   */
  public async lookupTransaction(
    _request: TransactionLookupRequest,
  ): Promise<TransactionLookupResponse> {
    throw new Error(
      'ApiClient.lookupTransaction is deferred from Milestone 1B (Frontend Foundation). Live network calls are not implemented yet.',
    );
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
