/**
 * OrbitSwap Pro - useTransaction Hook
 *
 * Hook for managing transaction lifecycle tracking.
 */

import { useState, useCallback, useRef } from "react";
import type { TransactionLifecycle, TxStatus } from "../types";
import { getExplorerUrl, getTransactionStatus } from "../services/stellar";

interface UseTransactionReturn {
  transactions: TransactionLifecycle[];
  currentTransaction: TransactionLifecycle | null;
  addTransaction: (operation: string, details?: Record<string, string>) => string;
  updateTransaction: (id: string, updates: Partial<TransactionLifecycle>) => void;
  removeTransaction: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  getTransaction: (id: string) => TransactionLifecycle | undefined;
  hasPendingTransactions: boolean;
}

/**
 * Hook for managing transaction lifecycle tracking.
 */
export function useTransaction(): UseTransactionReturn {
  const [transactions, setTransactions] = useState<TransactionLifecycle[]>([]);
  const counterRef = useRef(0);

  /**
   * Add a new transaction to track.
   */
  const addTransaction = useCallback(
    (operation: string, details: Record<string, string> = {}): string => {
      const id = `tx_${++counterRef.current}_${Date.now()}`;
      const now = Date.now();

      const tx: TransactionLifecycle = {
        id,
        operation,
        status: "preparing",
        timestamp: now,
        updatedAt: now,
        details,
      };

      setTransactions((prev) => [tx, ...prev]);
      return id;
    },
    [],
  );

  /**
   * Update an existing transaction.
   */
  const updateTransaction = useCallback(
    (id: string, updates: Partial<TransactionLifecycle>) => {
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === id
            ? {
                ...tx,
                ...updates,
                updatedAt: Date.now(),
                explorerUrl: updates.txHash
                  ? getExplorerUrl(updates.txHash)
                  : tx.explorerUrl,
              }
            : tx,
        ),
      );
    },
    [],
  );

  /**
   * Remove a transaction by ID.
   */
  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  /**
   * Clear all completed transactions.
   */
  const clearCompleted = useCallback(() => {
    setTransactions((prev) =>
      prev.filter(
        (tx) =>
          tx.status !== "confirmed" &&
          tx.status !== "failed" &&
          tx.status !== "rejected" &&
          tx.status !== "timeout",
      ),
    );
  }, []);

  /**
   * Clear all transactions.
   */
  const clearAll = useCallback(() => {
    setTransactions([]);
  }, []);

  /**
   * Get a single transaction by ID.
   */
  const getTransaction = useCallback(
    (id: string): TransactionLifecycle | undefined => {
      return transactions.find((tx) => tx.id === id);
    },
    [transactions],
  );

  /**
   * Check if there are any pending transactions.
   */
  const hasPendingTransactions = transactions.some(
    (tx) =>
      tx.status !== "confirmed" &&
      tx.status !== "failed" &&
      tx.status !== "rejected" &&
      tx.status !== "timeout",
  );

  const currentTransaction = transactions[0] || null;

  return {
    transactions,
    currentTransaction,
    addTransaction,
    updateTransaction,
    removeTransaction,
    clearCompleted,
    clearAll,
    getTransaction,
    hasPendingTransactions,
  };
}
