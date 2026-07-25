/**
 * OrbitSwap Pro - MarketInfo Component
 *
 * Displays real-time market information and analytics.
 */

import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { MarketSkeleton } from "../ui/Skeleton";
import { formatNumber, formatUsd, formatCompactNumber, formatPercentage } from "../../utils";
import type { MarketInfo as MarketInfoType } from "../../types";

interface MarketInfoProps {
  marketInfo?: MarketInfoType;
  isLoading?: boolean;
}

/**
 * Market information cards showing key metrics.
 */
export function MarketInfo({ marketInfo, isLoading }: MarketInfoProps) {
  if (isLoading) {
    return (
      <Card>
        <MarketSkeleton />
      </Card>
    );
  }

  if (!marketInfo) {
    return (
      <Card>
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">No market data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-300">Market Info</h3>
          <Badge variant="info" size="sm">{marketInfo.pair}</Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Price */}
        <div className="p-3 bg-gray-800/30 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Price</p>
          <p className="text-lg font-semibold text-white font-mono">
            {formatNumber(marketInfo.price)}
          </p>
          {marketInfo.priceChange24h !== 0 && (
            <p
              className={`text-xs mt-1 ${
                marketInfo.priceChange24h >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {formatPercentage(marketInfo.priceChange24h)} (24h)
            </p>
          )}
        </div>

        {/* Volume */}
        <div className="p-3 bg-gray-800/30 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Volume (24h)</p>
          <p className="text-lg font-semibold text-white font-mono">
            {formatCompactNumber(marketInfo.volume24h)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{marketInfo.pair}</p>
        </div>

        {/* TVL */}
        <div className="p-3 bg-gray-800/30 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Total Value Locked</p>
          <p className="text-lg font-semibold text-white font-mono">
            {formatUsd(marketInfo.tvl)}
          </p>
        </div>

        {/* Liquidity */}
        <div className="p-3 bg-gray-800/30 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Liquidity</p>
          <p className="text-lg font-semibold text-white font-mono">
            {formatCompactNumber(marketInfo.liquidity)}
          </p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
        <span>Total Swaps: {formatNumber(marketInfo.totalSwaps, 0)}</span>
        <span>Fees (24h): {formatCompactNumber(marketInfo.fees24h)}</span>
      </div>
    </Card>
  );
}
