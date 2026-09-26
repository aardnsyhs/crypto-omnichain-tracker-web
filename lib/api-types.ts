import type {
  ActiveChain,
  LegacyChain,
  NetworkFamily,
  SupportedChain,
} from './network-registry';

export type { ActiveChain, LegacyChain, NetworkFamily, SupportedChain };

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

export interface NormalizedUtxoInput {
  index: number;
  transactionHash: string | null;
  outputIndex: number | null;
  value: {
    raw: string;
    formatted: string;
    symbol: string;
  };
  address: string | null;
  type: string | null;
  isCoinbase: boolean;
  scriptHex?: string | null;
}

export interface NormalizedUtxoOutput {
  index: number;
  value: {
    raw: string;
    formatted: string;
    symbol: string;
  };
  address: string | null;
  type: string | null;
  isSpent: boolean | null;
  scriptHex?: string | null;
}

export interface UtxoTransactionDetails {
  version?: number;
  size: number;
  weight?: number;
  vsize?: number;
  isCoinbase: boolean;
  confirmations: number;
  inputCount: number;
  outputCount: number;
  inputTotal: {
    raw: string;
    formatted: string;
    symbol: string;
  };
  outputTotal: {
    raw: string;
    formatted: string;
    symbol: string;
  };
  feePerByte?: string | null;
  referenceBlockHeight?: number | null;
  inputsTruncated: boolean;
  outputsTruncated: boolean;
  inputs: NormalizedUtxoInput[];
  outputs: NormalizedUtxoOutput[];
}

export interface TransactionData {
  transactionHash: string;
  chain: SupportedChain;
  family: NetworkFamily;
  status: TransactionStatus;
  fee: TokenValue;
  blockNumber: string;
  timestamp: string | null;
  explorerUrl: string;
  fetchedAt: string;
  explanation: string;

  // EVM-specific fields (present when family === 'evm')
  from?: string;
  to?: string | null;
  value?: TokenValue;
  coverage?: StoryCoverage;
  coverageReasons?: CoverageReason[];
  actions?: ActionItem[];
  tokenTransfers?: TokenTransferItem[];
  approvals?: TokenApprovalItem[];
  technical?: {
    gasUsed?: string | null;
    inputData?: string | null;
  };

  // UTXO-specific fields (present when family === 'utxo')
  utxo?: UtxoTransactionDetails;
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
  suggestedGasPriceWei?: string | null;
  suggestedGasPriceGwei?: string | null;
  suggestedFeeRate: string | null;
  feeUnit: string;
  source: string;
  updatedAt: string | null;
  isStale: boolean;
  status: NetworkDataStatus;
  reason?: string | null;
  gasNote?: string | null;
  feeRateNote?: string | null;
}

export interface NetworkOverviewItem {
  chain: SupportedChain;
  name: string;
  nativeSymbol: string;
  family: NetworkFamily;
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
