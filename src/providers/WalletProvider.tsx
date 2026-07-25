/**
 * OrbitSwap Pro - Wallet Provider
 *
 * Provider component that wraps the application with wallet context.
 */

import { type ReactNode, useMemo } from "react";
import { WalletContext, type WalletContextType } from "../contexts/WalletContext";
import { useWallet } from "../hooks/useWallet";

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * Provider for wallet state management.
 * Provides wallet connection, disconnection, and balance management.
 */
export function WalletProvider({ children }: WalletProviderProps) {
  const walletState = useWallet();

  const value: WalletContextType = useMemo(
    () => ({
      wallet: walletState.wallet,
      balances: walletState.balances,
      isConnected: walletState.isConnected,
      isConnecting: walletState.isConnecting,
      error: walletState.error,
      connect: walletState.connect,
      disconnect: walletState.disconnect,
      refreshBalances: walletState.refreshBalances,
      supportedWallets: walletState.supportedWallets,
    }),
    [
      walletState.wallet,
      walletState.balances,
      walletState.isConnected,
      walletState.isConnecting,
      walletState.error,
      walletState.connect,
      walletState.disconnect,
      walletState.refreshBalances,
      walletState.supportedWallets,
    ],
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
