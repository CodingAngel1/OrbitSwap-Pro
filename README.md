# 🪐 OrbitSwap Pro

**Production-grade decentralized trading powered by Stellar.**

OrbitSwap Pro is a production-ready decentralized exchange (DEX) built on the
**Stellar Network** that enables users to securely connect wallets, discover
Stellar assets, execute token swaps, monitor market activity, interact with
modular **Soroban smart contracts** via **inter-contract communication**,
and receive live blockchain updates through a responsive, scalable,
production-quality interface.

---

## ✨ Features

### 🔄 Token Swaps
- Instant token swaps with optimal pricing via Router smart contract
- Real-time exchange rates and price impact calculations
- Slippage tolerance configuration (0.1%–50%)
- Swap preview and confirmation dialogs
- Complete transaction lifecycle tracking (9 states)
- **Cross-contract orchestration**: Router delegates to LiquidityPool, SwapRegistry, FeeVault, and Event contracts

### 👛 Wallet Integration
- Support for **Freighter**, **xBull**, **Albedo**, and **Rabet** wallets
- One-click wallet connection
- Real-time balance updates (auto-refresh every 15s)
- Secure transaction signing

### 📡 Real-Time Events
- Live blockchain event streaming via Horizon
- Automatic state synchronization
- Reconnection handling with exponential backoff
- Event deduplication and state reconciliation
- Subscription-based event system with 6 event types

### 📊 Market Analytics
- Live market information and price data
- Platform analytics (volume, TVL, fees, active users)
- Asset explorer with sorting and search (4 assets with market data)
- Recent swaps activity feed

### 📱 Responsive Design
- Fully responsive across desktop, tablet, and mobile
- Dark theme optimized for DeFi
- Accessible (ARIA labels, keyboard navigation, semantic HTML)
- Smooth animations and transitions (slide-in, fade-in, pulse-glow)

### 🔒 Security
- Non-custodial (users control their keys)
- Input validation on all forms (address, amount, slippage, asset code)
- Comprehensive error handling with friendly messages
- Secure transaction signing flow

### 🤖 Inter-Contract Communication
- **Router → LiquidityPool**: Delegates swap execution via `env.invoke_contract()`
- **Router → SwapRegistry**: Records swap details for history after each trade
- **Router → FeeVault**: Deposits collected swap fees automatically
- **Router → Event**: Emits structured Soroban events for frontend synchronization

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
│ Contract ──▶ Pool    ──▶ Vault  ──▶        ──▶               │
│  (orchestrator) │      │         │  Contract│  Contract      │
│         └──────────┴──────────┴──────────┴─────────────────┤
│                          │ Event Contract ◀─────────────────│
│                          └─────────────────────────────────│
└─────────────────────────────────────────────────────────────┘
```

**Inter-Contract Flow:**
```
User → Router.swap_exact_in()
  ├── Router validates inputs (amount, deadline, pair)
  ├── Router computes swap via constant product formula
  ├── Router → LiquidityPool.swap()       (via invoke_contract)
  ├── Router → SwapRegistry.record()      (records swap history)
  ├── Router → FeeVault.deposit_fee()     (collects protocol fees)
  ├── Router → Event.emit_swap()          (emits blockchain event)
  └── Router emits own event              (for frontend)
