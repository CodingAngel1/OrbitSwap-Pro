/**
 * OrbitSwap Pro - TransactionStatus Component
 *
 * Displays the complete transaction lifecycle status.
 * Shows preparing, signing, submitting, pending, confirmed, failed states.
 */

import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { formatAddress, formatFullDate, formatTxHash } from "../../utils";
import type { SwapTransaction, SwapStatus } from "../../types";

interface TransactionStatusProps {
  transaction: SwapTransaction;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Status display configuration.
 */
const statusConfig: Record<SwapStatus, {
  label: string;
  variant: "success" | "error" | "warning" | "info" | "neutral";
  description: string;
}> = {
  idle: { label: "Idle", variant: "neutral", description: "" },
  preparing: {
    label: "Preparing",
    variant: "info",
    description: "Preparing your transaction...",
  },
  awaitingApproval: {
    label: "Awaiting Approval",
    variant: "warning",
    description: "Please approve the transaction in your wallet.",
  },
  signing: {
    label: "Signing",
    variant: "info",
    description: "Signing the transaction...",
  },
  submitting: {
    label: "Submitting",
    variant: "info",
    description: "Submitting to the Stellar network...",
  },
  pending: {
    label: "Pending",
    variant: "warning",
    description: "Waiting for confirmation from the network...",
  },
  confirmed: {
    label: "Confirmed",
    variant: "success",
    description: "Transaction confirmed successfully.",
  },
  failed: {
    label: "Failed",
    variant: "error",
    description: "Transaction failed. Please try again.",
  },
  rejected: {
    label: "Rejected",
    variant: "error",
    description: "Transaction was rejected by the user.",
  },
  timeout: {
    label: "Timeout",
    variant: "error",
    description: "Transaction confirmation timed out.",
  },
};

/**
 * Visual step indicator for the transaction lifecycle.
 */
function LifecycleStep({
  label,
  active,
  completed,
  failed,
}: {
  label: string;
  active: boolean;
  completed: boolean;
  failed: boolean;
}) {
  const stateClass = completed
    ? "bg-green-500 text-white"
    : failed
      ? "bg-red-500 text-white"
      : active
        ? "bg-indigo-500 text-white ring-4 ring-indigo-500/30"
        : "bg-gray-700 text-gray-500";

  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${stateClass}`}>
        {completed ? "✓" : failed ? "✗" : active ? "●" : "○"}
      </div>
      <span className={`text-xs ${active ? "text-white" : completed ? "text-green-400" : failed ? "text-red-400" : "text-gray-500"}`}>
        {label}
      </span>
    </div>
  );
}

/**
 * Transaction status component showing lifecycle.
 */
export function TransactionStatus({
  transaction,
  onRetry,
  onDismiss,
}: TransactionStatusProps) {
  const status = statusConfig[transaction.status];

  return (
    <Card className="mt-4">
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} size="md" dot>
            {status.label}
          </Badge>
        </div>
        {transaction.txHash && (
          <a
            href={transaction.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View on Explorer ↗
          </a>
        )}
      </div>

      {/* Status Description */}
      <p className="text-sm text-gray-400 mb-4">{status.description}</p>

      {/* Lifecycle Steps */}
      <div className="space-y-2 mb-4">
        <LifecycleStep
          label="Preparing"
          active={transaction.status === "preparing"}
          completed={
            transaction.status === "awaitingApproval" ||
            transaction.status === "signing" ||
            transaction.status === "submitting" ||
            transaction.status === "pending" ||
            transaction.status === "confirmed"
          }
          failed={false}
        />
        <LifecycleStep
          label="Signing"
          active={transaction.status === "signing" || transaction.status === "awaitingApproval"}
          completed={
            transaction.status === "submitting" ||
            transaction.status === "pending" ||
            transaction.status === "confirmed"
          }
          failed={transaction.status === "rejected"}
        />
        <LifecycleStep
          label="Submitting"
          active={transaction.status === "submitting"}
          completed={
            transaction.status === "pending" ||
            transaction.status === "confirmed"
          }
          failed={false}
        />
        <LifecycleStep
          label="Confirmation"
          active={transaction.status === "pending"}
          completed={transaction.status === "confirmed"}
          failed={transaction.status === "failed" || transaction.status === "timeout"}
        />
      </div>

      {/* Transaction Details */}
      <div className="space-y-1.5 text-xs text-gray-500">
        {transaction.txHash && (
          <div className="flex justify-between">
            <span>Transaction Hash</span>
            <span className="font-mono text-gray-400">
              {formatTxHash(transaction.txHash)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Timestamp</span>
          <span>{formatFullDate(transaction.timestamp)}</span>
        </div>
        <div className="flex justify-between">
          <span>Input</span>
          <span>
            {transaction.request.inputAmount} {transaction.request.inputAsset.code}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Output</span>
          <span>
            {transaction.quote.expectedOutput} {transaction.quote.outputAsset.code}
          </span>
        </div>
      </div>

      {/* Error Details */}
      {transaction.error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-xs text-red-400">{transaction.error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {(transaction.status === "failed" || transaction.status === "timeout") && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-sm transition-colors"
          >
            Retry
          </button>
        )}
        {transaction.txHash && (
          <button
            onClick={() => {
              if (transaction.txHash) {
                navigator.clipboard.writeText(transaction.txHash);
              }
            }}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors"
          >
            Copy TX Hash
          </button>
        )}
      </div>
    </Card>
  );
}
