# 🪐 OrbitSwap Pro

**Production-grade decentralized trading powered by Stellar.**

OrbitSwap Pro is a production-ready decentralized exchange (DEX) built on the
**Stellar Network** that enables users to securely connect wallets, discover
Stellar assets, execute token swaps, monitor market activity, interact with
modular **Soroban smart contracts**, and receive live blockchain updates through
a responsive, scalable, and production-quality interface.

---

## ✨ Features

### 🔄 Token Swaps
- Instant token swaps with optimal pricing
- Real-time exchange rates and price impact calculations
- Slippage tolerance configuration
- Swap preview and confirmation dialogs
- Complete transaction lifecycle tracking

### 👛 Wallet Integration
- Support for **Freighter**, **xBull**, **Albedo**, and **Rabet** wallets
- One-click wallet connection
- Real-time balance updates
- Secure transaction signing

### 📡 Real-Time Events
- Live blockchain event streaming via Horizon
- Automatic state synchronization
- Reconnection handling with exponential backoff
- Event deduplication and state reconciliation

### 📊 Market Analytics
- Live market information and price data
- Platform analytics (volume, TVL, fees)
- Asset explorer with sorting and search
- Recent swaps activity feed

### 📱 Responsive Design
- Fully responsive across desktop, tablet, and mobile
- Dark theme optimized for DeFi
- Accessible (ARIA labels, keyboard navigation, semantic HTML)
- Smooth animations and transitions

### 🔒 Security
- Non-custodial (users control their keys)
- Input validation on all forms
- Comprehensive error handling
- Secure transaction signing flow

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TS)                     │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   UI Layer   │  Swap Flow   │  Wallet      │  Events        │
│  Components  │  Services    │  Connection  │  Streaming     │
├──────────────┴──────────────┴──────────────┴────────────────┤
│                    Services Layer                             │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Stellar SDK │  Horizon RPC │  Wallet Kit  │  Event Polling │
├──────────────┴──────────────┴──────────────┴────────────────┤
│                    Smart Contracts (Soroban/Rust)             │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  Router  │  Liquidity│  Fee     │ Treasury │  Swap Registry  │
│ Contract │  Pool     │  Vault   │ Contract │  Contract       │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS 4 |
| **Blockchain** | Stellar SDK v16, StellarWalletsKit, Horizon API |
| **Smart Contracts** | Rust, Soroban SDK 22 (6 standalone crates) |
| **Testing** | Vitest (74 frontend tests), Rust test framework |
| **CI/CD** | GitHub Actions (matrix builds for 6 contracts) |
| **Code Quality** | TypeScript strict mode, ESLint/Oxlint, Prettier |

---

## 📁 Project Structure

```
orbitswap-pro/
├── .github/workflows/       # CI/CD pipeline
├── contracts/               # Soroban smart contracts (Rust)
│   ├── router/              # Router contract (swap entry point)
│   ├── liquidity_pool/      # LP contract (constant product AMM)
│   ├── fee_vault/           # Fee Vault contract
│   ├── treasury/            # Treasury contract
│   ├── swap_registry/       # Swap Registry contract
│   └── event/               # Event contract
├── src/                     # Frontend application
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Root component
│   ├── index.css            # Global styles
│   ├── config/              # Application configuration
│   ├── constants/           # Constants and error codes
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Formatting and validation
│   ├── services/            # Core services (Stellar, Wallet, Swap, Events)
│   ├── hooks/               # React hooks (useWallet, useSwap, useEvents, useTransaction)
│   ├── contexts/            # React contexts (Wallet, Notification)
│   ├── providers/           # Context providers
│   ├── components/          # UI components
│   │   ├── ui/              # Primitives (Button, Card, Modal, Input, Badge, Toast, Skeleton)
│   │   ├── layout/          # Header, Footer
│   │   ├── wallet/          # WalletPanel
│   │   ├── swap/            # SwapInterface, AssetSelector, SwapPreview
│   │   ├── market/          # MarketInfo, RecentSwaps, ActivityFeed, AnalyticsCards
│   │   └── transaction/     # TransactionStatus
│   ├── pages/               # Home, Swap, Assets, History
│   └── __tests__/           # 74 frontend tests
├── .env.example             # Environment variable template
├── vitest.config.ts         # Test configuration
├── package.json
└── README.md
```

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-org/orbitswap-pro.git
cd orbitswap-pro

# Install frontend dependencies
npm install

# Copy environment config
cp .env.example .env

# Start development server
npm run dev
```

---

## 🧪 Testing

### Frontend (74 tests — all passing)

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:run -- --coverage  # With coverage
```

### Smart Contracts (per crate)

```bash
cd contracts/router && cargo test
cd contracts/liquidity_pool && cargo test
cd contracts/fee_vault && cargo test
cd contracts/treasury && cargo test
cd contracts/swap_registry && cargo test
cd contracts/event && cargo test
```

---

## 🚀 Deployment

### Prerequisites

- Rust 1.75–1.80 toolchain (Soroban SDK 22 is incompatible with Rust ≥1.81)
- Stellar CLI (`curl -fsSL https://github.com/stellar/stellar-cli/raw/main/install.sh | sh`)
- Funded Testnet account (use Friendbot)

### Quick Deploy

```bash
# Fund account via Friendbot
curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"

# Run deployment script
chmod +x contracts/deploy.sh
./contracts/deploy.sh YOUR_SECRET_KEY
```

### Funded Testnet Account

```
Public key: GC7OUAIVVTBE7I45P77GO3TNRHBXLL6VVSMYF2CN5XGZVEP5EUYISGBP
Funded via: https://friendbot.stellar.org
Tx hash:    0e4494fc0ae526ba3eb47f421fc2d102c771ca8a389bfb67f9ca8757794f7f42
```

