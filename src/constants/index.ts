/**
 * OrbitSwap Pro - Application Constants
 *
 * All application-wide constants. No hardcoded magic numbers in components.
 */

// ─── Network ────────────────────────────────────────────────────────────────

export const STELLAR_NETWORKS = {
  MAINNET: "Mainnet",
  TESTNET: "Testnet",
  FUTURENET: "Futurenet",
} as const;

export const NETWORK_PASSPHRASES = {
  MAINNET: "Public Global Stellar Network ; September 2015",
  TESTNET: "Test SDF Network ; September 2015",
  FUTURENET: "Test SDF Future Network ; October 2022",
} as const;

// ─── Asset ──────────────────────────────────────────────────────────────────

export const NATIVE_ASSET = "XLM";

export const ASSET_DECIMALS: Record<string, number> = {
  XLM: 7,
  USDC: 7,
  ETH: 7,
  BTC: 7,
};

// ─── Contract Errors ────────────────────────────────────────────────────────

export const CONTRACT_ERROR_CODES = {
  INSUFFICIENT_BALANCE: 1,
  INVALID_ASSET: 2,
  INVALID_AMOUNT: 3,
  SLIPPAGE_EXCEEDED: 4,
  DEADLINE_EXPIRED: 5,
  POOL_NOT_FOUND: 6,
  INSUFFICIENT_LIQUIDITY: 7,
  UNAUTHORIZED: 8,
  FEE_EXCEEDED: 9,
  ALREADY_INITIALIZED: 10,
  NOT_INITIALIZED: 11,
  ZERO_AMOUNT: 12,
  PAUSED: 13,
  INTERNAL_ERROR: 14,
} as const;

export const CONTRACT_ERROR_MESSAGES: Record<number, string> = {
  [CONTRACT_ERROR_CODES.INSUFFICIENT_BALANCE]:
    "Insufficient balance to complete this transaction.",
  [CONTRACT_ERROR_CODES.INVALID_ASSET]:
    "The specified asset is not supported.",
  [CONTRACT_ERROR_CODES.INVALID_AMOUNT]:
    "The specified amount is invalid.",
  [CONTRACT_ERROR_CODES.SLIPPAGE_EXCEEDED]:
    "Price movement exceeds your slippage tolerance.",
  [CONTRACT_ERROR_CODES.DEADLINE_EXPIRED]:
    "Transaction deadline has expired. Please try again.",
  [CONTRACT_ERROR_CODES.POOL_NOT_FOUND]:
    "Liquidity pool not found for this pair.",
  [CONTRACT_ERROR_CODES.INSUFFICIENT_LIQUIDITY]:
    "Insufficient liquidity in the pool.",
  [CONTRACT_ERROR_CODES.UNAUTHORIZED]:
    "You are not authorized to perform this action.",
  [CONTRACT_ERROR_CODES.FEE_EXCEEDED]:
    "Transaction fee exceeds maximum allowed.",
  [CONTRACT_ERROR_CODES.ALREADY_INITIALIZED]:
    "Contract is already initialized.",
  [CONTRACT_ERROR_CODES.NOT_INITIALIZED]:
    "Contract is not yet initialized.",
  [CONTRACT_ERROR_CODES.ZERO_AMOUNT]:
    "Amount must be greater than zero.",
  [CONTRACT_ERROR_CODES.PAUSED]:
    "Contract is currently paused.",
  [CONTRACT_ERROR_CODES.INTERNAL_ERROR]:
    "An internal error occurred. Please try again.",
};

// ─── UI ─────────────────────────────────────────────────────────────────────

export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  LAPTOP: 1024,
  DESKTOP: 1280,
} as const;

export const Z_INDEX = {
  DROPDOWN: 50,
  MODAL: 100,
  TOAST: 150,
  TOOLTIP: 200,
} as const;

// ─── Time ───────────────────────────────────────────────────────────────────

export const SECONDS_IN_MINUTE = 60;
export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;

// ─── Formatting ─────────────────────────────────────────────────────────────

export const NUMBER_FORMATS = {
  DECIMAL: "en-US",
  CURRENCY: "en-US",
  PERCENTAGE: "en-US",
} as const;

// ─── Routes ─────────────────────────────────────────────────────────────────

export const ROUTES = {
  HOME: "/",
  SWAP: "/swap",
  ASSETS: "/assets",
  HISTORY: "/history",
  POOL: "/pool",
} as const;

// ─── Storage Keys ───────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  WALLET_PROVIDER: "orbitswap_wallet_provider",
  SLIPPAGE: "orbitswap_slippage",
  DEADLINE: "orbitswap_deadline",
  RECIPIENT: "orbitswap_recipient",
} as const;
