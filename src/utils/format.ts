/**
 * OrbitSwap Pro - Formatting Utilities
 *
 * Consistent formatting for numbers, currencies, addresses, and timestamps.
 */

import { NATIVE_ASSET, ASSET_DECIMALS } from "../constants";

/**
 * Format a number with locale formatting and significant decimal places.
 * Does not add unnecessary trailing zeros.
 */
export function formatNumber(
  value: string | number,
  decimals: number = 7,
): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";

  if (num === 0) return "0";
  if (Math.abs(num) < 0.000001) return "<0.000001";

  // Format with maximum precision, then trim trailing zeros
  const fixed = num.toFixed(decimals);
  // Trim trailing zeros after decimal point
  const trimmed = fixed.replace(/\.?0+$/, "");

  // Add thousands separators
  const parts = trimmed.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return parts.join(".");
}

/**
 * Format a currency value with USD prefix.
 */
export function formatUsd(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$0.00";

  if (num >= 1) {
    return num.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (num === 0) return "$0.00";

  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  });
}

/**
 * Format percentage value.
 */
export function formatPercentage(
  value: string | number,
  decimals: number = 2,
): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0%";

  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(decimals)}%`;
}

/**
 * Format a Stellar address for display (truncated).
 */
export function formatAddress(
  address: string,
  chars: number = 4,
): string {
  if (!address || address.length < chars * 2 + 3) return address || "";
  return `${address.slice(0, chars + 1)}...${address.slice(-chars)}`;
}

/**
 * Format a transaction hash for display.
 */
export function formatTxHash(
  hash: string,
  chars: number = 6,
): string {
  if (!hash || hash.length < chars * 2 + 3) return hash || "";
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

/**
 * Format a token amount with the asset code.
 */
export function formatTokenAmount(
  amount: string,
  assetCode: string,
  decimals?: number,
): string {
  const dec = decimals ?? ASSET_DECIMALS[assetCode] ?? 7;
  return `${formatNumber(amount, dec)} ${assetCode}`;
}

/**
 * Format asset code with issuer short form.
 */
export function formatAsset(code: string, issuer?: string): string {
  if (!issuer || code === NATIVE_ASSET) return code;
  return `${code}:${formatAddress(issuer, 3)}`;
}

/**
 * Format a timestamp to a relative time string.
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a timestamp to a full date string.
 */
export function formatFullDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Format a price impact percentage with color indicator.
 */
export function formatPriceImpact(value: number): {
  text: string;
  color: "green" | "yellow" | "red";
} {
  const text = `${value.toFixed(2)}%`;
  if (value < 1) return { text, color: "green" };
  if (value < 3) return { text, color: "yellow" };
  return { text, color: "red" };
}

/**
 * Format exchange rate in a human-readable way.
 */
export function formatExchangeRate(
  rate: string,
  baseCode: string,
  quoteCode: string,
): string {
  const num = parseFloat(rate);
  if (isNaN(num)) return "-";
  return `1 ${baseCode} ≈ ${formatNumber(rate)} ${quoteCode}`;
}

/**
 * Format bigint value to human-readable string with decimals.
 */
export function formatBigInt(
  value: bigint,
  decimals: number = 7,
): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  const fractionStr = fraction.toString().padStart(decimals, "0");
  return `${whole.toString()}.${fractionStr}`;
}

/**
 * Parse a human-readable amount to bigint with specified decimals.
 */
export function parseBigInt(
  value: string,
  decimals: number = 7,
): bigint {
  const parts = value.split(".");
  const whole = parts[0] || "0";
  const fraction = (parts[1] || "").padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole) * BigInt(10) ** BigInt(decimals) + BigInt(fraction || "0");
}

/**
 * Format a number with compact notation (e.g., 1.5M, 2.3B).
 */
export function formatCompactNumber(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }

  return num.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}
