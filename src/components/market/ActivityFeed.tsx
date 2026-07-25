/**
 * OrbitSwap Pro - ActivityFeed Component
 *
 * Live activity feed showing blockchain events and transactions.
 */

import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatRelativeTime, formatAddress, formatTxHash } from "../../utils";
import { getExplorerUrl } from "../../services/stellar";
import type { BlockchainEvent } from "../../types";

interface ActivityFeedProps {
  events: BlockchainEvent[];
  isLoading?: boolean;
  maxItems?: number;
}

/**
 * Get event icon and color based on type.
 */
function getEventDisplay(event: BlockchainEvent): {
  icon: string;
  color: string;
  label: string;
} {
  switch (event.type) {
    case "swap_executed":
      return { icon: "🔄", color: "text-blue-400", label: "Swap Executed" };
    case "liquidity_added":
      return { icon: "📥", color: "text-green-400", label: "Liquidity Added" };
    case "liquidity_removed":
      return { icon: "📤", color: "text-yellow-400", label: "Liquidity Removed" };
    case "fee_collected":
      return { icon: "💰", color: "text-purple-400", label: "Fee Collected" };
    case "treasury_deposited":
      return { icon: "🏦", color: "text-emerald-400", label: "Treasury Deposit" };
    case "price_updated":
      return { icon: "📊", color: "text-indigo-400", label: "Price Updated" };
    case "pool_created":
      return { icon: "🏊", color: "text-cyan-400", label: "Pool Created" };
    case "contract_deployed":
      return { icon: "📄", color: "text-orange-400", label: "Contract Deployed" };
    default:
      return { icon: "📌", color: "text-gray-400", label: "Event" };
  }
}

/**
 * Live activity feed showing blockchain events.
 */
export function ActivityFeed({
  events,
  isLoading,
  maxItems = 20,
}: ActivityFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-8 h-8 bg-gray-800 rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-800 rounded w-32" />
                <div className="h-3 bg-gray-800 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const displayedEvents = events.slice(0, maxItems);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-300">Activity Feed</h3>
          {displayedEvents.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-label="Live" />
          )}
        </div>
        <Badge variant="info" size="sm">
          {displayedEvents.length} events
        </Badge>
      </div>

      {displayedEvents.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">📡</div>
          <p className="text-gray-500 text-sm">No activity yet</p>
          <p className="text-gray-600 text-xs mt-1">
            Blockchain events will appear here in real-time
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {displayedEvents.map((event) => {
            const display = getEventDisplay(event);
            return (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-800/50 transition-colors group"
              >
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {display.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${display.color}`}>
                      {display.label}
                    </span>
                    <span className="text-xs text-gray-600">
                      #{event.blockNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatTxHash(event.txHash)}
                    </span>
                  </div>
                </div>
                <a
                  href={getExplorerUrl(event.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="View on explorer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
