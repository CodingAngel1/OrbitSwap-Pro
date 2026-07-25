/**
 * OrbitSwap Pro - Swap Page
 *
 * Main swap page with the swap interface, wallet panel, and market info.
 */

import { useWalletContext } from "../contexts/WalletContext";
import { SwapInterface } from "../components/swap/SwapInterface";
import { WalletPanel } from "../components/wallet/WalletPanel";
import { MarketInfo } from "../components/market/MarketInfo";
import { RecentSwaps } from "../components/market/RecentSwaps";

/**
 * Swap page with the main swap interface and sidebar.
 */
export function SwapPage() {
  const { isConnected } = useWalletContext();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Swap Interface */}
      <div className="lg:col-span-2 space-y-6">
        <SwapInterface />
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Wallet Panel */}
        <WalletPanel />

        {/* Market Info */}
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
      </div>

      {/* Recent Swaps - Full Width */}
      <div className="lg:col-span-3">
        <RecentSwaps swaps={[]} />
      </div>
    </div>
  );
}
