/**
 * OrbitSwap Pro - Wallet Context
 *
 * React context for wallet state management across the application.
 */

import { createContext, useContext } from "react";
import type { WalletInfo, WalletBalance, WalletProviderType } from "../types";

export interface WalletContextType {
  wallet: WalletInfo | null;
  balances: WalletBalance[];
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (providerId?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  supportedWallets: { id: string; name: string; icon: string }[];
}

export const WalletContext = createContext<WalletContextType | null>(null);

/**
 * Hook to access wallet context.
 * Must be used within a WalletProvider.
 */
export function useWalletContext(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
}
