/**
 * OrbitSwap Pro - useWallet Hook
 *
 * Hook for wallet connection and management.
 * Provides wallet state, connection/disconnection, and balance management.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { WalletInfo, WalletBalance, WalletProviderType } from "../types";
import { connectWallet, disconnectWallet, fetchWalletBalances, getSupportedWallets } from "../services/wallet";
import { config } from "../config";

interface UseWalletReturn {
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

/**
 * Hook for managing Stellar wallet connections.
 */
export function useWallet(): UseWalletReturn {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const isConnected = !!wallet?.isConnected;

  /**
   * Get supported wallets.
   * Memoized to avoid re-computation on every render.
   */
  const supportedWalletsValue = useMemo(() => {
    try {
      const wallets = getSupportedWallets();
      return wallets.map((w) => ({
        id: w.id,
        name: w.name || w.id,
        icon: w.icon || "",
      }));
    } catch {
      return [];
    }
  }, []);

  /**
   * Connect to a wallet provider.
   */
  const connect = useCallback(async (providerId?: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      const walletInfo = await connectWallet(providerId);
      if (isMountedRef.current) {
        setWallet(walletInfo);
        // Fetch initial balances
        await fetchBalances(walletInfo.address);
        // Start balance refresh interval
        startBalanceRefresh(walletInfo.address);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to connect wallet");
      }
    } finally {
      if (isMountedRef.current) {
        setIsConnecting(false);
      }
    }
  }, []);

  /**
   * Disconnect the wallet.
   */
  const disconnect = useCallback(async () => {
    try {
      await disconnectWallet();
      if (isMountedRef.current) {
        setWallet(null);
        setBalances([]);
        setError(null);
        stopBalanceRefresh();
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to disconnect");
      }
    }
  }, []);

  /**
   * Fetch wallet balances.
   */
  const fetchBalances = useCallback(async (address: string) => {
    try {
      const walletBalances = await fetchWalletBalances(address);
      if (isMountedRef.current) {
        setBalances(walletBalances);
      }
    } catch {
      // Silently fail balance refresh
    }
  }, []);

  /**
   * Refresh balances (public method).
   */
  const refreshBalances = useCallback(async () => {
    if (wallet?.address) {
      await fetchBalances(wallet.address);
    }
  }, [wallet?.address, fetchBalances]);

  /**
   * Start periodic balance refresh.
   */
  const startBalanceRefresh = useCallback((address: string) => {
    stopBalanceRefresh();
    refreshIntervalRef.current = setInterval(() => {
      fetchBalances(address);
    }, config.ui.balanceRefreshInterval);
  }, [fetchBalances]);

  /**
   * Stop periodic balance refresh.
   */
  const stopBalanceRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopBalanceRefresh();
    };
  }, [stopBalanceRefresh]);

  return {
    wallet,
    balances,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    refreshBalances,
    supportedWallets: supportedWalletsValue,
  };
}
