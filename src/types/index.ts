/**
 * OrbitSwap Pro - Shared Type Definitions
 *
 * All shared types used across the application.
 */

// ─── Wallet Types ───────────────────────────────────────────────────────────

export type WalletProviderType = "freighter" | "xbull" | "albedo" | "rabet";

export interface WalletInfo {
  address: string;
  publicKey: string;
  provider: WalletProviderType | null;
  network: string;
  isConnected: boolean;
}

export interface WalletBalance {
  asset: AssetDescriptor;
  balance: string;
  balanceInXlm: number;
  usdValue?: number;
}

export interface WalletState {
  info: WalletInfo;
  balances: WalletBalance[];
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
}

// ─── Asset Types ────────────────────────────────────────────────────────────

export interface AssetDescriptor {
  code: string;
  issuer: string;
  decimals: number;
  name?: string;
  icon?: string;
  domain?: string;
}

// ─── Contract Types ─────────────────────────────────────────────────────────

export interface ContractAddress {
  contractId: string;
  network: string;
  deployedAt?: string;
  deployTxHash?: string;
}

export type ContractName =
  | "router"
  | "liquidityPool"
  | "feeVault"
  | "treasury"
  | "swapRegistry"
  | "event";

export interface ContractDeployment {
  name: ContractName;
  address: ContractAddress;
  status: "pending" | "deployed" | "failed";
  error?: string;
}

// ─── Swap Types ─────────────────────────────────────────────────────────────

export type SwapDirection = "exactInput" | "exactOutput";

export type SwapStatus =
  | "idle"
  | "preparing"
  | "awaitingApproval"
  | "signing"
  | "submitting"
  | "pending"
  | "confirmed"
  | "failed"
  | "rejected"
  | "timeout";

export interface SwapQuote {
  inputAsset: AssetDescriptor;
  outputAsset: AssetDescriptor;
  inputAmount: string;
  expectedOutput: string;
  minimumOutput: string;
  exchangeRate: string;
  priceImpact: number;
  fee: string;
  feeBps: number;
  route: string[];
  deadline: number;
  quoteTimestamp: number;
}

export interface SwapRequest {
  inputAsset: AssetDescriptor;
  outputAsset: AssetDescriptor;
  inputAmount: string;
  minOutputAmount: string;
  recipient: string;
  deadline: number;
  referrer?: string;
}

export interface SwapTransaction {
  id: string;
  request: SwapRequest;
  quote: SwapQuote;
  status: SwapStatus;
  txHash?: string;
  blockNumber?: number;
  timestamp: number;
  completedAt?: number;
  error?: string;
  explorerUrl?: string;
}

export interface SwapHistoryItem {
  txHash: string;
  inputAsset: AssetDescriptor;
  outputAsset: AssetDescriptor;
  inputAmount: string;
  outputAmount: string;
  timestamp: number;
  status: "confirmed" | "failed";
  explorerUrl: string;
}

// ─── Transaction Types ──────────────────────────────────────────────────────

export interface TransactionLifecycle {
  id: string;
  operation: string;
  status: TxStatus;
  txHash?: string;
  timestamp: number;
  updatedAt: number;
  details: Record<string, string>;
  error?: string;
  explorerUrl?: string;
}

export type TxStatus =
  | "preparing"
  | "awaitingApproval"
  | "signing"
  | "submitting"
  | "pending"
  | "confirmed"
  | "failed"
  | "rejected"
  | "timeout";

// ─── Event Types ────────────────────────────────────────────────────────────

export interface BlockchainEvent {
  id: string;
  type: EventType;
  contract: ContractName;
  data: Record<string, unknown>;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  processed: boolean;
}

export type EventType =
  | "swap_executed"
  | "liquidity_added"
  | "liquidity_removed"
  | "fee_collected"
  | "treasury_deposited"
  | "price_updated"
  | "pool_created"
  | "contract_deployed";

// ─── Market Types ────────────────────────────────────────────────────────────

export interface MarketInfo {
  pair: string;
  baseAsset: AssetDescriptor;
  quoteAsset: AssetDescriptor;
  price: string;
  priceChange24h: number;
  volume24h: string;
  tvl: string;
  fees24h: string;
  totalSwaps: number;
  liquidity: string;
}

export interface AssetMarketData {
  asset: AssetDescriptor;
  price: string;
  marketCap: string;
  volume24h: string;
  change24h: number;
  liquidity: string;
}

// ─── Notification Types ─────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
  action?: NotificationAction;
  timestamp: number;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

// ─── Utility Types ──────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
  contractError?: string;
}

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

// ─── Soroban Contract Result Types ──────────────────────────────────────────

export interface ContractSwapResult {
  success: boolean;
  outputAmount: string;
  fee: string;
  txHash: string;
}

export interface ContractLiquidityResult {
  success: boolean;
  lpTokens: string;
  txHash: string;
}

export interface ContractError {
  code: number;
  message: string;
}

// ─── Configuration Types ────────────────────────────────────────────────────

export interface SlippageConfig {
  auto: boolean;
  value: number;
}

export interface SwapFormState {
  inputAsset: AssetDescriptor | null;
  outputAsset: AssetDescriptor | null;
  inputAmount: string;
  outputAmount: string;
  slippage: SlippageConfig;
  deadline: number;
  recipient: string;
}
