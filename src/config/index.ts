/**
 * OrbitSwap Pro - Main Configuration
 *
 * Central configuration module. Never hardcode contract addresses in UI components.
 * All environment-specific values are resolved here.
 */

import { Networks } from "@stellar/stellar-sdk";

export const config = {
  /** Application metadata */
  app: {
    name: "OrbitSwap Pro",
    tagline: "Production-grade decentralized trading powered by Stellar",
    description:
      "OrbitSwap Pro is a production-ready decentralized exchange built on the Stellar Network enabling secure token swaps, liquidity provision, and real-time market monitoring.",
    version: "1.0.0",
    url: import.meta.env.VITE_APP_URL || "https://orbitswap.pro",
  },

  /** Stellar network configuration */
  network: {
    /** Network passphrase - defaults to Testnet */
    passphrase:
      import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE ||
      Networks.TESTNET,
    /** Horizon RPC URL */
    horizonUrl:
      import.meta.env.VITE_STELLAR_HORIZON_URL ||
      "https://horizon-testnet.stellar.org",
    /** Soroban RPC URL */
    sorobanRpcUrl:
      import.meta.env.VITE_SOROBAN_RPC_URL ||
      "https://soroban-testnet.stellar.org",
    /** Whether we're on mainnet */
    isMainnet: false,
    /** Network name for display */
    name: "Stellar Testnet",
  },

  /** Deployed contract addresses - loaded from environment */
  contracts: {
    router: import.meta.env.VITE_CONTRACT_ROUTER || "",
    liquidityPool: import.meta.env.VITE_CONTRACT_LIQUIDITY_POOL || "",
    feeVault: import.meta.env.VITE_CONTRACT_FEE_VAULT || "",
    treasury: import.meta.env.VITE_CONTRACT_TREASURY || "",
    swapRegistry: import.meta.env.VITE_CONTRACT_SWAP_REGISTRY || "",
    event: import.meta.env.VITE_CONTRACT_EVENT || "",
  },

  /** Default assets */
  assets: {
    native: {
      code: "XLM",
      issuer: "",
      decimals: 7,
    },
    /** Default tokens shown in the asset selector */
    defaultTokens: [
      { code: "XLM", issuer: "", decimals: 7, name: "Lumens" },
    ],
  },

  /** Swap defaults */
  swap: {
    /** Maximum slippage tolerance percentage */
    defaultSlippage: 0.5,
    /** Default swap deadline in minutes */
    deadlineMinutes: 20,
    /** Minimum swap amount in native units */
    minSwapAmount: 0.00001,
    /** Maximum swap amount */
    maxSwapAmount: 1000000,
  },

  /** Fee configuration (basis points, 100 = 1%) */
  fees: {
    swapFee: 30, // 0.3%
    protocolFee: 5, // 0.05% to treasury
    liquidityProviderFee: 25, // 0.25% to LPs
  },

  /** Event streaming configuration */
  events: {
    /** Polling interval in milliseconds */
    pollingInterval: 5000,
    /** Maximum events to store */
    maxEvents: 100,
    /** Reconnect delay in milliseconds */
    reconnectDelay: 3000,
    /** Maximum reconnection attempts */
    maxReconnectAttempts: 5,
  },

  /** UI configuration */
  ui: {
    /** Animation duration in ms */
    animationDuration: 200,
    /** Toast duration in ms */
    toastDuration: 5000,
    /** Page size for pagination */
    pageSize: 20,
    /** Refresh interval for market data (ms) */
    marketRefreshInterval: 10000,
    /** Balance refresh interval (ms) */
    balanceRefreshInterval: 15000,
  },
};

/** Stellar account minimum balance (1 XLM base reserve) */
export const BASE_RESERVE = 1;

/** Maximum uint128 value for Soroban */
export const MAX_U128 = BigInt("340282366920938463463374607431768211455");

/** XLM precision */
export const XLM_DECIMALS = 7;

/** Default asset decimals for Soroban tokens */
export const DEFAULT_TOKEN_DECIMALS = 7;

export default config;