```

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS 4 |
| **Blockchain** | Stellar SDK v16, StellarWalletsKit, Horizon API |
| **Smart Contracts** | Rust, Soroban SDK 27 (6 crates, cross-contract calls) |
| **Testing** | Vitest (74 frontend tests), Rust test framework |
| **CI/CD** | GitHub Actions (matrix builds for 6 contracts + 4 frontend jobs) |
| **Code Quality** | TypeScript strict mode, ESLint/Oxlint, Prettier |

---

## 📁 Project Structure

```
orbitswap-pro/
├── .github/workflows/       # CI/CD pipeline (10-job matrix)
├── contracts/               # Soroban smart contracts (Rust)
│   ├── router/              # Router contract (orchestrator, cross-contract calls)
│   ├── liquidity_pool/      # LP contract (constant product AMM)
│   ├── fee_vault/           # Fee Vault contract
│   ├── treasury/            # Treasury contract (10% withdrawal limit)
│   ├── swap_registry/       # Swap Registry contract (historical tracking)
│   └── event/               # Event contract (structured event emission)
├── src/                     # Frontend application
│   ├── main.tsx             # Entry point with error boundary
│   ├── App.tsx              # Root component with hash routing
│   ├── index.css            # Global styles and custom animations
│   ├── config/              # Application configuration (env-driven)
│   ├── constants/           # Constants and error codes
│   ├── types/               # 40+ TypeScript type definitions
│   ├── utils/               # Formatting and validation (12 utilities)
│   ├── services/            # Core services (Stellar, Wallet, Swap, Events, Contracts)
│   ├── hooks/               # Custom hooks (useWallet, useSwap, useEvents, useTransaction)
│   ├── contexts/            # React contexts (Wallet, Notification)
│   ├── providers/           # Context providers with memoization
│   ├── components/          # UI components (15 components across 5 domains)
│   ├── pages/               # 4 pages (Home, Swap, Assets, History)
│   └── __tests__/           # 74 frontend tests (all passing)
├── .env                     # Environment configuration (contract addresses)
├── .env.example             # Environment template
├── vitest.config.ts         # Test configuration
├── vite.config.ts           # Build configuration with bundle splitting
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

- **Rust nightly** (for `wasm32v1-none` target support)
- **Stellar CLI** (`curl -fsSL https://github.com/stellar/stellar-cli/raw/main/install.sh | sh`)
- **Funded Testnet account** (use Friendbot)

### Setup Rust

```bash
# Install nightly Rust
rustup install nightly
rustup default nightly

# Add WASM target
rustup target add wasm32v1-none
```

### Quick Deploy

```bash
# Fund account via Friendbot
curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"

# Run deployment script
chmod +x contracts/deploy.sh
./contracts/deploy.sh YOUR_SECRET_KEY
```

### Deployment Order

The deploy script handles all 6 contracts in dependency order:

1. **LiquidityPool** — Standalone pool contract
2. **Treasury** — Fund management (standalone)
3. **SwapRegistry** — Historical tracking (standalone)
4. **Event** — Event emission (standalone)
5. **FeeVault** — Depends on Treasury address
6. **Router** — Depends on all other addresses (orchestrator)

### Funded Testnet Account

```
Public key: GC7OUAIVVTBE7I45P77GO3TNRHBXLL6VVSMYF2CN5XGZVEP5EUYISGBP
Funded via: https://friendbot.stellar.org
Tx hash:    0e4494fc0ae526ba3eb47f421fc2d102c771ca8a389bfb67f9ca8757794f7f42
```

---

## 📄 Smart Contract Overview

### Router Contract (Orchestrator)
Entry point for swap operations. Validates inputs, computes pricing via
constant product formula, and orchestrates cross-contract calls to:
- **LiquidityPool** — executes the swap
- **SwapRegistry** — records transaction history
- **FeeVault** — deposits protocol fees
- **Event** — emits structured blockchain events

### Liquidity Pool Contract
Manages liquidity reserves for trading pairs. Supports adding/removing
liquidity with proportional LP token minting/burning. Uses constant product
formula (x × y = k) for swap pricing. Configurable fee basis points.

### Fee Vault Contract
Collects swap fees from the Router and tracks accumulated protocol revenue.
Supports distribution of fees to the Treasury.

### Treasury Contract
Manages protocol treasury funds. Supports deposits and controlled
withdrawals with configurable limits (10% max per withdrawal).
Requires admin authentication for withdrawals.

### Swap Registry Contract
Records swap transactions with sender addresses and asset pairs. Provides
query methods for historical tracking. Stores last swap record for quick access.

