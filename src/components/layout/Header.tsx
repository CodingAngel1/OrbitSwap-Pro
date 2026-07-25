/**
 * OrbitSwap Pro - Header Component
 *
 * Main navigation header with logo, navigation links, wallet connection, and mobile menu.
 */

import { useState, useEffect } from "react";
import { ROUTES } from "../../constants";
import { useWalletContext } from "../../contexts/WalletContext";
import { formatAddress } from "../../utils";
import { Button } from "../ui/Button";

interface NavLink {
  label: string;
  path: string;
  icon: string;
}

const navLinks: NavLink[] = [
  { label: "Swap", path: ROUTES.SWAP, icon: "↔" },
  { label: "Assets", path: ROUTES.ASSETS, icon: "✦" },
  { label: "History", path: ROUTES.HISTORY, icon: "⏱" },
];

/**
 * Main navigation header.
 */
export function Header() {
  const { wallet, isConnected, isConnecting, connect, disconnect, supportedWallets } =
    useWalletContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");

  // Track current path based on hash or pathname
  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.hash ? window.location.hash.slice(1) : window.location.pathname);
    };
    updatePath();
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);

  const handleConnect = async () => {
    if (supportedWallets.length > 0) {
      await connect(supportedWallets[0].id);
    } else {
      await connect();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-white hover:text-indigo-400 transition-colors"
          >
            <span className="text-2xl">🪐</span>
            <span className="hidden sm:inline">OrbitSwap</span>
            <span className="text-indigo-500 text-sm font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full">
              Pro
            </span>
          </a>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={`#${link.path}`}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    currentPath === link.path
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }
                `}
              >
                <span className="mr-1.5" aria-hidden="true">{link.icon}</span>
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Wallet Connection */}
            {isConnected && wallet ? (
              <div className="relative">
                <button
                  onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-white transition-all duration-200"
                  aria-expanded={walletMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
                  <span className="hidden sm:inline">{formatAddress(wallet.address)}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Wallet Menu Dropdown */}
                {walletMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setWalletMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-20 overflow-hidden">
                      <div className="p-4 border-b border-gray-800">
                        <p className="text-xs text-gray-500 mb-1">Connected Wallet</p>
                        <p className="text-sm font-mono text-white break-all">
                          {wallet.address}
                        </p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(wallet.address);
                            setWalletMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          📋 Copy Address
                        </button>
                        <button
                          onClick={() => {
                            disconnect();
                            setWalletMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          🔌 Disconnect
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                isLoading={isConnecting}
                onClick={handleConnect}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-800 pt-4" aria-label="Mobile navigation">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.path}
                  href={`#${link.path}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block px-4 py-3 rounded-xl text-sm font-medium transition-colors
                    ${
                      currentPath === link.path
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }
                  `}
                >
                  <span className="mr-2" aria-hidden="true">{link.icon}</span>
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
