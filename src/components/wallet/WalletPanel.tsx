/**
 * OrbitSwap Pro - WalletPanel Component
 *
 * Wallet connection panel showing balance, assets, and connection status.
 */

import { useState } from "react";
import { useWalletContext } from "../../contexts/WalletContext";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { formatAddress, formatNumber, formatTokenAmount } from "../../utils";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { NATIVE_ASSET } from "../../constants";
import { getExplorerUrl } from "../../services/stellar";

/**
 * Wallet panel showing connection state and balances.
 */
export function WalletPanel() {
  const {
    wallet,
    balances,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    supportedWallets,
  } = useWalletContext();
  const [showAllBalances, setShowAllBalances] = useState(false);

  const visibleBalances = showAllBalances ? balances : balances.slice(0, 5);

  if (!isConnected) {
    return (
      <Card className="text-center">
        <div className="py-8">
          <div className="text-4xl mb-4">👛</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            Connect a Stellar wallet to start swapping tokens and accessing
            OrbitSwap Pro features.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            {supportedWallets.length > 0 ? (
              supportedWallets.map((w) => (
                <Button
                  key={w.id}
                  variant="outline"
                  fullWidth
                  isLoading={isConnecting}
                  onClick={() => connect(w.id)}
                >
                  {w.name}
                </Button>
              ))
            ) : (
              <Button
                variant="primary"
                fullWidth
                isLoading={isConnecting}
                onClick={() => connect()}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Wallet Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <span className="text-lg">👛</span>
          </div>
          <div>
            <p className="text-sm text-gray-400">Connected</p>
            <p className="text-sm font-mono text-white">
              {formatAddress(wallet?.address || "", 6)}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (wallet?.address) {
              window.open(getExplorerUrl(wallet.address, "account"), "_blank");
            }
          }}
          className="text-gray-500 hover:text-white transition-colors p-1"
          aria-label="View on explorer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>

      {/* Balances */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-300">Balances</h4>
          <button
            onClick={() => setShowAllBalances(!showAllBalances)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {showAllBalances ? "Show Less" : `View All (${balances.length})`}
          </button>
        </div>

        {balances.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <div className="space-y-1">
            {visibleBalances.map((balance, index) => (
              <div
                key={`${balance.asset.code}-${balance.asset.issuer}-${index}`}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {balance.asset.code.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {balance.asset.code}
                    </p>
                    {balance.asset.code !== NATIVE_ASSET && balance.asset.issuer && (
                      <p className="text-xs text-gray-500">
                        {formatAddress(balance.asset.issuer, 3)}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-mono text-gray-300">
                  {formatNumber(balance.balance, balance.asset.decimals)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={disconnect}
        >
          Disconnect
        </Button>
      </div>
    </Card>
  );
}