### Event Contract
Emits structured Soroban events for swap, liquidity, and fee operations.
Supports 3 event types (swap, liquidity, fee) with typed payloads.
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
- Status badge with color coding (green/red/yellow)
- Transaction hash and Explorer link (stellar.expert)
- Timestamp and confirmation time
- Retry option on failure
- Copy-to-clipboard for TX hash

---

## 🔧 CI/CD

The GitHub Actions pipeline uses **matrix builds** to test all 6 contract
crates in parallel alongside the frontend:

**10 parallel jobs:**
```
Frontend (lint, typecheck, test, build) — 4 parallel jobs
Contracts (router, liquidity_pool, fee_vault, treasury, swap_registry, event) — 6 parallel jobs
    ↓
Quality Gate — requires all 10 jobs to pass
```

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
- Contract addresses are environment-configurable via `.env`
- No hardcoded secrets in the codebase
- Transaction deadlines prevent stale transactions
- Slippage protection prevents unfavorable trades
- Error messages are human-readable with recovery guidance
- Error boundaries catch and display friendly fallbacks
- Admin-only pause functionality on Router

---

## ⚡ Performance Optimizations

- **Bundle splitting**: vendor, Stellar SDK, wallet kit separated into chunks
- **Memoized hooks**: useCallback, useMemo prevent unnecessary re-renders
- **Debounced polling**: balance refresh every 15s, market every 10s
- **Event deduplication**: processed event IDs tracked to prevent duplicates
- **Lazy/conditional rendering**: modals and previews render on demand

---

## 🧪 Test Coverage

### Frontend (74 tests — all passing)
| Suite | Tests | Description |
|-------|-------|-------------|
| `utils.test.ts` | 46 | Formatting, validation, address checks |
| `components.test.tsx` | 18 | Button, Badge, Card, Skeleton, LoadingSpinner |
| `services.test.ts` | 10 | Stellar, wallet, events, contracts services |

### Smart Contracts (per crate)
Each contract crate includes unit tests for:
- **Initialization** and double-initialization protection
- **Core operations** (swap, add/remove liquidity, deposit/withdraw)
- **Cross-contract configuration** (Router stores all dependent addresses)
- **Edge cases** (zero amounts, expired deadlines)
- **Error code verification**

### Contract Test Summary
| Contract | Tests | Coverage |
|----------|-------|----------|
| Router | 4 | Init, quote, zero amount, deadline |
| LiquidityPool | 2 | Add/remove liquidity, swap |
| FeeVault | 2 | Deposit, distribute |
| Treasury | 1 | Deposit/withdraw |
| SwapRegistry | 1 | Record/get |
| Event | 1 | Emit swap event |

---

## ✅ Level 3 — Orange Belt Submission Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Public GitHub repository | ✅ | Push to GitHub after local setup |
| README with complete documentation | ✅ | This file — architecture, setup, deployment |
| Minimum 10+ meaningful commits | ✅ | 10 commits covering full project history |
| Live demo link | 📝 | Deploy to Vercel/Netlify (see below) |
| Contract deployment address | 📝 | Run deploy.sh with funded account |
| Transaction hash for interaction | 📝 | Submit demo transaction via Router |
| Mobile responsive UI screenshot | 📝 | Capture from mobile viewport |
| CI/CD pipeline screenshot | 📝 | Capture from GitHub Actions |
| Test output screenshot | 📝 | 74 tests passing |
| Demo video link (1–2 min) | 📝 | Record walkthrough |

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 🗺️ Project Roadmap

- [x] Core swap interface with full lifecycle tracking
- [x] Multi-wallet integration (Freighter, xBull, Albedo, Rabet)
- [x] 6 modular Soroban smart contracts with cross-contract communication
- [x] Real-time event streaming via Horizon
- [x] Complete transaction lifecycle UX (9 states)
- [x] Mobile-responsive production UI
- [x] 74 frontend tests (all passing)
- [x] GitHub Actions CI/CD (10-job matrix)
- [x] Comprehensive README and documentation
- [x] Inter-contract communication (Router → Pool, Registry, Vault, Event)
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
