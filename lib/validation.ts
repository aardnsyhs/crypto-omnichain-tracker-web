import type { SupportedChain } from './api-types';

export const SUPPORTED_CHAINS: { id: SupportedChain; name: string; symbol: string }[] = [
  { id: 'ethereum', name: 'Ethereum Mainnet', symbol: 'ETH' },
  { id: 'bsc', name: 'BNB Smart Chain', symbol: 'BNB' },
  { id: 'polygon', name: 'Polygon PoS', symbol: 'POL' },
];

/**
 * Checks if string is a valid 0x-prefixed 64 hex character EVM transaction hash.
 */
export function isValidTransactionHash(hash: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(hash.trim());
}

/**
 * Checks if string is a supported EVM chain.
 */
export function isValidChain(chain: string): chain is SupportedChain {
  return SUPPORTED_CHAINS.some((c) => c.id === chain);
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

  if (!isValidChain(trimmedChain)) {
    return {
      isValid: false,
      error: 'Invalid chain selected. Must be Ethereum, BNB Smart Chain, or Polygon.',
    };
  }

  if (!trimmedHash) {
    return { isValid: false, error: 'Transaction hash is required.' };
  }

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

  if (!isValidTransactionHash(trimmedHash)) {
    return {
      isValid: false,
      error: 'Transaction hash contains non-hexadecimal characters.',
    };
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
