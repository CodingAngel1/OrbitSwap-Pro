/**
 * OrbitSwap Pro - AssetSelector Component
 *
 * Modal for selecting tokens from a list of available assets.
 */

import { useState, useMemo } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import type { AssetDescriptor } from "../../types";
import { NATIVE_ASSET } from "../../constants";
import { config } from "../../config";

interface AssetSelectorProps {
  selectedCode?: string;
  onSelect: (asset: AssetDescriptor) => void;
  onClose: () => void;
}

interface AssetOption {
  code: string;
  issuer: string;
  decimals: number;
  name: string;
  icon?: string;
  balance?: string;
}

/**
 * Default assets for the selector.
 * In production, these would be fetched from the blockchain.
 */
const defaultAssets: AssetOption[] = [
  { code: NATIVE_ASSET, issuer: "", decimals: 7, name: "Stellar Lumens", icon: "✧" },
  { code: "USDC", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN", decimals: 7, name: "USD Coin", icon: "₮" },
  { code: "ETH", issuer: "GBETHKBL5TCUTQ3JPDIYOZ5RDARTMHMEKIOFDQO6MSVTKMXSMJEM4YX", decimals: 7, name: "Ethereum", icon: "♦" },
  { code: "BTC", issuer: "GBBTCUO3RB3CQ3JN2Z6JX2Z7QG3Z6JX2Z7QG3Z6JX2Z7QG3Z6JX2Z7", decimals: 7, name: "Bitcoin", icon: "₿" },
  { code: "SOROBAN", issuer: "GAOYR3YEM6KQ6UYONYLMOZ6VYYQ4LZ6XQYQ6LZ6XQYQ6LZ6XQYQ6LZ6", decimals: 7, name: "Soroban", icon: "◎" },
];

/**
 * Asset selector modal with search and filtering.
 */
export function AssetSelector({
  selectedCode,
  onSelect,
  onClose,
}: AssetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return defaultAssets;

    const query = searchQuery.toLowerCase();
    return defaultAssets.filter(
      (asset) =>
        asset.code.toLowerCase().includes(query) ||
        asset.name.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Select Token"
      size="sm"
    >
      {/* Search */}
      <div className="mb-4">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or symbol..."
          prefix={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          autoFocus
        />
      </div>

      {/* Asset List */}
      <div className="space-y-1 max-h-80 overflow-y-auto -mx-2">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No assets found</p>
          </div>
        ) : (
          filteredAssets.map((asset) => {
            const isSelected = asset.code === selectedCode;
            return (
              <button
                key={`${asset.code}-${asset.issuer}`}
                onClick={() =>
                  onSelect({
                    code: asset.code,
                    issuer: asset.issuer,
                    decimals: asset.decimals,
                    name: asset.name,
                  })
                }
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                  ${isSelected ? "bg-indigo-500/10" : "hover:bg-gray-800/50"}
                `}
                disabled={isSelected}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    asset.code === NATIVE_ASSET
                      ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                      : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                  }`}
                >
                  {asset.icon || asset.code.slice(0, 2)}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">{asset.code}</p>
                  <p className="text-xs text-gray-500">{asset.name}</p>
                </div>
                {isSelected && (
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Common Tokens */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 mb-2">Common Tokens</p>
        <div className="flex flex-wrap gap-2">
          {defaultAssets.slice(0, 4).map((asset) => (
            <button
              key={`common-${asset.code}`}
              onClick={() =>
                onSelect({
                  code: asset.code,
                  issuer: asset.issuer,
                  decimals: asset.decimals,
                  name: asset.name,
                })
              }
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors"
            >
              {asset.code}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
