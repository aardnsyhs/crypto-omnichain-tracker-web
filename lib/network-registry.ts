export type NetworkFamily = 'evm' | 'utxo';

export type ActiveChain =
  | 'ethereum'
  | 'bitcoin'
  | 'litecoin'
  | 'dogecoin'
  | 'bitcoin-cash'
  | 'dash';

export type LegacyChain = 'bsc' | 'polygon';

export type SupportedChain = ActiveChain | LegacyChain;

export interface NetworkConfig {
  id: SupportedChain;
  name: string;
  nativeSymbol: string;
  family: NetworkFamily;
  blockchairSlug: string | null;
  decimals: number;
  hashPattern: RegExp;
  hashPlaceholder: string;
  explorerTxUrlTemplate: string;
  feeType: 'gas_price' | 'fee_rate';
  feeUnit: 'Gwei' | 'sat/byte';
  isActive: boolean;
  capabilities: {
    overview: boolean;
    lookup: boolean;
  };
  visuals: {
    badgeClass: string;
    dotClass: string;
    iconClass: string;
    activeCardClass: string;
    tickerClass: string;
  };
}

export const ACTIVE_CHAINS: readonly ActiveChain[] = [
  'ethereum',
  'bitcoin',
  'litecoin',
  'dogecoin',
  'bitcoin-cash',
  'dash',
] as const;

export const LEGACY_CHAINS: readonly LegacyChain[] = ['bsc', 'polygon'] as const;

export const ALL_SUPPORTED_CHAINS: readonly SupportedChain[] = [
  ...ACTIVE_CHAINS,
  ...LEGACY_CHAINS,
] as const;

