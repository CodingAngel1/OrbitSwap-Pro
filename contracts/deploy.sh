#!/bin/bash
# OrbitSwap Pro - Smart Contract Deployment Script
#
# Deploys all 6 Soroban smart contracts to Stellar Testnet.
# Handles cross-contract dependencies by initializing in the correct order.
#
# Prerequisites:
#   - Rust 1.75+ toolchain (with wasm32-unknown-unknown target)
#   - stellar CLI installed (stellar --version)
#   - Funded Stellar Testnet account
#
# Usage:
#   chmod +x contracts/deploy.sh
#   ./contracts/deploy.sh <SECRET_KEY>
#
# Example:
#   ./contracts/deploy.sh SBFVUYCAO735PINOW4KJZ6MQDDXM56TJQXLNMT47MR5E2KI6IPENAWZT

set -euo pipefail

if [ $# -ne 1 ]; then
    echo "Usage: $0 <SECRET_KEY>"
    echo "Example: $0 SBFVUYCAO735PINOW4KJZ6MQDDXM56TJQXLNMT47MR5E2KI6IPENAWZT"
    exit 1
fi

SECRET_KEY="$1"
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"

# Get the public key from the secret key
PUBLIC_KEY=$(stellar keys address --source "${SECRET_KEY}" --network "${NETWORK}" 2>/dev/null || echo "")

echo "🚀 OrbitSwap Pro - Contract Deployment"
echo "=============================================="
echo "Network:    ${NETWORK}"
echo "RPC URL:    ${RPC_URL}"
echo "Public Key: ${PUBLIC_KEY}"
echo "=============================================="

# ─── Helper Functions ──────────────────────────────────────────────────────

find_wasm() {
    local name=$1
    local dir="contracts/${name}"
    local wasm="${dir}/target/wasm32v1-none/release/orbitswap_${name}.wasm"
    
    if [ -f "${wasm}" ]; then
        echo "${wasm}"
        return 0
    fi
    
    # Try alternative paths
    wasm=$(find "${dir}/target" -name "*.wasm" 2>/dev/null | head -1)
    if [ -n "${wasm}" ]; then
        echo "${wasm}"
        return 0
    fi
    
    echo ""
    return 1
}

compile_contract() {
    local name=$1
    echo ""
    echo "📦 Compiling ${name}..."
    
    cd "contracts/${name}"
    cargo build --target wasm32v1-none --release 2>&1 | tail -5
    cd ../..
    
    local wasm_path
    wasm_path=$(find_wasm "${name}")
    if [ -n "${wasm_path}" ]; then
        echo "✅ ${name} compiled: ${wasm_path}"
        return 0
    else
        echo "❌ ${name} WASM not found!"
        return 1
    fi
}

deploy_contract() {
    local name=$1
    echo ""
    echo "📤 Deploying ${name}..."
    
    local wasm_path
    wasm_path=$(find_wasm "${name}")
    if [ -z "${wasm_path}" ]; then
        echo "❌ WASM not found for ${name}. Skipping."
        return 1
    fi
    
    local output
    output=$(stellar contract deploy \
        --wasm "${wasm_path}" \
        --source-account "${SECRET_KEY}" \
        --network "${NETWORK}" \
        2>&1)
    
    # Extract the contract ID from first line of stdout (Stellar strkey format starting with C)
    local contract_id
    contract_id=$(echo "${output}" | grep -oP '^C[A-Z0-9]{55}' | head -1)
    if [ -z "${contract_id}" ]; then
        contract_id=$(echo "${output}" | grep -oP 'contract/[A-Z0-9]+' | head -1 | cut -d/ -f2)
    fi
    
    if [ -n "${contract_id}" ]; then
        echo "✅ ${name} deployed: ${contract_id}"
        echo "${contract_id}"
        return 0
    else
        echo "❌ Failed to deploy ${name}"
        echo "${output}"
        return 1
    fi
}

# ─── Declare Contracts ─────────────────────────────────────────────────────

declare -a CONTRACTS=("liquidity_pool" "treasury" "swap_registry" "event" "fee_vault" "router")
declare -A CONTRACT_IDS

# ─── Step 1: Compile All Contracts ─────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Step 1: Compile All Contracts              ║"
echo "╚══════════════════════════════════════════════╝"

for contract in "${CONTRACTS[@]}"; do
    compile_contract "${contract}"
done

echo ""
echo "✅ All contracts compiled successfully!"

# ─── Step 2: Deploy All Contracts ──────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Step 2: Deploy All Contracts to Testnet    ║"
echo "╚══════════════════════════════════════════════╝"

for contract in "${CONTRACTS[@]}"; do
    id=$(deploy_contract "${contract}")
    if [ -n "${id}" ]; then
        CONTRACT_IDS["${contract}"]="${id}"
    fi
done

echo ""
echo "✅ All contracts deployed!"
echo ""

# Display deployed IDs
for contract in "${!CONTRACT_IDS[@]}"; do
    echo "  ${contract}: ${CONTRACT_IDS[${contract}]}"
done

# ─── Step 3: Initialize All Contracts ──────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Step 3: Initialize Contracts (in order)    ║"
echo "╚══════════════════════════════════════════════╝"

# 3a: Treasury (just needs admin)
if [ -n "${CONTRACT_IDS[treasury]}" ]; then
    echo ""
    echo "  🔧 Initializing Treasury..."
    stellar contract invoke \
        --id "${CONTRACT_IDS[treasury]}" \
        --source "${SECRET_KEY}" \
        --network "${NETWORK}" \
        -- \
        init \
        --admin "${PUBLIC_KEY}" 2>&1 | tail -3
    echo "  ✅ Treasury initialized"
fi

# 3b: SwapRegistry (just needs admin)
if [ -n "${CONTRACT_IDS[swap_registry]}" ]; then
    echo ""
    echo "  🔧 Initializing SwapRegistry..."
    stellar contract invoke \
        --id "${CONTRACT_IDS[swap_registry]}" \
        --source "${SECRET_KEY}" \
        --network "${NETWORK}" \
        -- \
        init \
        --admin "${PUBLIC_KEY}" 2>&1 | tail -3
    echo "  ✅ SwapRegistry initialized"
fi

# 3c: Event (just needs admin)
if [ -n "${CONTRACT_IDS[event]}" ]; then
    echo ""
    echo "  🔧 Initializing Event..."
    stellar contract invoke \
        --id "${CONTRACT_IDS[event]}" \
        --source "${SECRET_KEY}" \
        --network "${NETWORK}" \
        -- \
        init \
        --admin "${PUBLIC_KEY}" 2>&1 | tail -3
    echo "  ✅ Event initialized"
fi

# 3d: LiquidityPool (needs admin + token pair)
if [ -n "${CONTRACT_IDS[liquidity_pool]}" ]; then
    echo ""
    echo "  🔧 Initializing LiquidityPool..."
    stellar contract invoke \
        --id "${CONTRACT_IDS[liquidity_pool]}" \
        --source "${SECRET_KEY}" \
        --network "${NETWORK}" \
        -- \
        init \
        --admin "${PUBLIC_KEY}" \
        --ta '{"code":"XLM","issuer":null}' \
        --tb '{"code":"USDC","issuer":null}' \
        --fee_bps 30 2>&1 | tail -3
    echo "  ✅ LiquidityPool initialized"
fi

# 3e: FeeVault (needs admin + treasury address)
if [ -n "${CONTRACT_IDS[fee_vault]}" ] && [ -n "${CONTRACT_IDS[treasury]}" ]; then
    echo ""
    echo "  🔧 Initializing FeeVault..."
    stellar contract invoke \
        --id "${CONTRACT_IDS[fee_vault]}" \
        --source "${SECRET_KEY}" \
        --network "${NETWORK}" \
        -- \
        init \
        --admin "${PUBLIC_KEY}" \
        --treasury "${CONTRACT_IDS[treasury]}" 2>&1 | tail -3
    echo "  ✅ FeeVault initialized"
fi

# 3f: Router (needs admin + all other contract addresses)
if [ -n "${CONTRACT_IDS[router]}" ]; then
    echo ""
    echo "  🔧 Initializing Router (with cross-contract dependencies)..."
    stellar contract invoke \
        --id "${CONTRACT_IDS[router]}" \
        --source "${SECRET_KEY}" \
        --network "${NETWORK}" \
        -- \
        init \
        --admin "${PUBLIC_KEY}" \
        --lp "${CONTRACT_IDS[liquidity_pool]}" \
        --registry "${CONTRACT_IDS[swap_registry]}" \
        --vault "${CONTRACT_IDS[fee_vault]}" \
        --evt "${CONTRACT_IDS[event]}" 2>&1 | tail -3
    echo "  ✅ Router initialized"
fi

echo ""
echo "✅ All contracts initialized!"

# ─── Step 4: Verify Deployments ────────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Step 4: Verify Deployments                 ║"
echo "╚══════════════════════════════════════════════╝"

for contract in "${!CONTRACT_IDS[@]}"; do
    echo "  🔍 ${contract}: ${CONTRACT_IDS[${contract}]}"
done

# ─── Step 5: Save Addresses ───────────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Step 5: Save Contract Addresses to .env    ║"
echo "╚══════════════════════════════════════════════╝"

ENV_FILE=".env"
echo "" >> "${ENV_FILE}"
echo "# === Deployed on $(date) ===" >> "${ENV_FILE}"
echo "# Network: ${NETWORK}" >> "${ENV_FILE}"
echo "# RPC URL: ${RPC_URL}" >> "${ENV_FILE}"

for contract in "${!CONTRACT_IDS[@]}"; do
    # Convert contract name to env var format (e.g., liquidity_pool -> LIQUIDITY_POOL)
    upper=$(echo "${contract}" | tr '[:lower:]' '[:upper:]')
    echo "VITE_CONTRACT_${upper}=${CONTRACT_IDS[${contract}]}" >> "${ENV_FILE}"
    echo "  ✅ VITE_CONTRACT_${upper}=${CONTRACT_IDS[${contract}]}"
done

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   🎉 Deployment Complete!                    ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "Contract addresses saved to ${ENV_FILE}"
echo ""
echo "Summary:"
for contract in "${!CONTRACT_IDS[@]}"; do
    echo "  ${contract}: ${CONTRACT_IDS[${contract}]}"
done
