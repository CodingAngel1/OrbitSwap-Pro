/**
 * OrbitSwap Pro - SwapInterface Component
 *
 * Main token swap interface with input/output fields, swap button, and transaction status.
 */

import { useState, useCallback } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { SwapSkeleton } from "../ui/Skeleton";
import { useWalletContext } from "../../contexts/WalletContext";
import { useNotificationContext } from "../../contexts/NotificationContext";
import { useSwap } from "../../hooks/useSwap";
import { formatNumber, formatExchangeRate, formatPriceImpact, formatTokenAmount } from "../../utils";
import { validateSwapAmount, validateSwapPair } from "../../utils/validation";
import { NATIVE_ASSET } from "../../constants";
import { AssetSelector } from "./AssetSelector";
import { SwapPreview } from "./SwapPreview";
import { TransactionStatus } from "../transaction/TransactionStatus";

interface SwapInterfaceProps {
  onSuccess?: () => void;
}

/**
 * Main swap interface for token exchange.
 */
export function SwapInterface({ onSuccess }: SwapInterfaceProps) {
  const { wallet, balances, isConnected, connect } = useWalletContext();
  const { addNotification } = useNotificationContext();
  const {
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
    swapAssets,
    requestQuote,
    executeSwapTransaction,
    resetForm,
  } = useSwap();

  const [showPreview, setShowPreview] = useState(false);
  const [showAssetSelector, setShowAssetSelector] = useState<"input" | "output" | null>(null);
  const [slippageInput, setSlippageInput] = useState(formState.slippage.value.toString());

  const inputBalance = isConnected && balances.length > 0
    ? balances[0].balance
    : "0";

  /**
   * Handle swap execution.
   */
  const handleSwap = useCallback(async () => {
    if (!wallet?.address) {
      await connect();
      return;
    }

    if (showPreview && quote) {
      try {
        await executeSwapTransaction(wallet.address);
        setShowPreview(false);
        addNotification({
          type: "success",
          title: "Swap Executed",
          message: "Your swap has been submitted successfully.",
        });
        onSuccess?.();
      } catch (err) {
        addNotification({
          type: "error",
          title: "Swap Failed",
          message: err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      }
      return;
    }

    // Validate and get quote
    const amountValidation = validateSwapAmount(formState.inputAmount, inputBalance);
    if (!amountValidation.valid) {
      addNotification({ type: "error", title: "Invalid Amount", message: amountValidation.error || "" });
      return;
    }

    const pairValidation = validateSwapPair(
      formState.inputAsset?.code || "",
      formState.outputAsset?.code || "",
    );
    if (!pairValidation.valid) {
      addNotification({ type: "error", title: "Invalid Pair", message: pairValidation.error || "" });
      return;
    }

    // If we have a quote, show preview
    if (quote) {
      setShowPreview(true);
      return;
    }

    // Request quote
    try {
      await requestQuote(wallet.address);
    } catch (err) {
      addNotification({
        type: "error",
        title: "Quote Failed",
        message: err instanceof Error ? err.message : "Failed to get swap quote.",
      });
    }
  }, [wallet, formState, quote, showPreview, connect, executeSwapTransaction, requestQuote, inputBalance, addNotification, onSuccess]);

  /**
   * Handle slippage change.
   */
  const handleSlippageChange = useCallback(
    (value: string) => {
      setSlippageInput(value);
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        setSlippage({ auto: false, value: numValue });
      }
    },
    [setSlippage],
  );

  /**
   * Calculate the button text based on state.
   */
  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (isExecuting) return "Swapping...";
    if (isLoadingQuote) return "Getting Quote...";
    if (showPreview && quote) return "Confirm Swap";
    if (quote) return "Preview Swap";
    if (!formState.inputAsset || !formState.outputAsset) return "Select Tokens";
    if (!formState.inputAmount) return "Enter Amount";
    return "Get Quote";
  };

  return (
    <>
      <Card padding="none">
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Swap</h2>
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm" dot>
                {formState.slippage.value}% Slippage
              </Badge>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-white transition-colors p-1"
                aria-label="Reset form"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Input Token */}
          <div className="space-y-2 mb-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">You Pay</label>
              <button
                onClick={() =>
                  setInputAmount(inputBalance)
                }
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Balance: {formatNumber(inputBalance)}
              </button>
            </div>
            <div
              className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => setShowAssetSelector("input")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowAssetSelector("input");
                }
              }}
            >
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {formState.inputAsset?.code?.slice(0, 2) || "?"}
                </div>
                <span className="text-white font-medium">
                  {formState.inputAsset?.code || "Select"}
                </span>
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <input
                type="number"
                value={formState.inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent text-right text-2xl text-white placeholder-gray-600 font-mono focus:outline-none"
                min="0"
                step="any"
                aria-label="Input amount"
              />
            </div>
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={swapAssets}
              className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Swap input and output tokens"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* Output Token */}
          <div className="space-y-2 mb-6">
            <label className="text-sm text-gray-400">You Receive</label>
            <div
              className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => setShowAssetSelector("output")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowAssetSelector("output");
                }
              }}
            >
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white">
                  {formState.outputAsset?.code?.slice(0, 2) || "?"}
                </div>
                <span className="text-white font-medium">
                  {formState.outputAsset?.code || "Select"}
                </span>
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <input
                type="number"
                value={formState.outputAmount}
                onChange={(e) => setOutputAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent text-right text-2xl text-white placeholder-gray-600 font-mono focus:outline-none"
                min="0"
                step="any"
                aria-label="Output amount"
              />
            </div>
          </div>

          {/* Quote Details */}
          {quote && !showPreview && (
            <div className="mb-4 p-4 bg-gray-800/30 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Exchange Rate</span>
                <span className="text-gray-200">
                  {formatExchangeRate(
                    quote.exchangeRate,
                    quote.inputAsset.code,
                    quote.outputAsset.code,
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price Impact</span>
                <span
                  className={
                    formatPriceImpact(quote.priceImpact).color === "green"
                      ? "text-green-400"
                      : formatPriceImpact(quote.priceImpact).color === "yellow"
                        ? "text-yellow-400"
                        : "text-red-400"
                  }
                >
                  {quote.priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Network Fee</span>
                <span className="text-gray-200">
                  {formatTokenAmount(quote.fee, quote.inputAsset.code)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Min. Received</span>
                <span className="text-gray-200">
                  {formatNumber(quote.minimumOutput)} {quote.outputAsset.code}
                </span>
              </div>
            </div>
          )}

          {/* Slippage Settings */}
          <div className="mb-4 flex items-center justify-between p-3 bg-gray-800/20 rounded-xl">
            <span className="text-sm text-gray-400">Slippage Tolerance</span>
            <div className="flex items-center gap-2">
              {[0.1, 0.5, 1.0].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setSlippage({ auto: false, value: val });
                    setSlippageInput(val.toString());
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                    formState.slippage.value === val
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
                  }`}
                >
                  {val}%
                </button>
              ))}
              <div className="relative">
                <input
                  type="number"
                  value={slippageInput}
                  onChange={(e) => handleSlippageChange(e.target.value)}
                  className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white text-center focus:outline-none focus:border-indigo-500"
                  placeholder="Custom"
                  min="0.01"
                  max="50"
                  step="0.1"
                  aria-label="Custom slippage"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Swap Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoadingQuote || isExecuting}
            loadingText={isExecuting ? "Swapping..." : "Loading..."}
            onClick={handleSwap}
            disabled={
              !formState.inputAsset ||
              !formState.outputAsset ||
              isExecuting
            }
          >
            {getButtonText()}
          </Button>
        </div>
      </Card>

      {/* Asset Selector Modal */}
      {showAssetSelector && (
        <AssetSelector
          selectedCode={
            showAssetSelector === "input"
              ? formState.inputAsset?.code
              : formState.outputAsset?.code
          }
          onSelect={(asset) => {
            if (showAssetSelector === "input") {
              setInputAsset(asset);
            } else {
              setOutputAsset(asset);
            }
            setShowAssetSelector(null);
          }}
          onClose={() => setShowAssetSelector(null)}
        />
      )}

      {/* Swap Preview Modal */}
      {showPreview && quote && (
        <SwapPreview
          quote={quote}
          onConfirm={handleSwap}
          onClose={() => setShowPreview(false)}
          isExecuting={isExecuting}
        />
      )}

      {/* Transaction Status */}
      {transaction && (
        <TransactionStatus
          transaction={transaction}
          onDismiss={() => {}}
        />
      )}
    </>
  );
}
