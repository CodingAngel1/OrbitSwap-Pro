/**
 * OrbitSwap Pro - useSwap Hook
 *
 * Hook for swap operations, quotes, and transaction management.
 */

import { useState, useCallback, useRef } from "react";
import type {
  AssetDescriptor,
  SwapQuote,
  SwapRequest,
  SwapTransaction,
  SwapStatus,
  SwapFormState,
  SlippageConfig,
} from "../types";
import { getSwapQuote, executeSwap } from "../services/swap";
import { config } from "../config";

interface UseSwapReturn {
  formState: SwapFormState;
  quote: SwapQuote | null;
  transaction: SwapTransaction | null;
  status: SwapStatus;
  isLoadingQuote: boolean;
  isExecuting: boolean;
  error: string | null;
  setInputAsset: (asset: AssetDescriptor) => void;
  setOutputAsset: (asset: AssetDescriptor) => void;
  setInputAmount: (amount: string) => void;
  setOutputAmount: (amount: string) => void;
  setSlippage: (slippage: SlippageConfig) => void;
  setDeadline: (minutes: number) => void;
  setRecipient: (address: string) => void;
  swapAssets: () => void;
  requestQuote: (walletAddress: string) => Promise<void>;
  executeSwapTransaction: (walletAddress: string) => Promise<void>;
  resetForm: () => void;
}

const defaultFormState: SwapFormState = {
  inputAsset: null,
  outputAsset: null,
  inputAmount: "",
  outputAmount: "",
  slippage: { auto: true, value: config.swap.defaultSlippage },
  deadline: config.swap.deadlineMinutes,
  recipient: "",
};

/**
 * Hook for managing token swap operations.
 */
export function useSwap(): UseSwapReturn {
  const [formState, setFormState] = useState<SwapFormState>(defaultFormState);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [transaction, setTransaction] = useState<SwapTransaction | null>(null);
  const [status, setStatus] = useState<SwapStatus>("idle");
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const quoteRequestId = useRef(0);

  // ─── Setters ────────────────────────────────────────────────────────────

  const setInputAsset = useCallback((asset: AssetDescriptor) => {
    setFormState((prev) => ({ ...prev, inputAsset: asset }));
    setQuote(null);
    setError(null);
  }, []);

  const setOutputAsset = useCallback((asset: AssetDescriptor) => {
    setFormState((prev) => ({ ...prev, outputAsset: asset }));
    setQuote(null);
    setError(null);
  }, []);

  const setInputAmount = useCallback((amount: string) => {
    setFormState((prev) => ({ ...prev, inputAmount: amount }));
    setQuote(null);
    setError(null);
  }, []);

  const setOutputAmount = useCallback((amount: string) => {
    setFormState((prev) => ({ ...prev, outputAmount: amount }));
    setQuote(null);
    setError(null);
  }, []);

  const setSlippage = useCallback((slippageConfig: SlippageConfig) => {
    setFormState((prev) => ({ ...prev, slippage: slippageConfig }));
  }, []);

  const setDeadline = useCallback((minutes: number) => {
    setFormState((prev) => ({ ...prev, deadline: minutes }));
  }, []);

  const setRecipient = useCallback((address: string) => {
    setFormState((prev) => ({ ...prev, recipient: address }));
  }, []);

  /**
   * Swap input and output assets.
   */
  const swapAssets = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      inputAsset: prev.outputAsset,
      outputAsset: prev.inputAsset,
      inputAmount: prev.outputAmount,
      outputAmount: prev.inputAmount,
    }));
    setQuote(null);
    setError(null);
  }, []);

  // ─── Quote ──────────────────────────────────────────────────────────────

  /**
   * Request a swap quote.
   */
  const requestQuote = useCallback(
    async (walletAddress: string) => {
      const { inputAsset, outputAsset, inputAmount } = formState;

      if (!inputAsset || !outputAsset || !inputAmount) {
        setError("Please fill in all swap details.");
        return;
      }

      const requestId = ++quoteRequestId.current;
      setIsLoadingQuote(true);
      setError(null);

      try {
        const swapQuote = await getSwapQuote(
          inputAsset,
          outputAsset,
          inputAmount,
          walletAddress,
        );

        // Only update if this is still the latest request
        if (requestId === quoteRequestId.current) {
          setQuote(swapQuote);
          setFormState((prev) => ({
            ...prev,
            outputAmount: swapQuote.expectedOutput,
          }));
        }
      } catch (err) {
        if (requestId === quoteRequestId.current) {
          setError(err instanceof Error ? err.message : "Failed to get quote");
          setQuote(null);
        }
      } finally {
        if (requestId === quoteRequestId.current) {
          setIsLoadingQuote(false);
        }
      }
    },
    [formState],
  );

  // ─── Execute ────────────────────────────────────────────────────────────

  /**
   * Execute a swap transaction.
   */
  const executeSwapTransaction = useCallback(
    async (walletAddress: string) => {
      const { inputAsset, outputAsset, inputAmount, slippage, deadline, recipient } = formState;

      if (!inputAsset || !outputAsset || !inputAmount) {
        setError("Please fill in all swap details.");
        return;
      }

      if (!quote) {
        setError("Please get a quote before executing.");
        return;
      }

      setIsExecuting(true);
      setError(null);

      const request: SwapRequest = {
        inputAsset,
        outputAsset,
        inputAmount,
        minOutputAmount: quote.minimumOutput,
        recipient: recipient || walletAddress,
        deadline: Date.now() + deadline * 60 * 1000,
      };

      try {
        const swapTx = await executeSwap(request, walletAddress, (newStatus) => {
          setStatus(newStatus);
        });

        setTransaction(swapTx);
        setStatus("confirmed");
        resetForm();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Swap failed");
        setStatus("failed");
      } finally {
        setIsExecuting(false);
      }
    },
    [formState, quote],
  );

  // ─── Reset ──────────────────────────────────────────────────────────────

  /**
   * Reset the swap form to initial state.
   */
  const resetForm = useCallback(() => {
    setFormState(defaultFormState);
    setQuote(null);
    setTransaction(null);
    setStatus("idle");
    setError(null);
  }, []);

  return {
    formState,
    quote,
    transaction,
    status,
    isLoadingQuote,
    isExecuting,
    error,
    setInputAsset,
    setOutputAsset,
    setInputAmount,
    setOutputAmount,
    setSlippage,
    setDeadline,
    setRecipient,
    swapAssets,
    requestQuote,
    executeSwapTransaction,
    resetForm,
  };
}