export const NETWORK_REGISTRY: Record<SupportedChain, NetworkConfig> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    nativeSymbol: 'ETH',
    family: 'evm',
    blockchairSlug: 'ethereum',
    decimals: 18,
    hashPattern: /^0x[0-9a-fA-F]{64}$/,
    hashPlaceholder: '0x followed by 64 hexadecimal characters',
    explorerTxUrlTemplate: 'https://blockchair.com/ethereum/transaction/{hash}',
    feeType: 'gas_price',
    feeUnit: 'Gwei',
    isActive: true,
    capabilities: {
      overview: true,
      lookup: true,
    },
    visuals: {
      badgeClass: 'border-sky-500/40 bg-sky-950/30 text-sky-200',
      dotClass: 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]',
      iconClass: 'text-sky-400',
      activeCardClass:
        'border-sky-500/50 bg-sky-950/30 text-sky-100 shadow-[0_0_15px_rgba(56,189,248,0.12)] ring-1 ring-sky-500/30',
      tickerClass: 'border-sky-500/30 bg-sky-950/40 text-sky-300',
    },
  },
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin',
    nativeSymbol: 'BTC',
    family: 'utxo',
    blockchairSlug: 'bitcoin',
    decimals: 8,
    hashPattern: /^[0-9a-fA-F]{64}$/,
    hashPlaceholder: '64 hexadecimal characters (txid)',
    explorerTxUrlTemplate: 'https://blockchair.com/bitcoin/transaction/{hash}',
    feeType: 'fee_rate',
    feeUnit: 'sat/byte',
    isActive: true,
    capabilities: {
      overview: true,
      lookup: true,
    },
    visuals: {
      badgeClass: 'border-amber-500/40 bg-amber-950/30 text-amber-200',
      dotClass: 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.7)]',
      iconClass: 'text-amber-400',
      activeCardClass:
        'border-amber-500/50 bg-amber-950/30 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.12)] ring-1 ring-amber-500/30',
      tickerClass: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
    },
  },
  litecoin: {
    id: 'litecoin',
    name: 'Litecoin',
    nativeSymbol: 'LTC',
    family: 'utxo',
    blockchairSlug: 'litecoin',
    decimals: 8,
    hashPattern: /^[0-9a-fA-F]{64}$/,
    hashPlaceholder: '64 hexadecimal characters (txid)',
    explorerTxUrlTemplate: 'https://blockchair.com/litecoin/transaction/{hash}',
    feeType: 'fee_rate',
    feeUnit: 'sat/byte',
    isActive: true,
    capabilities: {
      overview: true,
      lookup: true,
    },
    visuals: {
      badgeClass: 'border-blue-500/40 bg-blue-950/30 text-blue-200',
      dotClass: 'bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.7)]',
      iconClass: 'text-blue-400',
      activeCardClass:
        'border-blue-500/50 bg-blue-950/30 text-blue-100 shadow-[0_0_15px_rgba(96,165,250,0.12)] ring-1 ring-blue-500/30',
      tickerClass: 'border-blue-500/30 bg-blue-950/40 text-blue-300',
    },
  },
  dogecoin: {
    id: 'dogecoin',
    name: 'Dogecoin',
    nativeSymbol: 'DOGE',
    family: 'utxo',
    blockchairSlug: 'dogecoin',
    decimals: 8,
    hashPattern: /^[0-9a-fA-F]{64}$/,
    hashPlaceholder: '64 hexadecimal characters (txid)',
    explorerTxUrlTemplate: 'https://blockchair.com/dogecoin/transaction/{hash}',
    feeType: 'fee_rate',
    feeUnit: 'sat/byte',
    isActive: true,
    capabilities: {
      overview: true,
      lookup: true,
    },
    visuals: {
      badgeClass: 'border-yellow-500/40 bg-yellow-950/30 text-yellow-200',
      dotClass: 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.7)]',
      iconClass: 'text-yellow-400',
      activeCardClass:
        'border-yellow-500/50 bg-yellow-950/30 text-yellow-100 shadow-[0_0_15px_rgba(250,204,21,0.12)] ring-1 ring-yellow-500/30',
      tickerClass: 'border-yellow-500/30 bg-yellow-950/40 text-yellow-300',
    },
  },
  'bitcoin-cash': {
    id: 'bitcoin-cash',
    name: 'Bitcoin Cash',
    nativeSymbol: 'BCH',
    family: 'utxo',
    blockchairSlug: 'bitcoin-cash',
    decimals: 8,
    hashPattern: /^[0-9a-fA-F]{64}$/,
    hashPlaceholder: '64 hexadecimal characters (txid)',
    explorerTxUrlTemplate: 'https://blockchair.com/bitcoin-cash/transaction/{hash}',
    feeType: 'fee_rate',
    feeUnit: 'sat/byte',
    isActive: true,
    capabilities: {
      overview: true,
      lookup: true,
    },
    visuals: {
      badgeClass: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200',
      dotClass: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]',
      iconClass: 'text-emerald-400',
      activeCardClass:
        'border-emerald-500/50 bg-emerald-950/30 text-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.12)] ring-1 ring-emerald-500/30',
      tickerClass: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300',
    },
  },
  dash: {
    id: 'dash',
    name: 'Dash',
    nativeSymbol: 'DASH',
    family: 'utxo',
    blockchairSlug: 'dash',
    decimals: 8,
    hashPattern: /^[0-9a-fA-F]{64}$/,
    hashPlaceholder: '64 hexadecimal characters (txid)',
    explorerTxUrlTemplate: 'https://blockchair.com/dash/transaction/{hash}',
    feeType: 'fee_rate',
    feeUnit: 'sat/byte',
    isActive: true,
    capabilities: {
      overview: true,
      lookup: true,
    },
    visuals: {
      badgeClass: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-200',
      dotClass: 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]',
      iconClass: 'text-cyan-400',
      activeCardClass:
        'border-cyan-500/50 bg-cyan-950/30 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.12)] ring-1 ring-cyan-500/30',
      tickerClass: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300',
    },
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Smart Chain',
    nativeSymbol: 'BNB',
    family: 'evm',
    blockchairSlug: null,
    decimals: 18,
    hashPattern: /^0x[0-9a-fA-F]{64}$/,
    hashPlaceholder: '0x followed by 64 hexadecimal characters',
    explorerTxUrlTemplate: 'https://bscscan.com/tx/{hash}',
    feeType: 'gas_price',
    feeUnit: 'Gwei',
    isActive: false,
    capabilities: {
      overview: false,
      lookup: true,
    },
    visuals: {
      badgeClass: 'border-amber-500/40 bg-amber-950/30 text-amber-200',
      dotClass: 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.7)]',
      iconClass: 'text-amber-400',
      activeCardClass:
        'border-amber-500/50 bg-amber-950/30 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.12)] ring-1 ring-amber-500/30',
      tickerClass: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
    },
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon PoS',
    nativeSymbol: 'POL',
    family: 'evm',
    blockchairSlug: null,
    decimals: 18,
    hashPattern: /^0x[0-9a-fA-F]{64}$/,
    hashPlaceholder: '0x followed by 64 hexadecimal characters',
    explorerTxUrlTemplate: 'https://polygonscan.com/tx/{hash}',
    feeType: 'gas_price',
    feeUnit: 'Gwei',
    isActive: false,
    capabilities: {
      overview: false,
      lookup: true,
    },
    visuals: {
      badgeClass: 'border-violet-500/40 bg-violet-950/30 text-violet-200',
      dotClass: 'bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.7)]',
      iconClass: 'text-violet-400',
      activeCardClass:
        'border-violet-500/50 bg-violet-950/30 text-violet-100 shadow-[0_0_15px_rgba(167,139,250,0.12)] ring-1 ring-violet-500/30',
      tickerClass: 'border-violet-500/30 bg-violet-950/40 text-violet-300',
    },
  },
};

export const ACTIVE_NETWORK_LIST: NetworkConfig[] = ACTIVE_CHAINS.map(
  (id) => NETWORK_REGISTRY[id],
);

export function isSupportedChain(chain: string): chain is SupportedChain {
  return chain.toLowerCase() in NETWORK_REGISTRY;
}

export function isActiveChain(chain: string): chain is ActiveChain {
  const norm = chain.toLowerCase();
  return ACTIVE_CHAINS.includes(norm as ActiveChain);
}

export function getNetworkConfig(chain: string): NetworkConfig {
  const config = NETWORK_REGISTRY[chain.toLowerCase() as SupportedChain];
  if (!config) {
    throw new Error(`Unsupported chain: ${chain}`);
  }
  return config;
}

export function isUtxoChain(chain: string): boolean {
  if (!isSupportedChain(chain)) return false;
  return getNetworkConfig(chain).family === 'utxo';
}

export function isEvmChain(chain: string): boolean {
  if (!isSupportedChain(chain)) return false;
  return getNetworkConfig(chain).family === 'evm';
}

export function isValidHashForChain(chain: string, hash: string): boolean {
  if (!isSupportedChain(chain)) return false;
  const config = getNetworkConfig(chain);
  return config.hashPattern.test(hash.trim());
}

export function getExplorerUrlForChain(chain: string, hash: string): string {
  if (!isSupportedChain(chain)) {
    return `https://blockchair.com/search?q=${hash}`;
  }
  const config = getNetworkConfig(chain);
  return config.explorerTxUrlTemplate.replace('{hash}', hash);
}
