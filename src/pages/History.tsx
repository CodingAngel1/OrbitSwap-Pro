/**
 * OrbitSwap Pro - History Page
 *
 * Transaction history page showing all past swaps and operations.
 */

import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { TransactionSkeleton } from "../components/ui/Skeleton";
import {
  formatNumber,
  formatAddress,
  formatRelativeTime,
  formatFullDate,
  formatTxHash,
} from "../utils";
import { getExplorerUrl } from "../services/stellar";
import { NATIVE_ASSET } from "../constants";

interface HistoryItem {
  id: string;
  type: "swap" | "liquidity_add" | "liquidity_remove";
  inputAsset: string;
  outputAsset: string;
  inputAmount: string;
  outputAmount: string;
  timestamp: number;
  status: "confirmed" | "failed" | "pending";
  txHash: string;
}

const sampleHistory: HistoryItem[] = [
  {
    id: "1",
    type: "swap",
    inputAsset: "XLM",
    outputAsset: "USDC",
    inputAmount: "500",
    outputAmount: "62.25",
    timestamp: Date.now() - 60000,
    status: "confirmed",
    txHash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
  },
  {
    id: "2",
    type: "swap",
    inputAsset: "USDC",
    outputAsset: "XLM",
    inputAmount: "100",
    outputAmount: "798.40",
    timestamp: Date.now() - 3600000,
    status: "confirmed",
    txHash: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1",
  },
  {
    id: "3",
    type: "swap",
    inputAsset: "XLM",
    outputAsset: "ETH",
    inputAmount: "2000",
    outputAmount: "0.0765",
    timestamp: Date.now() - 7200000,
    status: "failed",
    txHash: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  },
];

/**
 * History page showing transaction history.
 */
export function HistoryPage() {
  const [filter, setFilter] = useState<"all" | "swap" | "liquidity">("all");
  const [isLoading] = useState(false);

  const filteredHistory =
    filter === "all"
      ? sampleHistory
      : sampleHistory.filter((h) => h.type === filter);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Transaction History</h1>
        <p className="text-gray-400">View your past swaps and transactions</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(["all", "swap", "liquidity"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "swap" ? "Swaps" : "Liquidity"}
          </Button>
        ))}
        <div className="flex-1" />
        <span className="text-xs text-gray-500">
          {filteredHistory.length} transactions
        </span>
      </div>

      {/* History List */}
      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-5">
            <TransactionSkeleton />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📜</div>
            <p className="text-gray-500 text-sm mb-2">No transaction history</p>
            <p className="text-gray-600 text-xs">
              Your swaps and transactions will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-800/30 transition-colors group"
              >
                {/* Type Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    item.status === "confirmed"
                      ? "bg-green-500/10"
                      : item.status === "failed"
                        ? "bg-red-500/10"
                        : "bg-yellow-500/10"
                  }`}
                >
                  {item.type === "swap" ? "🔄" : "💧"}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-white">
                      {item.type === "swap"
                        ? "Swap"
                        : item.type === "liquidity_add"
                          ? "Add Liquidity"
                          : "Remove Liquidity"}
                    </span>
                    <Badge
                      variant={
                        item.status === "confirmed"
                          ? "success"
                          : item.status === "failed"
                            ? "error"
                            : "warning"
                      }
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-300">
                      {formatNumber(item.inputAmount)} {item.inputAsset}
                    </span>
                    <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span className="text-gray-300">
                      {formatNumber(item.outputAmount)} {item.outputAsset}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">
                      {formatFullDate(item.timestamp)}
                    </span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatTxHash(item.txHash)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.txHash);
                    }}
                    className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                    aria-label="Copy transaction hash"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <a
                    href={getExplorerUrl(item.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                    aria-label="View on explorer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
