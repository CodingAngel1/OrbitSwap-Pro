/**
 * OrbitSwap Pro - Home Page
 *
 * Landing page with hero section, market stats, and activity feed.
 */

import { useWalletContext } from "../contexts/WalletContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { AnalyticsCards } from "../components/market/AnalyticsCards";
import { RecentSwaps } from "../components/market/RecentSwaps";
import { ActivityFeed } from "../components/market/ActivityFeed";
import { MarketInfo } from "../components/market/MarketInfo";
import { useEvents } from "../hooks/useEvents";
import { config } from "../config";

/**
 * Home page with hero, analytics, and activity sections.
 */
export function HomePage() {
  const { isConnected, connect } = useWalletContext();
  const { recentEvents, recentEvents: latestSwaps } = useEvents();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-gray-950 border border-gray-800">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="relative px-6 py-12 sm:px-12 sm:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Decentralized Trading
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Powered by Stellar
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-xl leading-relaxed">
              {config.app.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#/swap">
                <Button variant="primary" size="lg">
                  Start Swapping
                </Button>
              </a>
              {!isConnected && (
                <Button variant="secondary" size="lg" onClick={() => connect()}>
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: "Network", value: config.network.name },
              { label: "Protocol", value: "Soroban Smart Contracts" },
              { label: "Version", value: `v${config.app.version}` },
              { label: "Status", value: "Live", highlight: true },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p
                  className={`text-lg font-semibold ${
                    stat.highlight ? "text-green-400" : "text-white"
                  }`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Platform Analytics</h2>
          <span className="text-xs text-gray-500">Real-time metrics</span>
        </div>
        <AnalyticsCards
          data={{
            totalVolume: "1250000",
            totalSwaps: 8452,
            totalLiquidity: "3200000",
            activeUsers: 1250,
            totalFees: "37500",
            averageSwapSize: "148.50",
          }}
        />
      </section>

      {/* Market Info & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <MarketInfo
            marketInfo={{
              pair: "XLM/USDC",
              baseAsset: { code: "XLM", issuer: "", decimals: 7 },
              quoteAsset: { code: "USDC", issuer: "", decimals: 7 },
              price: "0.1245",
              priceChange24h: 2.34,
              volume24h: "250000",
              tvl: "850000",
              fees24h: "750",
              totalSwaps: 1234,
              liquidity: "500000",
            }}
          />
        </section>
        <section>
          <RecentSwaps swaps={[]} />
        </section>
      </div>

      {/* Activity Feed */}
      <section>
        <ActivityFeed events={recentEvents} />
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="lg">
          <div className="text-3xl mb-4">🔄</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Instant Swaps
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Swap Stellar assets instantly with optimal pricing through our
            advanced routing algorithm.
          </p>
        </Card>
        <Card padding="lg">
          <div className="text-3xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Non-Custodial
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your keys, your coins. OrbitSwap never holds your funds or requires
            account creation.
          </p>
        </Card>
        <Card padding="lg">
          <div className="text-3xl mb-4">📡</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Real-Time Updates
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Live blockchain event streaming with automatic synchronization and
            instant notifications.
          </p>
        </Card>
      </section>
    </div>
  );
}
