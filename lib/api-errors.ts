import type { ApiErrorCode, ApiErrorDetail } from './api-types';

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ApiErrorCode | string;
  public readonly requestId?: string;

  constructor(statusCode: number, detail: ApiErrorDetail) {
    super(detail.message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.errorCode = detail.code;
    this.requestId = detail.requestId;
  }
}
