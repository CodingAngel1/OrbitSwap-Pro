/**
 * OrbitSwap Pro - Service Tests
 *
 * Tests for core services.
 */

import { describe, it, expect } from "vitest";
import { getExplorerUrl, assetToString } from "../services/stellar";

// ─── Stellar Service Tests ─────────────────────────────────────────────────

describe("getExplorerUrl", () => {
  it("generates transaction URL", () => {
    const hash = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6";
    const url = getExplorerUrl(hash, "transaction");
    expect(url).toContain("stellar.expert");
    expect(url).toContain(hash);
  });

  it("generates account URL", () => {
    const address = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
    const url = getExplorerUrl(address, "account");
    expect(url).toContain("/account/");
  });

  it("generates contract URL", () => {
    const url = getExplorerUrl("contract123", "contract");
    expect(url).toContain("/contract/");
  });
});

describe("assetToString", () => {
  it("returns code for native asset", () => {
    const result = assetToString({ code: "XLM", issuer: "", decimals: 7 });
    expect(result).toBe("XLM");
  });

  it("returns code:issuer for non-native", () => {
    const result = assetToString({
      code: "USDC",
      issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      decimals: 7,
    });
    expect(result).toContain(":");
    expect(result).toContain("USDC");
  });
});

// ─── Event Service Tests ───────────────────────────────────────────────────

describe("Event Service", () => {
  it("exports required functions", async () => {
    const eventService = await import("../services/events");
    expect(typeof eventService.startEventPolling).toBe("function");
    expect(typeof eventService.stopEventPolling).toBe("function");
    expect(typeof eventService.subscribeToEvents).toBe("function");
    expect(typeof eventService.onConnectionChange).toBe("function");
    expect(typeof eventService.getConnectionStatus).toBe("function");
    expect(typeof eventService.resetEventService).toBe("function");
  });

  it("manages connection status", async () => {
    const eventService = await import("../services/events");

    // Initially not connected
    expect(eventService.getConnectionStatus()).toBe(false);

    // Reset
    eventService.resetEventService();
    expect(eventService.getConnectionStatus()).toBe(false);
  });
});

// ─── Contract Service Tests ────────────────────────────────────────────────

describe("Contracts Service", () => {
  it("exports required functions", async () => {
    const contractsService = await import("../services/contracts");
    expect(typeof contractsService.getContractRegistry).toBe("function");
    expect(typeof contractsService.getContractAddress).toBe("function");
    expect(typeof contractsService.areContractsConfigured).toBe("function");
    expect(typeof contractsService.getDeploymentStatus).toBe("function");
  });

  it("returns contract registry with configured contracts", async () => {
    const contractsService = await import("../services/contracts");
    const registry = contractsService.getContractRegistry();

    expect(registry).toHaveProperty("router");
    expect(registry).toHaveProperty("liquidityPool");
    expect(registry).toHaveProperty("feeVault");
    expect(registry).toHaveProperty("treasury");
    expect(registry).toHaveProperty("swapRegistry");
    expect(registry).toHaveProperty("event");
  });

  it("returns deployment status for all contracts", async () => {
    const contractsService = await import("../services/contracts");
    const statuses = contractsService.getDeploymentStatus();

    expect(statuses.length).toBe(6);
    statuses.forEach((status) => {
      expect(status).toHaveProperty("name");
      expect(status).toHaveProperty("address");
      expect(status).toHaveProperty("status");
    });
  });
});
