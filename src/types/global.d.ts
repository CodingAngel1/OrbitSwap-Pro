/**
 * OrbitSwap Pro - Global Type Declarations
 *
 * Declares types for browser-injected wallet APIs (Freighter, etc.).
 */

interface FreighterSignTransactionOptions {
  networkPassphrase: string;
}

interface FreighterGetAddressOptions {
  networkPassphrase: string;
}

interface FreighterApi {
  getAddress(
    options?: FreighterGetAddressOptions,
  ): Promise<{ address: string }>;
  signTransaction(
    txXdr: string,
    options?: FreighterSignTransactionOptions,
  ): Promise<{ signedTxXdr: string }>;
  isConnected(): Promise<{ isConnected: boolean }>;
  signAuthEntry?(
    entryXdr: string,
  ): Promise<{ signedAuthEntry: string }>;
}

declare global {
  interface Window {
    freighter?: FreighterApi;
  }
}

export {};
