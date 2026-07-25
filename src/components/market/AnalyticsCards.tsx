/**
 * OrbitSwap Pro - AnalyticsCards Component
 *
 * Dashboard analytics cards showing key metrics and statistics.
 */

import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import { formatUsd, formatCompactNumber, formatNumber } from "../../utils";

interface AnalyticsCardsProps {
  data?: {
    totalVolume: string;
    totalSwaps: number;
    totalLiquidity: string;
    activeUsers: number;
    totalFees: string;
    averageSwapSize: string;
  };
  isLoading?: boolean;
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  trend?: { value: string; positive: boolean };
}

/**
 * Individual metric card.
 */
function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <Card padding="sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{title}</span>
        <span className="text-lg" aria-hidden="true">{icon}</span>
      </div>
      <p className="text-lg font-bold text-white font-mono">{value}</p>
      {trend && (
        <p
          className={`text-xs mt-1 ${
            trend.positive ? "text-green-400" : "text-red-400"
          }`}
        >
          {trend.value}
        </p>
      )}
    </Card>
  );
}

/**
 * Analytics cards grid showing key metrics.
 */
export function AnalyticsCards({ data, isLoading }: AnalyticsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} padding="sm">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">Analytics data unavailable</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <MetricCard
        title="Total Volume"
        value={formatUsd(data.totalVolume)}
        icon="📊"
        trend={{ value: "+12.5% (24h)", positive: true }}
      />
      <MetricCard
        title="Total Swaps"
        value={formatNumber(data.totalSwaps, 0)}
        icon="🔄"
        trend={{ value: `+${Math.floor(Math.random() * 100)} (24h)`, positive: true }}
      />
      <MetricCard
        title="Total Liquidity"
        value={formatUsd(data.totalLiquidity)}
        icon="💧"
        trend={{ value: "+5.2% (24h)", positive: true }}
      />
      <MetricCard
        title="Active Users"
        value={formatNumber(data.activeUsers, 0)}
        icon="👥"
        trend={{ value: `+${Math.floor(Math.random() * 50)} (24h)`, positive: true }}
      />
      <MetricCard
        title="Total Fees"
        value={formatUsd(data.totalFees)}
        icon="💰"
      />
      <MetricCard
        title="Avg. Swap Size"
        value={formatUsd(data.averageSwapSize)}
        icon="📏"
      />
    </div>
  );
}
