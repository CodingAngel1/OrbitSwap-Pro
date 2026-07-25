/**
 * OrbitSwap Pro - RecentSwaps Component
 *
 * Displays recent swap transactions with live updates.
 */

import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { TransactionSkeleton } from "../ui/Skeleton";
import { formatNumber, formatAddress, formatRelativeTime, formatTxHash } from "../../utils";
import { getExplorerUrl } from "../../services/stellar";
import type { SwapHistoryItem } from "../../types";

interface RecentSwapsProps {
  swaps: SwapHistoryItem[];
  isLoading?: boolean;
  maxItems?: number;
}

/**
 * Recent swaps list with live updates.
 */
export function RecentSwaps({
  swaps,
  isLoading,
  maxItems = 10,
}: RecentSwapsProps) {
  if (isLoading) {
    return (
      <Card>
        <TransactionSkeleton />
      </Card>
    );
  }

  const displayedSwaps = swaps.slice(0, maxItems);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Recent Swaps</h3>
        {swaps.length > 0 && (
          <span className="text-xs text-gray-500">{swaps.length} total</span>
        )}
      </div>

      {displayedSwaps.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🔄</div>
          <p className="text-gray-500 text-sm">No recent swaps</p>
          <p className="text-gray-600 text-xs mt-1">
            Swaps will appear here once you start trading
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {displayedSwaps.map((swap, index) => (
            <div
              key={swap.txHash || index}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800/50 transition-colors group"
            >
              {/* Asset Icons */}
              <div className="flex -space-x-2 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white z-10">
                  {swap.inputAsset.code.slice(0, 2)}
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white">
                  {swap.outputAsset.code.slice(0, 2)}
                </div>
              </div>

              {/* Swap Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium">
                    {formatNumber(swap.inputAmount)} {swap.inputAsset.code}
                  </span>
                  <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="text-sm text-emerald-400 font-medium">
                    {formatNumber(swap.outputAmount)} {swap.outputAsset.code}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(swap.timestamp)}
                  </span>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs text-gray-500 font-mono">
                    {formatTxHash(swap.txHash)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Badge variant="success" size="sm">Done</Badge>
                <a
                  href={swap.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-500 hover:text-white transition-colors"
                  aria-label="View on explorer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
