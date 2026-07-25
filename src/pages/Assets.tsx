/**
 * OrbitSwap Pro - Assets Page
 *
 * Asset explorer page showing available tokens and their market data.
 */

import { useState, useMemo } from "react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { formatNumber, formatUsd, formatCompactNumber, formatAddress } from "../utils";
import { NATIVE_ASSET } from "../constants";

interface AssetRow {
  code: string;
  name: string;
  issuer: string;
  icon: string;
  price: string;
  change24h: number;
  volume24h: string;
  liquidity: string;
  marketCap: string;
  isNative: boolean;
}

const sampleAssets: AssetRow[] = [
  { code: NATIVE_ASSET, name: "Stellar Lumens", issuer: "", icon: "✧", price: "0.1245", change24h: 2.34, volume24h: "1250000", liquidity: "500000", marketCap: "3500000000", isNative: true },
  { code: "USDC", name: "USD Coin", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN", icon: "₮", price: "1.0002", change24h: 0.01, volume24h: "890000", liquidity: "320000", marketCap: "42000000", isNative: false },
  { code: "ETH", name: "Ethereum", issuer: "GBETHKBL5TCUTQ3JPDIYOZ5RDARTMHMEKIOFDQO6MSVTKMXSMJEM4YX", icon: "♦", price: "3245.50", change24h: -1.23, volume24h: "456000", liquidity: "180000", marketCap: "390000000", isNative: false },
  { code: "BTC", name: "Bitcoin", issuer: "GBBTCUO3RB3CQ3JN2Z6JX2Z7QG3Z6JX2Z7QG3Z6JX2Z7QG3Z6JX2Z7", icon: "₿", price: "67890.00", change24h: 0.85, volume24h: "678000", liquidity: "250000", marketCap: "1340000000", isNative: false },
];

/**
 * Assets page showing token list and market data.
 */
export function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof AssetRow>("volume24h");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredAssets = useMemo(() => {
    let assets = sampleAssets;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      assets = assets.filter(
        (a) =>
          a.code.toLowerCase().includes(query) ||
          a.name.toLowerCase().includes(query),
      );
    }

    return [...assets].sort((a, b) => {
      const aVal = parseFloat(String(a[sortField]) || "0");
      const bVal = parseFloat(String(b[sortField]) || "0");
      return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [searchQuery, sortField, sortDirection]);

  const handleSort = (field: keyof AssetRow) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Assets</h1>
        <p className="text-gray-400">Explore Stellar assets and their market data</p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search assets by name or symbol..."
          prefix={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>

      {/* Assets Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th
                  className="text-right px-5 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort("price")}
                >
                  Price {sortField === "price" ? (sortDirection === "desc" ? "↓" : "↑") : ""}
                </th>
                <th
                  className="text-right px-5 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort("change24h")}
                >
                  24h Change {sortField === "change24h" ? (sortDirection === "desc" ? "↓" : "↑") : ""}
                </th>
                <th
                  className="text-right px-5 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort("volume24h")}
                >
                  Volume (24h) {sortField === "volume24h" ? (sortDirection === "desc" ? "↓" : "↑") : ""}
                </th>
                <th
                  className="text-right px-5 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort("liquidity")}
                >
                  Liquidity {sortField === "liquidity" ? (sortDirection === "desc" ? "↓" : "↑") : ""}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.code}
                  className="hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                          asset.isNative
                            ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                            : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                        }`}
                      >
                        {asset.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {asset.code}
                          </span>
                          {asset.isNative && (
                            <Badge variant="info" size="sm">Native</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{asset.name}</p>
                        {!asset.isNative && (
                          <p className="text-xs text-gray-600 font-mono mt-0.5">
                            {formatAddress(asset.issuer, 4)}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-mono text-white">
                      {formatUsd(asset.price)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span
                      className={`text-sm font-mono ${
                        asset.change24h >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {asset.change24h >= 0 ? "+" : ""}
                      {asset.change24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-mono text-gray-300">
                      {formatCompactNumber(asset.volume24h)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-mono text-gray-300">
                      {formatCompactNumber(asset.liquidity)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No assets found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
