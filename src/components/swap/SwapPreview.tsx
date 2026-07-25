/**
 * OrbitSwap Pro - SwapPreview Component
 *
 * Modal showing swap details before user confirms the transaction.
 */

import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { formatNumber, formatExchangeRate, formatPriceImpact, formatTokenAmount } from "../../utils";
import type { SwapQuote } from "../../types";

interface SwapPreviewProps {
  quote: SwapQuote;
  onConfirm: () => void;
  onClose: () => void;
  isExecuting: boolean;
}

/**
 * Swap preview confirmation modal.
 */
export function SwapPreview({
  quote,
  onConfirm,
  onClose,
  isExecuting,
}: SwapPreviewProps) {
  const priceImpactInfo = formatPriceImpact(quote.priceImpact);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Confirm Swap"
      size="sm"
    >
      <div className="space-y-5">
        {/* Swap Summary */}
        <div className="p-4 bg-gray-800/50 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">You Pay</span>
            <span className="text-lg font-semibold text-white font-mono">
              {formatNumber(quote.inputAmount)} {quote.inputAsset.code}
            </span>
          </div>
          <div className="flex justify-center">
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">You Receive</span>
            <span className="text-lg font-semibold text-emerald-400 font-mono">
              {formatNumber(quote.expectedOutput)} {quote.outputAsset.code}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2.5">
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
                priceImpactInfo.color === "green"
                  ? "text-green-400"
                  : priceImpactInfo.color === "yellow"
                    ? "text-yellow-400"
                    : "text-red-400"
              }
            >
              {quote.priceImpact.toFixed(3)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Minimum Received</span>
            <span className="text-gray-200 font-mono">
              {formatNumber(quote.minimumOutput)} {quote.outputAsset.code}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Network Fee</span>
            <span className="text-gray-200">
              ~0.00001 XLM
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Swap Fee ({quote.feeBps / 100}%)</span>
            <span className="text-gray-200">
              {formatTokenAmount(quote.fee, quote.inputAsset.code)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Route</span>
            <span className="text-gray-200">{quote.route.join(" → ")}</span>
          </div>
        </div>

        {/* Warnings */}
        {quote.priceImpact > 3 && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-xs text-red-400">
              ⚠️ High price impact. Your transaction may result in a significant
              price change.
            </p>
          </div>
        )}

        {quote.priceImpact > 1 && quote.priceImpact <= 3 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-xs text-yellow-400">
              ⚠️ Medium price impact. Consider reducing your swap amount.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            fullWidth
            disabled={isExecuting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            fullWidth
            isLoading={isExecuting}
            loadingText="Swapping..."
          >
            Confirm Swap
          </Button>
        </div>
      </div>
    </Modal>
  );
}
