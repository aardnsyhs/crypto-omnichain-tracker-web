export type SupportedChain = 'ethereum' | 'bsc' | 'polygon';

export type TransactionStatus = 'confirmed' | 'failed' | 'pending';

export interface TokenValue {
  raw: string;
  formatted: string;
  symbol: string;
}

export interface TransactionData {
  transactionHash: string;
  chain: SupportedChain;
  status: TransactionStatus;
  from: string;
  to: string | null;
  value: TokenValue;
  fee: TokenValue;
  blockNumber: string;
  timestamp: string;
  explorerUrl: string;
}

export interface LookupMetadata {
  requestId: string;
  cache: {
    hit: boolean;
  };
}

export interface TransactionLookupRequest {
  chain: SupportedChain;
  transactionHash: string;
}

export interface TransactionLookupResponse {
  data: TransactionData;
  meta: LookupMetadata;
}

export type ApiErrorCode =
  | 'INVALID_TRANSACTION_HASH'
  | 'UNSUPPORTED_CHAIN'
  | 'VALIDATION_ERROR'
  | 'TRANSACTION_NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UPSTREAM_PROVIDER_ERROR'
  | 'UPSTREAM_TIMEOUT'
  | 'UPSTREAM_RATE_LIMITED';

export interface ApiErrorDetail {
  code: ApiErrorCode | string;
  message: string;
  requestId: string;
}

export interface ApiErrorPayload {
  error: ApiErrorDetail;
}

export interface HistoryItem {
  id: string;
  transactionHash: string;
  chain: string;
  outcome: string;
  cacheHit: boolean;
  searchedAt: string;
}

export interface HistoryListResponse {
  data: HistoryItem[];
  meta: {
    total: number;
    sessionId: string;
  };
}
