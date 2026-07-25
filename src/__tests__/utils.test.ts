/**
 * OrbitSwap Pro - Utility Function Tests
 *
 * Comprehensive tests for all utility functions.
 */

import { describe, it, expect } from "vitest";
import {
  formatNumber,
  formatAddress,
  formatTxHash,
  formatRelativeTime,
  formatPercentage,
  formatUsd,
  formatTokenAmount,
  formatExchangeRate,
  formatCompactNumber,
} from "../utils/format";
import {
  validateStellarAddress,
  validateSwapAmount,
  validateSlippage,
  validateAssetCode,
  validateSwapPair,
} from "../utils/validation";

// ─── Format Tests ──────────────────────────────────────────────────────────

describe("formatNumber", () => {
  it("formats basic numbers", () => {
    expect(formatNumber("1234.567")).toBe("1,234.567");
  });

  it("handles zero", () => {
    const result = formatNumber("0");
    expect(result).toBe("0");
  });

  it("handles small numbers", () => {
    const result = formatNumber("0.000001");
    expect(result).toBe("0.000001");
  });

  it("handles NaN", () => {
    expect(formatNumber("invalid")).toBe("0");
  });

  it("handles empty string", () => {
    expect(formatNumber("")).toBe("0");
  });
});

describe("formatAddress", () => {
  it("formats a full Stellar address", () => {
    const address = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
    const formatted = formatAddress(address);
    expect(formatted).toContain("...");
    expect(formatted.length).toBeLessThan(address.length);
  });

  it("returns empty string for empty input", () => {
    expect(formatAddress("")).toBe("");
  });

  it("handles short addresses", () => {
    expect(formatAddress("GABC")).toBe("GABC");
  });
});

describe("formatTxHash", () => {
  it("formats a transaction hash", () => {
    const hash = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6";
    const formatted = formatTxHash(hash);
    expect(formatted).toContain("...");
  });

  it("handles empty hash", () => {
    expect(formatTxHash("")).toBe("");
  });
});

describe("formatPercentage", () => {
  it("formats positive percentages", () => {
    expect(formatPercentage("2.34")).toBe("+2.34%");
  });

  it("formats negative percentages", () => {
    expect(formatPercentage("-1.23")).toBe("-1.23%");
  });

  it("handles zero", () => {
    expect(formatPercentage("0")).toBe("+0.00%");
  });

  it("handles NaN", () => {
    expect(formatPercentage("invalid")).toBe("0%");
  });
});

describe("formatUsd", () => {
  it("formats USD values", () => {
    const result = formatUsd("1234.56");
    expect(result).toContain("$");
  });

  it("handles zero", () => {
    expect(formatUsd("0")).toBe("$0.00");
  });
});

describe("formatTokenAmount", () => {
  it("formats token amount with code", () => {
    const result = formatTokenAmount("1000", "XLM");
    expect(result).toContain("XLM");
  });
});

describe("formatExchangeRate", () => {
  it("formats exchange rate string", () => {
    const result = formatExchangeRate("0.1245", "XLM", "USDC");
    expect(result).toContain("1 XLM ≈");
    expect(result).toContain("USDC");
  });
});

describe("formatCompactNumber", () => {
  it("formats millions", () => {
    expect(formatCompactNumber("1500000")).toBe("1.50M");
  });

  it("formats thousands", () => {
    expect(formatCompactNumber("1500")).toBe("1.50K");
  });

  it("handles small numbers", () => {
    expect(formatCompactNumber("500")).toBe("500");
  });
});

describe("formatRelativeTime", () => {
  it("handles recent times", () => {
    const recent = Date.now() - 30000; // 30 seconds ago
    const result = formatRelativeTime(recent);
    expect(result).toMatch(/\d+s ago/);
  });

  it("handles minutes ago", () => {
    const minutesAgo = Date.now() - 300000; // 5 minutes ago
    const result = formatRelativeTime(minutesAgo);
    expect(result).toMatch(/\d+m ago/);
  });
});

// ─── Validation Tests ──────────────────────────────────────────────────────

describe("validateStellarAddress", () => {
  it("validates correct Stellar address", () => {
    const result = validateStellarAddress("GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN");
    expect(result.valid).toBe(true);
  });

  it("rejects invalid prefix", () => {
    const result = validateStellarAddress("AABCDEFGHIJKLMNOPQRSTUVWXYZ234567");
    expect(result.valid).toBe(false);
  });

  it("rejects short address", () => {
    const result = validateStellarAddress("GABCD");
    expect(result.valid).toBe(false);
  });

  it("rejects empty address", () => {
    const result = validateStellarAddress("");
    expect(result.valid).toBe(false);
  });
});

describe("validateSwapAmount", () => {
  it("validates correct amount", () => {
    const result = validateSwapAmount("100", "500");
    expect(result.valid).toBe(true);
  });

  it("rejects zero amount", () => {
    const result = validateSwapAmount("0");
    expect(result.valid).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = validateSwapAmount("-100");
    expect(result.valid).toBe(false);
  });

  it("rejects amount exceeding balance", () => {
    const result = validateSwapAmount("1000", "500");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Insufficient");
  });

  it("rejects empty amount", () => {
    const result = validateSwapAmount("");
    expect(result.valid).toBe(false);
  });

  it("rejects invalid format", () => {
    const result = validateSwapAmount("abc");
    expect(result.valid).toBe(false);
  });
});

describe("validateSlippage", () => {
  it("validates correct slippage", () => {
    expect(validateSlippage(0.5).valid).toBe(true);
  });

  it("rejects too low slippage", () => {
    expect(validateSlippage(0.001).valid).toBe(false);
  });

  it("rejects too high slippage", () => {
    expect(validateSlippage(51).valid).toBe(false);
  });

  it("rejects NaN", () => {
    expect(validateSlippage(NaN).valid).toBe(false);
  });
});

describe("validateAssetCode", () => {
  it("validates correct asset code", () => {
    expect(validateAssetCode("XLM").valid).toBe(true);
  });

  it("rejects empty code", () => {
    expect(validateAssetCode("").valid).toBe(false);
  });

  it("rejects too long code", () => {
    expect(validateAssetCode("ABCDEFGHIJKLM").valid).toBe(false);
  });

  it("rejects invalid characters", () => {
    expect(validateAssetCode("XL$").valid).toBe(false);
  });
});

describe("validateSwapPair", () => {
  it("validates different assets", () => {
    expect(validateSwapPair("XLM", "USDC").valid).toBe(true);
  });

  it("rejects same asset", () => {
    const result = validateSwapPair("XLM", "XLM");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("different");
  });

  it("rejects missing assets", () => {
    expect(validateSwapPair("", "USDC").valid).toBe(false);
  });
});

// ─── Additional Coverage ───────────────────────────────────────────────────

describe("formatBigInt", () => {
  it("converts bigint to string with decimals", async () => {
    const { formatBigInt } = await import("../utils/format");
    const result = formatBigInt(BigInt("10000000"), 7);
    expect(result).toBe("1.0000000");
  });
});

describe("parseBigInt", () => {
  it("parses string amount to bigint", async () => {
    const { parseBigInt } = await import("../utils/format");
    const result = parseBigInt("1.5", 7);
    expect(result).toBe(BigInt("15000000"));
  });
});
