import type { SupportedChain } from './api-types';
import {
  ACTIVE_CHAINS,
  ALL_SUPPORTED_CHAINS,
  NETWORK_REGISTRY,
  getNetworkConfig,
  isEvmChain,
  isSupportedChain,
  isValidHashForChain,
} from './network-registry';

export const SUPPORTED_CHAINS: { id: SupportedChain; name: string; symbol: string }[] =
  ALL_SUPPORTED_CHAINS.map((id) => ({
    id,
    name: NETWORK_REGISTRY[id].name,
    symbol: NETWORK_REGISTRY[id].nativeSymbol,
  }));

/**
 * Checks if string is a valid transaction hash for the given chain (defaults to ethereum/EVM).
 */
export function isValidTransactionHash(hash: string, chain = 'ethereum'): boolean {
  return isValidHashForChain(chain, hash);
}

/**
 * Checks if string is a supported chain.
 */
export function isValidChain(chain: string): chain is SupportedChain {
  return isSupportedChain(chain);
}

/**
 * Validates input parameters before initiating an API request.
 */
export function validateLookupInput(
  chain: string,
  transactionHash: string,
): { isValid: boolean; error?: string } {
  const trimmedChain = chain.trim();
  const trimmedHash = transactionHash.trim();

  if (!trimmedChain) {
    return { isValid: false, error: 'Please select a blockchain network.' };
  }

  if (!isSupportedChain(trimmedChain)) {
    return {
      isValid: false,
      error: `Unsupported chain selected. Supported networks: ${ACTIVE_CHAINS.map((c) => NETWORK_REGISTRY[c].name).join(', ')}.`,
    };
  }

  const config = getNetworkConfig(trimmedChain);

  if (!trimmedHash) {
    return { isValid: false, error: 'Transaction hash is required.' };
  }

  if (isEvmChain(trimmedChain)) {
    if (!trimmedHash.startsWith('0x')) {
      return {
        isValid: false,
        error: 'Transaction hash must start with "0x".',
      };
    }

    if (trimmedHash.length !== 66) {
      return {
        isValid: false,
        error: `Transaction hash length is ${trimmedHash.length} chars. Must be exactly 66 characters (0x + 64 hex characters).`,
      };
    }

    if (!isValidHashForChain(trimmedChain, trimmedHash)) {
      return {
        isValid: false,
        error: 'Transaction hash contains non-hexadecimal characters.',
      };
    }
  } else {
    // UTXO family (bitcoin, litecoin, dogecoin, bitcoin-cash, dash)
    if (trimmedHash.startsWith('0x') || trimmedHash.startsWith('0X')) {
      return {
        isValid: false,
        error: `Transaction ID for ${config.name} must not start with "0x". Enter 64 hexadecimal characters.`,
      };
    }

    if (trimmedHash.length !== 64) {
      return {
        isValid: false,
        error: `Transaction ID length is ${trimmedHash.length} chars. Must be exactly 64 hexadecimal characters for ${config.name}.`,
      };
    }

    if (!isValidHashForChain(trimmedChain, trimmedHash)) {
      return {
        isValid: false,
        error: `Transaction ID for ${config.name} contains non-hexadecimal characters.`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Truncates an EVM address or transaction hash for readable display.
 * Example: 0x1234567890abcdef...1234
 */
export function truncateHashOrAddress(value: string, start = 8, end = 6): string {
  if (!value) return '';
  if (value.length <= start + end) return value;
  return `${value.slice(0, start)}...${value.slice(-end)}`;
}

/**
 * Formats an ISO 8601 timestamp into a clean, localized string with relative time.
 */
export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toUTCString();
  } catch {
    return isoString;
  }
}

/**
 * Safely copies text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to legacy method
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}

export interface FormattedAmountResult {
  display: string;
  exact: string;
  isApproximate: boolean;
}

/**
 * Formats token or coin amounts for human readability without loss of precision.
 * - Genuine zeroes display as '0'.
 * - Very small positive values below the threshold display as '< 0.000001'.
 * - Rounded values are prepended with '≈ '.
 * - Exact precision is always retained in the returned 'exact' property.
 */
export function formatReadableAmount(
  amount: string | number | null | undefined,
  maxDecimals = 6,
): FormattedAmountResult {
  if (amount === null || amount === undefined || amount === '') {
    return { display: '0', exact: '0', isApproximate: false };
  }

  const str = String(amount).trim();
  // Genuine zero check: '0', '0.0', '0.000000', etc.
  if (/^0+(\.0+)?$/.test(str) || str === '') {
    return { display: '0', exact: '0', isApproximate: false };
  }

  const parts = str.split('.');
  if (parts.length === 1) {
    return { display: str, exact: str, isApproximate: false };
  }

  const [intPart, fracPart] = parts;
  if (!fracPart) {
    return { display: intPart, exact: str, isApproximate: false };
  }

  const minThresholdDisplay = `0.${'0'.repeat(maxDecimals - 1)}1`;
  const sliced = fracPart.slice(0, maxDecimals).replace(/0+$/, '');

  // If integer part is 0 and the first maxDecimals are all zero, but fracPart is non-zero
  if (intPart === '0' && sliced === '') {
    return {
      display: `< ${minThresholdDisplay}`,
      exact: str,
      isApproximate: true,
    };
  }

  if (fracPart.length <= maxDecimals) {
    return { display: str, exact: str, isApproximate: false };
  }

  const displayVal = sliced ? `${intPart}.${sliced}` : intPart;
  return {
    display: `≈ ${displayVal}`,
    exact: str,
    isApproximate: true,
  };
}

/**
 * Converts a raw BigInt amount and decimals into an exact decimal string.
 * Uses integer math with BigInt to avoid IEEE 754 floating-point errors.
 */
export function formatUnitsToExactDecimal(raw: bigint, decimals: number): string {
  if (decimals <= 0) return raw.toString();
  const isNegative = raw < 0n;
  const absRaw = isNegative ? -raw : raw;
  const divisor = 10n ** BigInt(decimals);
  const intPart = absRaw / divisor;
  const rem = absRaw % divisor;
  if (rem === 0n) {
    return (isNegative ? '-' : '') + intPart.toString();
  }
  const remStr = rem.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${isNegative ? '-' : ''}${intPart.toString()}.${remStr}`;
}