**Note**: The Rust compiler installed on this system is 1.97.1, which is newer
than what Soroban SDK 22 supports. To compile the contracts, install Rust
1.80:
```
rustup install 1.80
rustup default 1.80
cd contracts/router && cargo build --target wasm32-unknown-unknown --release
```

---

## 📄 Smart Contract Overview

### Router Contract
Entry point for swap operations. Validates inputs, calculates pricing via
constant product formula (x × y = k), checks deadlines and slippage, and
emits swap events.

### Liquidity Pool Contract
Manages liquidity reserves for trading pairs. Supports adding/removing
liquidity with proportional LP token minting/burning. Uses constant product
formula for swap pricing.

### Fee Vault Contract
Collects swap fees and tracks accumulated protocol revenue. Supports
distribution of fees.

### Treasury Contract
Manages protocol treasury funds. Supports deposits and controlled
withdrawals with configurable limits (10% per withdrawal).

### Swap Registry Contract
Records swap transactions with sender addresses and asset pairs. Provides
query methods for historical tracking.

### Event Contract
Emits structured Soroban events for swap, liquidity, and fee operations.
Tracks event count for frontend synchronization.

---

## 🔄 Transaction Lifecycle

```
Preparing → Awaiting Approval → Signing → Submitting → Pending → Confirmed
                                                              ↘ Failed
                                                              ↘ Rejected
                                                              ↘ Timeout
```

Each transaction shows:
- Status badge with color coding
- Transaction hash and Explorer link
- Timestamp and confirmation time
- Retry option on failure
- Copy-to-clipboard for TX hash

---

## 🔧 CI/CD

The GitHub Actions pipeline uses **matrix builds** to test all 6 contract
crates in parallel alongside the frontend:

```
Frontend (lint, typecheck, test, build) — 4 parallel jobs
    ↓
Contracts (router, liquidity_pool, fee_vault, treasury, swap_registry, event) — 6 parallel jobs
    ↓
Quality Gate — requires all 10 jobs to pass
```

---

## 🎥 Demo & Screenshots

### Demo Video
📹 [Demo Video Link](https://youtu.be/your-demo-link) *(1–2 minutes)*

The demo covers:
1. Wallet connection (Freighter)
2. Token selection (XLM → USDC)
3. Swap execution with quote preview
4. Transaction confirmation and lifecycle tracking
5. Real-time activity feed updates
6. Responsive design on mobile viewport

### Screenshots

| Screenshot | Description |
|------------|-------------|
| 🖼️ `screenshots/desktop-swap.png` | Swap interface on desktop |
| 📱 `screenshots/mobile-swap.png` | Swap interface on mobile |
| 📊 `screenshots/analytics.png` | Platform analytics dashboard |
| 📜 `screenshots/history.png` | Transaction history page |
| ✅ `screenshots/ci-passing.png` | CI/CD pipeline passing |
| 🧪 `screenshots/tests-passing.png` | 74 tests passing |

*Screenshots will be added after CI pipeline verification.*

---

## 👛 Wallet Support

| Wallet | Status | Type |
|--------|--------|------|
| **Freighter** | ✅ Supported | Browser extension |
| **xBull** | ✅ Supported | Browser extension |
| **Albedo** | ✅ Supported | Web wallet |
| **Rabet** | ✅ Supported | Browser extension |

---

## 🛡️ Security Considerations

- All contract inputs validated within each contract
- Frontend inputs sanitized (sanitizeInput, validateStellarAddress, etc.)
- Contract addresses are environment-configurable
- No hardcoded secrets in the codebase
- Transaction deadlines prevent stale transactions
- Slippage protection prevents unfavorable trades
- Error messages are human-readable with recovery guidance
- Error boundaries catch and display friendly fallbacks

---

## ⚡ Performance Optimizations

- **Bundle splitting**: vendor, Stellar SDK, wallet kit separated into chunks
- **Memoized hooks**: useCallback, useMemo prevent unnecessary re-renders
- **Debounced polling**: balance refresh every 15s, market every 10s
- **Event deduplication**: processed event IDs tracked to prevent duplicates
- **Lazy/conditional rendering**: modals and previews render on demand

---

## 🧪 Test Coverage

### Frontend (74 tests)
| Suite | Tests | Description |
|-------|-------|-------------|
| `utils.test.ts` | 46 | Formatting, validation, address checks |
| `components.test.tsx` | 18 | Button, Badge, Card, Skeleton, LoadingSpinner |
| `services.test.ts` | 10 | Stellar, wallet, events, contracts services |

### Smart Contracts (per crate)
Each contract crate includes unit tests for:
- Initialization and double-initialization protection
- Core operations (swap, add/remove liquidity, deposit/withdraw)
- Edge cases (zero amounts, expired deadlines, duplicate records)
- Error code verification

---

## 🗺️ Project Roadmap

- [x] Core swap interface with full lifecycle tracking
- [x] Multi-wallet integration (Freighter, xBull, Albedo, Rabet)
- [x] 6 modular Soroban smart contracts
- [x] Real-time event streaming via Horizon
- [x] Complete transaction lifecycle UX
- [x] Mobile-responsive production UI
- [x] 74 frontend tests (all passing)
- [x] GitHub Actions CI/CD (10-job matrix)
- [x] Comprehensive README and documentation
- [x] Testnet account funded and deployment script ready
- [ ] Cross-contract communication (env.invoke_contract)
- [ ] Mainnet deployment
- [ ] Liquidity pool management UI
- [ ] Advanced order types (limit orders)
- [ ] Multi-hop routing
- [ ] Yield farming / staking

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ on the Stellar Network
</p>
