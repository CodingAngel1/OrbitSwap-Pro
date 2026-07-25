/**
 * OrbitSwap Pro - useEvents Hook
 *
 * Hook for consuming blockchain events and real-time updates.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { BlockchainEvent, EventType } from "../types";
import {
  startEventPolling,
  stopEventPolling,
  subscribeToEvents,
  onConnectionChange,
  getConnectionStatus,
  resetEventService,
} from "../services/events";
import { config } from "../config";

interface UseEventsReturn {
  events: BlockchainEvent[];
  isConnected: boolean;
  recentEvents: BlockchainEvent[];
  latestSwapEvents: BlockchainEvent[];
  latestLiquidityEvents: BlockchainEvent[];
  addEvent: (event: BlockchainEvent) => void;
  clearEvents: () => void;
  startPolling: () => void;
  stopPolling: () => void;
}

const MAX_EVENTS = config.events.maxEvents;

/**
 * Hook for real-time blockchain event consumption.
 */
export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [isConnected, setIsConnected] = useState(getConnectionStatus());
  const mountedRef = useRef(true);

  // Subscribe to events
  useEffect(() => {
    const unsub1 = subscribeToEvents(
      "router",
      ["swap_executed"],
      (event) => {
        if (mountedRef.current) {
          setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
        }
      },
    );

    const unsub2 = subscribeToEvents(
      "liquidityPool",
      ["liquidity_added", "liquidity_removed"],
      (event) => {
        if (mountedRef.current) {
          setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
        }
      },
    );

    const unsub3 = subscribeToEvents(
      "feeVault",
      ["fee_collected"],
      (event) => {
        if (mountedRef.current) {
          setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
        }
      },
    );

    const unsubConnection = onConnectionChange((connected) => {
      if (mountedRef.current) {
        setIsConnected(connected);
      }
    });

    return () => {
      mountedRef.current = false;
      unsub1();
      unsub2();
      unsub3();
      unsubConnection();
    };
  }, []);

  // ─── Filtered Event Lists ───────────────────────────────────────────────

  const recentEvents = events.slice(0, 10);
  const latestSwapEvents = events.filter((e) => e.type === "swap_executed").slice(0, 10);
  const latestLiquidityEvents = events
    .filter((e) => e.type === "liquidity_added" || e.type === "liquidity_removed")
    .slice(0, 10);

  // ─── Actions ────────────────────────────────────────────────────────────

  /**
   * Manually add an event to the list.
   */
  const addEvent = useCallback((event: BlockchainEvent) => {
    if (mountedRef.current) {
      setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
    }
  }, []);

  /**
   * Clear all events.
   */
  const clearEvents = useCallback(() => {
    if (mountedRef.current) {
      setEvents([]);
    }
  }, []);

  /**
   * Start polling for events.
   */
  const startPolling = useCallback(() => {
    startEventPolling();
  }, []);

  /**
   * Stop polling for events.
   */
  const stopPolling = useCallback(() => {
    stopEventPolling();
  }, []);

  return {
    events,
    isConnected,
    recentEvents,
    latestSwapEvents,
    latestLiquidityEvents,
    addEvent,
    clearEvents,
    startPolling,
    stopPolling,
  };
}
