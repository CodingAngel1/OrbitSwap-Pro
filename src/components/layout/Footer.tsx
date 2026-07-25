/**
 * OrbitSwap Pro - Footer Component
 *
 * Application footer with links, socials, and legal information.
 */

import { config } from "../../config";

/**
 * Application footer.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🪐</span>
              <span className="text-lg font-bold text-white">OrbitSwap Pro</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              {config.app.description}
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <a href="#/swap" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Swap
                </a>
              </li>
              <li>
                <a href="#/assets" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Assets
                </a>
              </li>
              <li>
                <a href="#/history" className="text-sm text-gray-400 hover:text-white transition-colors">
                  History
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Stellar Network
                </a>
              </li>
              <li>
                <a
                  href="https://soroban.stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Soroban
                </a>
              </li>
              <li>
                <a
                  href="https://stellar.expert"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Stellar Expert
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} OrbitSwap Pro. Built on Stellar.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-500">
                Network: {config.network.name}
              </span>
              <span className="text-sm text-gray-500">v{config.app.version}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
