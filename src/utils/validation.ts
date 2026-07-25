/**
 * OrbitSwap Pro - Validation Utilities
 *
 * Input validation for all user-facing forms and contract interactions.
 */

import { NATIVE_ASSET } from "../constants";
import { config } from "../config";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a Stellar public key address.
 */
export function validateStellarAddress(address: string): ValidationResult {
  if (!address || address.trim().length === 0) {
    return { valid: false, error: "Address is required." };
  }

  const trimmed = address.trim();

  // Stellar addresses start with G and are 56 characters long
  if (!trimmed.startsWith("G")) {
    return { valid: false, error: "Invalid Stellar address format." };
  }

  if (trimmed.length !== 56) {
    return { valid: false, error: "Address must be 56 characters long." };
  }

  // Validate base32 encoding
  const validChars = /^[GABCDEFGHIJKLMNOPQRSTUVWXYZ234567]+$/;
  if (!validChars.test(trimmed)) {
    return { valid: false, error: "Address contains invalid characters." };
  }

  return { valid: true };
}

/**
 * Validate a swap amount.
 */
export function validateSwapAmount(
  amount: string,
  balance?: string,
): ValidationResult {
  if (!amount || amount.trim() === "") {
    return { valid: false, error: "Amount is required." };
  }

  const parsed = parseFloat(amount);
  if (isNaN(parsed)) {
    return { valid: false, error: "Invalid amount format." };
  }

  if (parsed <= 0) {
    return { valid: false, error: "Amount must be greater than zero." };
  }

  if (parsed < config.swap.minSwapAmount) {
    return {
      valid: false,
      error: `Minimum swap amount is ${config.swap.minSwapAmount}.`,
    };
  }

  if (parsed > config.swap.maxSwapAmount) {
    return {
      valid: false,
      error: `Maximum swap amount is ${config.swap.maxSwapAmount}.`,
    };
  }

  if (balance !== undefined) {
    const balanceParsed = parseFloat(balance);
    if (isNaN(balanceParsed)) {
      return { valid: false, error: "Unable to verify balance." };
    }
    if (parsed > balanceParsed) {
      return { valid: false, error: "Insufficient balance." };
    }
  }

  return { valid: true };
}

/**
 * Validate slippage tolerance.
 */
export function validateSlippage(slippage: number): ValidationResult {
  if (isNaN(slippage)) {
    return { valid: false, error: "Invalid slippage value." };
  }

  if (slippage < 0.01) {
    return { valid: false, error: "Slippage must be at least 0.01%." };
  }

  if (slippage > 50) {
    return { valid: false, error: "Slippage must not exceed 50%." };
  }

  return { valid: true };
}

/**
 * Validate swap deadline.
 */
export function validateDeadline(minutes: number): ValidationResult {
  if (isNaN(minutes)) {
    return { valid: false, error: "Invalid deadline." };
  }

  if (minutes < 1) {
    return { valid: false, error: "Deadline must be at least 1 minute." };
  }

  if (minutes > 60) {
    return { valid: false, error: "Deadline must not exceed 60 minutes." };
  }

  return { valid: true };
}

/**
 * Validate an asset code.
 */
export function validateAssetCode(code: string): ValidationResult {
  if (!code || code.trim().length === 0) {
    return { valid: false, error: "Asset code is required." };
  }

  const trimmed = code.trim().toUpperCase();

  if (trimmed.length < 1 || trimmed.length > 12) {
    return { valid: false, error: "Asset code must be 1-12 characters." };
  }

  if (!/^[A-Z0-9]+$/.test(trimmed)) {
    return { valid: false, error: "Asset code must be alphanumeric." };
  }

  return { valid: true };
}

/**
 * Validate a swap pair (input and output assets must be valid and different).
 */
export function validateSwapPair(
  inputAsset: string,
  outputAsset: string,
): ValidationResult {
  if (!inputAsset || !outputAsset) {
    return { valid: false, error: "Please select both input and output assets." };
  }

  if (inputAsset === outputAsset) {
    return {
      valid: false,
      error: "Input and output assets must be different.",
    };
  }

  return { valid: true };
}

/**
 * Validate recipient address for swap (optional, but must be valid if provided).
 */
export function validateRecipient(address: string): ValidationResult {
  if (!address || address.trim().length === 0) {
    return { valid: true }; // Recipient is optional
  }

  return validateStellarAddress(address);
}

/**
 * Sanitize a string input to prevent injection.
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove HTML tags
    .slice(0, 256); // Limit length
}

/**
 * Validate contract ID format.
 */
export function validateContractId(contractId: string): ValidationResult {
  if (!contractId || contractId.trim().length === 0) {
    return { valid: false, error: "Contract ID is required." };
  }

  // Contract IDs are typically 56 hex characters
  if (!/^[0-9a-f]{56}$/i.test(contractId.trim())) {
    return { valid: false, error: "Invalid contract ID format." };
  }

  return { valid: true };
}

/**
 * Validate network passphrase.
 */
export function validateNetworkPassphrase(
  passphrase: string,
): boolean {
  const validPassphrases = [
    "Public Global Stellar Network ; September 2015",
    "Test SDF Network ; September 2015",
    "Test SDF Future Network ; October 2022",
  ];
  return validPassphrases.includes(passphrase);
}
