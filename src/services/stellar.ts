/**
 * OrbitSwap Pro - Stellar Blockchain Service
 *
 * Core service for interacting with the Stellar network.
 * Handles Horizon and Soroban RPC communication.
 */

import {
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  BASE_FEE,
  Networks,
  Account,
  xdr,
  nativeToScVal,
  Contract,
  hash,
} from "@stellar/stellar-sdk";
import { config } from "../config";
import type { AssetDescriptor, WalletBalance } from "../types";
import { NATIVE_ASSET } from "../constants";

// ─── Singleton Instances ────────────────────────────────────────────────────

let horizonServer: Horizon.Server | null = null;

/**
 * Get or create Horizon server instance.
 */
export function getHorizonServer(): Horizon.Server {
  if (!horizonServer) {
    horizonServer = new Horizon.Server(config.network.horizonUrl, {
      allowHttp: config.network.horizonUrl.startsWith("http://"),
    });
  }
  return horizonServer;
}

/**
 * Reset server instances (useful for network switching).
 */
export function resetServers(): void {
  horizonServer = null;
}

// ─── Account Operations ─────────────────────────────────────────────────────

/**
 * Load account details from Horizon.
 */
export async function loadAccount(
  address: string,
): Promise<Record<string, any>> {
  const server = getHorizonServer();
  try {
    return await server.loadAccount(address);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      throw new Error(
        "Account not found on this network. Ensure the account is funded.",
      );
    }
    throw new Error(
      `Failed to load account: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Get account balances for a given address.
 */
export async function getAccountBalances(
  address: string,
): Promise<WalletBalance[]> {
  try {
    const account = await loadAccount(address);
    const balances: WalletBalance[] = [];

    for (const balance of account.balances || []) {
      const assetType = balance.asset_type || "native";
      const code =
        assetType === "native"
          ? "XLM"
          : balance.asset_code || "";
      const issuer =
        assetType === "native"
          ? ""
          : balance.asset_issuer || "";
      const balanceValue = balance.balance || "0";

      balances.push({
        asset: {
          code,
          issuer,
          decimals: code === "XLM" ? 7 : 7,
          name: code,
        },
        balance: balanceValue,
        balanceInXlm: parseFloat(balanceValue),
      });
    }

    return balances;
  } catch (error) {
    throw new Error(
      `Failed to fetch balances: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Check if an account exists on the network.
 */
export async function accountExists(address: string): Promise<boolean> {
  try {
    await loadAccount(address);
    return true;
  } catch {
    return false;
  }
}

// ─── Asset Operations ───────────────────────────────────────────────────────

/**
 * Create a Stellar Asset instance from descriptor.
 */
export function createAsset(asset: AssetDescriptor): Asset {
  if (asset.code === NATIVE_ASSET || !asset.issuer) {
    return Asset.native();
  }
  return new Asset(asset.code, asset.issuer);
}

/**
 * Resolve an asset to a human-readable string.
 */
export function assetToString(asset: AssetDescriptor): string {
  if (asset.code === NATIVE_ASSET || !asset.issuer) {
    return asset.code;
  }
  return `${asset.code}:${asset.issuer}`;
}

// ─── Soroban Contract Operations (simplified) ─────────────────────────────

/**
 * Build a Soroban contract instance.
 */
export function createContract(contractId: string): Contract {
  return new Contract(contractId);
}

/**
 * Simulate a Soroban contract call using Horizon.
 * In production, this would use Soroban RPC.
 */
export async function simulateContractCall(
  _contractId: string,
  _method: string,
  _args: xdr.ScVal[],
  _sourceAddress: string,
): Promise<any> {
  // Simplified simulation - in production this would call Soroban RPC
  return {
    result: {
      retval: xdr.ScVal.scvVoid(),
    },
  };
}

/**
 * Send a Soroban contract transaction.
 * In production, this would use Soroban RPC.
 */
export async function sendContractTransaction(
  _contractId: string,
  _method: string,
  _args: xdr.ScVal[],
  _sourceAddress: string,
  _signTransaction: (txXdr: string) => Promise<string>,
): Promise<{ hash: string; result: any }> {
  const simulatedHash = `sim_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
  return {
    hash: simulatedHash,
    result: { status: "PENDING" },
  };
}

/**
 * Get the status of a submitted transaction.
 * In production, this would use Soroban RPC.
 */
export async function getTransactionStatus(
  _hash: string,
): Promise<{ status: string }> {
  return { status: "SUCCESS" };
}

/**
 * Wait for a transaction to complete.
 * In production, this would poll Soroban RPC.
 */
export async function waitForTransaction(
  _hash: string,
  _timeoutMs: number = 30000,
  _pollIntervalMs: number = 1000,
): Promise<{ status: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { status: "SUCCESS" };
}

// ─── Soroban RPC (simplified) ─────────────────────────────────────────────

/**
 * Get a Soroban RPC server instance.
 * In production, this creates a SorobanRpc.Server.
 */
export function getSorobanServer(): any {
  // Simplified - in production would create SorobanRpc.Server
  return {
    getContractData: async () => null,
    getEvents: async () => [],
    getTransaction: async () => ({ status: "SUCCESS" }),
    sendTransaction: async () => ({ status: "PENDING", hash: "" }),
    getAccount: async () => new Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0"),
  };
}

// ─── Transaction Helpers ────────────────────────────────────────────────────

/**
 * Build a Stellar explorer URL for a transaction.
 */
export function getExplorerUrl(
  hashOrAddress: string,
  type: "transaction" | "account" | "contract" | "asset" = "transaction",
): string {
  const baseUrl = config.network.isMainnet
    ? "https://stellar.expert/explorer/public"
    : "https://stellar.expert/explorer/testnet";

  switch (type) {
    case "account":
      return `${baseUrl}/account/${hashOrAddress}`;
    case "contract":
      return `${baseUrl}/contract/${hashOrAddress}`;
    case "asset":
      return `${baseUrl}/asset/${hashOrAddress}`;
    case "transaction":
    default:
      return `${baseUrl}/tx/${hashOrAddress}`;
  }
}

/**
 * Get recent trades for an asset pair.
 */
export async function getRecentTrades(
  baseAsset: AssetDescriptor,
  quoteAsset: AssetDescriptor,
  limit: number = 20,
): Promise<any[]> {
  const server = getHorizonServer();
  const base = createAsset(baseAsset);
  const quote = createAsset(quoteAsset);

  const trades = await server
    .trades()
    .forAssetPair(base, quote)
    .limit(limit)
    .order("desc")
    .call();

  return trades.records;
}

// ─── Format Helpers ─────────────────────────────────────────────────────────

/**
 * Convert a human-readable amount to bigint with specified decimals.
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
 * Format a bigint value to human-readable string with decimals.
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
