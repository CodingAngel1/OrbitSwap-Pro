/**
 * OrbitSwap Pro - Contracts Service
 *
 * Service for managing smart contract interactions.
 * Provides a unified interface for all contract operations.
 */

import { xdr, nativeToScVal } from "@stellar/stellar-sdk";
import { config } from "../config";
import { createContract, getSorobanServer, sendContractTransaction, simulateContractCall } from "./stellar";
import { signTransaction } from "./wallet";
import type { ContractName, ContractDeployment } from "../types";

// ─── Contract Registry ──────────────────────────────────────────────────────

interface ContractRegistry {
  router: string;
  liquidityPool: string;
  feeVault: string;
  treasury: string;
  swapRegistry: string;
  event: string;
}

/**
 * Get the contract registry with all deployed contract addresses.
 */
export function getContractRegistry(): ContractRegistry {
  return {
    router: config.contracts.router,
    liquidityPool: config.contracts.liquidityPool,
    feeVault: config.contracts.feeVault,
    treasury: config.contracts.treasury,
    swapRegistry: config.contracts.swapRegistry,
    event: config.contracts.event,
  };
}

/**
 * Get the address for a specific contract.
 */
export function getContractAddress(name: ContractName): string {
  const registry = getContractRegistry();
  return registry[name] || "";
}

/**
 * Check if all required contracts are configured.
 */
export function areContractsConfigured(): boolean {
  const registry = getContractRegistry();
  return Object.values(registry).every((address) => address.length > 0);
}

// ─── Contract Operations ────────────────────────────────────────────────────

/**
 * Call a read-only method on a contract.
 */
export async function callContractMethod(
  contractName: ContractName,
  method: string,
  args: unknown[],
  sourceAddress: string,
): Promise<unknown> {
  const contractId = getContractAddress(contractName);

  if (!contractId) {
    throw new Error(`${contractName} contract is not configured.`);
  }

  try {
    const scVals = args.map((arg) => nativeToScVal(arg));
    const simulation = await simulateContractCall(
      contractId,
      method,
      scVals,
      sourceAddress,
    );

    return simulation.result?.retval;
  } catch (error) {
    throw new Error(
      `Contract call failed (${contractName}.${method}): ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Execute a write method on a contract.
 */
export async function executeContractMethod(
  contractName: ContractName,
  method: string,
  args: unknown[],
  sourceAddress: string,
): Promise<string> {
  const contractId = getContractAddress(contractName);

  if (!contractId) {
    throw new Error(`${contractName} contract is not configured.`);
  }

  try {
    const scVals = args.map((arg) => nativeToScVal(arg));
    const { hash } = await sendContractTransaction(
      contractId,
      method,
      scVals,
      sourceAddress,
      signTransaction,
    );

    return hash;
  } catch (error) {
    throw new Error(
      `Contract execution failed (${contractName}.${method}): ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

// ─── Contract Initialization ────────────────────────────────────────────────

/**
 * Initialize the router contract.
 * The Router orchestrates calls to LiquidityPool, SwapRegistry, FeeVault, and Event.
 */
export async function initializeRouter(
  routerId: string,
  adminAddress: string,
  lpPoolId: string,
  swapRegistryId: string,
  feeVaultId: string,
  eventId: string,
): Promise<string> {
  return executeContractMethod(
    "router",
    "init",
    [adminAddress, lpPoolId, swapRegistryId, feeVaultId, eventId],
    adminAddress,
  );
}

/**
 * Initialize the liquidity pool contract.
 */
export async function initializeLiquidityPool(
  poolId: string,
  adminAddress: string,
  tokenA: string,
  tokenB: string,
  feeBps: number,
): Promise<string> {
  return executeContractMethod(
    "liquidityPool",
    "init",
    [adminAddress, tokenA, tokenB, feeBps],
    adminAddress,
  );
}

/**
 * Initialize the fee vault contract.
 */
export async function initializeFeeVault(
  vaultId: string,
  adminAddress: string,
  treasuryId: string,
): Promise<string> {
  return executeContractMethod(
    "feeVault",
    "init",
    [adminAddress, treasuryId],
    adminAddress,
  );
}

/**
 * Initialize the treasury contract.
 */
export async function initializeTreasury(
  treasuryId: string,
  adminAddress: string,
): Promise<string> {
  return executeContractMethod(
    "treasury",
    "init",
    [adminAddress],
    adminAddress,
  );
}

/**
 * Initialize the swap registry contract.
 */
export async function initializeSwapRegistry(
  registryId: string,
  adminAddress: string,
): Promise<string> {
  return executeContractMethod(
    "swapRegistry",
    "init",
    [adminAddress],
    adminAddress,
  );
}

/**
 * Initialize the event contract.
 */
export async function initializeEvent(
  eventId: string,
  adminAddress: string,
): Promise<string> {
  return executeContractMethod(
    "event",
    "init",
    [adminAddress],
    adminAddress,
  );
}

// ─── Storage Operations ─────────────────────────────────────────────────────

/**
 * Store deployed contract addresses in configuration.
 * In production, this would write to environment files or a config service.
 */
export function storeContractDeployment(
  deployment: ContractDeployment,
): void {
  const envVarMap: Record<string, string> = {
    router: "VITE_CONTRACT_ROUTER",
    liquidityPool: "VITE_CONTRACT_LIQUIDITY_POOL",
    feeVault: "VITE_CONTRACT_FEE_VAULT",
    treasury: "VITE_CONTRACT_TREASURY",
    swapRegistry: "VITE_CONTRACT_SWAP_REGISTRY",
    event: "VITE_CONTRACT_EVENT",
  };

  const envVar = envVarMap[deployment.name];
  if (envVar && deployment.address.contractId) {
    console.info(
      `[Contract Deployed] ${deployment.name}: ${deployment.address.contractId}`,
    );
    console.info(`Set ${envVar}=${deployment.address.contractId} in your .env file`);
  }
}

/**
 * Get a list of all contract deployments with their status.
 */
export function getDeploymentStatus(): ContractDeployment[] {
  const registry = getContractRegistry();
  const names: ContractName[] = [
    "router",
    "liquidityPool",
    "feeVault",
    "treasury",
    "swapRegistry",
    "event",
  ];

  return names.map((name) => ({
    name,
    address: {
      contractId: registry[name],
      network: config.network.name,
    },
    status: registry[name] ? ("deployed" as const) : ("pending" as const),
  }));
}

// ─── Verification ───────────────────────────────────────────────────────────

/**
 * Verify that a contract is deployed and accessible.
 */
export async function verifyContractDeployment(
  contractId: string,
): Promise<boolean> {
  try {
    const server = getSorobanServer();
    const entry = await server.getContractData(contractId, xdr.ScVal.scvSymbol("wasm_hash"));
    return !!entry;
  } catch {
    return false;
  }
}
