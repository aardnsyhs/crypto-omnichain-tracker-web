export type SupportedChain = 'ethereum' | 'bsc' | 'polygon';

export type TransactionStatus = 'confirmed' | 'failed' | 'pending' | 'unknown';

export type StoryCoverage = 'complete' | 'partial' | 'unsupported';

export type CoverageReason =
  | 'metadata_unavailable'
  | 'receipt_unavailable'
  | 'unsupported_call'
  | 'trace_not_available'
  | 'temporary_enrichment_failure'
  | 'provider_discrepancy';

export interface TokenValue {
  raw: string;
  formatted: string;
  symbol: string;
}

export interface ActionItem {
  type: 'native_transfer' | 'token_transfer' | 'token_approval' | 'contract_interaction';
  description: string;
  actor: string;
  recipient?: string | null;
  asset?: {
    type: 'native' | 'erc20';
    symbol: string | null;
    contractAddress: string | null;
    rawAmount: string;
    formattedAmount: string | null;
    decimals: number | null;
  };
  proof: {
    source: 'native_value' | 'receipt_log' | 'calldata_input';
    contractAddress?: string | null;
    logIndex?: number | string | null;
  };
}

export interface TokenTransferItem {
  tokenAddress: string;
  symbol: string | null;
  name: string | null;
  decimals: number | null;
  from: string;
  to: string;
  rawAmount: string;
  formattedAmount: string | null;
  logIndex: string | number;
}

export interface TokenApprovalItem {
  tokenAddress: string;
  symbol: string | null;
  name: string | null;
  decimals: number | null;
  owner: string;
  spender: string;
  rawAmount: string;
  formattedAmount: string | null;
  isUnlimited: boolean;
  isRevocation: boolean;
  logIndex: string | number;
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
  timestamp: string | null;
  explorerUrl: string;
  fetchedAt: string;
  explanation: string;
  coverage: StoryCoverage;
  coverageReasons: CoverageReason[];
  actions: ActionItem[];
  tokenTransfers: TokenTransferItem[];
  approvals: TokenApprovalItem[];
  technical?: {
    gasUsed?: string | null;
    inputData?: string | null;
  };
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
  refresh?: boolean;
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
  txStatus: TransactionStatus;
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

export type MarketDataStatus = 'available' | 'stale' | 'rate_limited' | 'unavailable';
export type NetworkDataStatus = 'available' | 'stale' | 'unavailable';

export interface CoinMarketData {
  priceUsd: number | null;
  change24h: number | null;
  source: string;
  updatedAt: string | null;
  isStale: boolean;
  status: MarketDataStatus;
  reason?: string | null;
}

export interface ChainNetworkData {
  latestBlockNumber: number | null;
  latestBlockTimestamp: number | null;
  blockDate: string | null;
  suggestedGasPriceWei: string | null;
  suggestedGasPriceGwei: string | null;
  source: string;
  updatedAt: string | null;
  isStale: boolean;
  status: NetworkDataStatus;
  reason?: string | null;
  gasNote?: string | null;
}

export interface NetworkOverviewItem {
  chain: SupportedChain;
  name: string;
  nativeSymbol: string;
  coinGeckoId?: string;
  market: CoinMarketData | null;
  network: ChainNetworkData | null;
}

export interface OverviewResponse {
  data: NetworkOverviewItem[];
  meta: {
    fetchedAt: string;
    cached: boolean;
  };
}
