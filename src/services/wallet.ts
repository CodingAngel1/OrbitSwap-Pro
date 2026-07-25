/**
 * OrbitSwap Pro - Wallet Service
 *
 * Service for managing Stellar wallet connections and interactions.
 */

import { config } from "../config";
import type { WalletInfo, WalletBalance } from "../types";
import { STORAGE_KEYS } from "../constants";
import { getAccountBalances } from "./stellar";

// ─── Provider Management ────────────────────────────────────────────────────

/**
 * Get the stored wallet provider ID from local storage.
 */
function getStoredProvider(): string | undefined {
  try {
    return localStorage.getItem(STORAGE_KEYS.WALLET_PROVIDER) || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Store the selected wallet provider ID.
 */
function storeProvider(providerId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WALLET_PROVIDER, providerId);
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Clear stored wallet provider.
 */
function clearStoredProvider(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.WALLET_PROVIDER);
  } catch {
    // Silently fail
  }
}

/**
 * Get the list of supported wallet IDs.
 */
export function getSupportedWallets(): Array<{ id: string; name: string; icon: string }> {
  return [
    { id: "freighter", name: "Freighter", icon: "🔑" },
    { id: "xbull", name: "xBull", icon: "🐂" },
    { id: "albedo", name: "Albedo", icon: "✨" },
    { id: "rabet", name: "Rabet", icon: "🔵" },
  ];
}

// ─── Connection Operations ──────────────────────────────────────────────────

/**
 * Connect to a wallet provider.
 */
export async function connectWallet(
  providerId?: string,
): Promise<WalletInfo> {
  try {
    const targetProvider = providerId || getStoredProvider();
    if (targetProvider) {
      storeProvider(targetProvider);
    }

    // Try to detect Freighter wallet
    const address = await detectFreighterAddress();

    if (!address) {
      throw new Error(
        "No wallet detected. Please install Freighter or another Stellar wallet extension.",
      );
    }

    const walletInfo: WalletInfo = {
      address,
      publicKey: address,
      provider: (providerId as any) || "freighter",
      network: config.network.passphrase,
      isConnected: true,
    };

    return walletInfo;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("rejected") ||
        error.message.includes("denied")
      ) {
        throw new Error("Wallet connection was rejected by the user.");
      }
      throw error;
    }
    throw new Error("Failed to connect wallet. Please try again.");
  }
}

/**
 * Disconnect the wallet.
 */
export async function disconnectWallet(): Promise<void> {
  clearStoredProvider();
}

/**
 * Check if a wallet is connected.
 */
export async function isWalletConnected(): Promise<boolean> {
  try {
    const address = await detectFreighterAddress();
    return !!address;
  } catch {
    return false;
  }
}

// ─── Signing Operations ─────────────────────────────────────────────────────

/**
 * Sign a transaction XDR with the connected wallet.
 * Uses Freighter's web API as the primary signing mechanism.
 */
export async function signTransaction(txXdr: string): Promise<string> {
  try {
    // Try Freighter (most common Stellar wallet)
    const freighter = window.freighter;
    if (freighter?.signTransaction) {
      const { signedTxXdr } = await freighter.signTransaction(txXdr, {
        networkPassphrase: config.network.passphrase,
      });
      return signedTxXdr;
    }

    throw new Error("No wallet available for signing. Please install Freighter.");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("rejected")) {
        throw new Error("Transaction signing was rejected by the user.");
      }
      throw error;
    }
    throw new Error("Failed to sign transaction.");
  }
}

// ─── Balance Operations ─────────────────────────────────────────────────────

/**
 * Fetch wallet balances using the Stellar service.
 */
export async function fetchWalletBalances(
  address: string,
): Promise<WalletBalance[]> {
  return getAccountBalances(address);
}

// ─── Helper Functions ───────────────────────────────────────────────────────

/**
 * Detect Freighter wallet address (injected by Freighter extension).
 */
async function detectFreighterAddress(): Promise<string | null> {
  try {
    if (typeof window !== "undefined") {
      const freighter = window.freighter;
      if (freighter?.getAddress) {
        const { address } = await freighter.getAddress({
          networkPassphrase: config.network.passphrase,
        });
        return address || null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get the display name for a wallet provider.
 */
export function getProviderDisplayName(providerId: string): string {
  const names: Record<string, string> = {
    freighter: "Freighter",
    xbull: "xBull",
    albedo: "Albedo",
    rabet: "Rabet",
  };
  return names[providerId] || "Unknown Wallet";
}
