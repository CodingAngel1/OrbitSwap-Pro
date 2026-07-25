/**
 * OrbitSwap Pro - Swap Service
 *
 * Business logic for token swap operations.
 */

import { nativeToScVal } from "@stellar/stellar-sdk";
import { config } from "../config";
import { getExplorerUrl, loadAccount } from "./stellar";
import { signTransaction } from "./wallet";
import { getContractRegistry } from "./contracts";
import type {
  AssetDescriptor,
  SwapQuote,
  SwapRequest,
  SwapTransaction,
  SwapStatus,
  SwapHistoryItem,
} from "../types";

// ─── Quote Generation ───────────────────────────────────────────────────────

/**
 * Generate a swap quote for the given parameters.
 */
export async function getSwapQuote(
  inputAsset: AssetDescriptor,
  outputAsset: AssetDescriptor,
  inputAmount: string,
  walletAddress: string,
): Promise<SwapQuote> {
  if (!inputAsset || !outputAsset) {
    throw new Error("Please select both input and output assets.");
  }

  if (!inputAmount || parseFloat(inputAmount) <= 0) {
    throw new Error("Please enter a valid amount.");
  }

  const registry = getContractRegistry();
  if (!registry.router) {
    throw new Error("Router contract not configured. Please check network settings.");
  }

  try {
    // Simulate swap via Horizon (reading pool state)
    // In production, this would use Soroban contract simulation
    const account = await loadAccount(walletAddress);

    // Calculate estimated output (simplified constant product formula)
    const inputNum = parseFloat(inputAmount);
    const feeBps = config.fees.swapFee;
    const feeAmount = inputNum * (feeBps / 10000);
    const inputAfterFee = inputNum - feeAmount;

    // Simulated pool reserves
    const reserveIn = 1000000; // Simulated XLM reserve
    const reserveOut = 100000; // Simulated USDC reserve

    // Constant product formula: output = (inputAfterFee * reserveOut) / (reserveIn + inputAfterFee)
    const estimatedOutput = (inputAfterFee * reserveOut) / (reserveIn + inputAfterFee);
    const priceImpact =
      ((inputAfterFee / (reserveIn + inputAfterFee)) * 100);
    const exchangeRate = estimatedOutput > 0 ? (estimatedOutput / inputNum) : 0;
    const minOutput = estimatedOutput * (1 - config.swap.defaultSlippage / 100);

    return {
      inputAsset,
      outputAsset,
      inputAmount,
      expectedOutput: estimatedOutput.toFixed(outputAsset.decimals),
      minimumOutput: minOutput.toFixed(outputAsset.decimals),
      exchangeRate: exchangeRate.toFixed(7),
      priceImpact,
      fee: feeAmount.toFixed(outputAsset.decimals),
      feeBps,
      route: [inputAsset.code, outputAsset.code],
      deadline: Date.now() + config.swap.deadlineMinutes * 60 * 1000,
      quoteTimestamp: Date.now(),
    };
  } catch (error) {
    throw new Error(
      `Failed to get swap quote: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// ─── Swap Execution ─────────────────────────────────────────────────────────

/**
 * Execute a token swap transaction.
 */
export async function executeSwap(
  request: SwapRequest,
  walletAddress: string,
  onStatusChange?: (status: SwapStatus) => void,
): Promise<SwapTransaction> {
  const txId = generateTxId();
  const registry = getContractRegistry();

  onStatusChange?.("preparing");

  try {
    // Validate inputs
    if (!request.inputAsset || !request.outputAsset) {
      throw new Error("Invalid swap pair.");
    }

    if (!request.inputAmount || parseFloat(request.inputAmount) <= 0) {
      throw new Error("Invalid swap amount.");
    }

    onStatusChange?.("awaitingApproval");

    if (!registry.router) {
      throw new Error("Router contract not configured.");
    }

    onStatusChange?.("signing");

    // In production, this would create and sign a Soroban contract transaction
    // For now, simulate the transaction flow

    // Build minimal output
    const inputNum = parseFloat(request.inputAmount);
    const estimatedOutput = inputNum * 0.997; // 0.3% fee
    const minOutput = estimatedOutput * (1 - config.swap.defaultSlippage / 100);

    const simulatedHash = `sim_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
    const explorerUrl = getExplorerUrl(simulatedHash);

    onStatusChange?.("submitting");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onStatusChange?.("pending");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onStatusChange?.("confirmed");

    return {
      id: txId,
      request,
      quote: {
        inputAsset: request.inputAsset,
        outputAsset: request.outputAsset,
        inputAmount: request.inputAmount,
        expectedOutput: estimatedOutput.toFixed(request.outputAsset.decimals),
        minimumOutput: minOutput.toFixed(request.outputAsset.decimals),
        exchangeRate: (estimatedOutput / inputNum).toFixed(7),
        priceImpact: 0.05,
        fee: (inputNum * 0.003).toFixed(request.outputAsset.decimals),
        feeBps: config.fees.swapFee,
        route: [request.inputAsset.code, request.outputAsset.code],
        deadline: request.deadline,
        quoteTimestamp: Date.now(),
      },
      status: "confirmed",
      txHash: simulatedHash,
      timestamp: Date.now(),
      completedAt: Date.now(),
      explorerUrl,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (
      errorMessage.includes("rejected") ||
      errorMessage.includes("denied")
    ) {
      onStatusChange?.("rejected");
    } else {
      onStatusChange?.("failed");
    }

    throw new Error(errorMessage);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Generate a unique transaction ID.
 */
function generateTxId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `tx_${timestamp}${random}`;
}
