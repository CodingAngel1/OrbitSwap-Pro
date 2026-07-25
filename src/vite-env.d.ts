/**
 * OrbitSwap Pro - Vite Environment Type Declarations
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_URL: string;
  readonly VITE_STELLAR_NETWORK_PASSPHRASE: string;
  readonly VITE_STELLAR_HORIZON_URL: string;
  readonly VITE_SOROBAN_RPC_URL: string;
  readonly VITE_CONTRACT_ROUTER: string;
  readonly VITE_CONTRACT_LIQUIDITY_POOL: string;
  readonly VITE_CONTRACT_FEE_VAULT: string;
  readonly VITE_CONTRACT_TREASURY: string;
  readonly VITE_CONTRACT_SWAP_REGISTRY: string;
  readonly VITE_CONTRACT_EVENT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
