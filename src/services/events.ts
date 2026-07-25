/**
 * OrbitSwap Pro - Event Service
 *
 * Service for real-time blockchain event polling and synchronization.
 * Handles polling, reconnection, deduplication, and state reconciliation.
 */

import { config } from "../config";
import { getHorizonServer } from "./stellar";
import type { BlockchainEvent, EventType, ContractName } from "../types";

// ─── Types ──────────────────────────────────────────────────────────────────

type EventCallback = (event: BlockchainEvent) => void;
type ConnectionCallback = (connected: boolean) => void;

interface EventSubscription {
  contractName: ContractName;
  eventTypes: EventType[];
  callback: EventCallback;
}

// ─── State ──────────────────────────────────────────────────────────────────

let isPolling = false;
let pollIntervalId: ReturnType<typeof setInterval> | null = null;
let reconnectAttempts = 0;
let isConnected = false;

const subscriptions: EventSubscription[] = [];
const connectionCallbacks: ConnectionCallback[] = [];
const processedEventIds = new Set<string>();

// ─── Event Stream Management ────────────────────────────────────────────────

/**
 * Start polling for blockchain events.
 */
export function startEventPolling(): void {
  if (isPolling) return;
  isPolling = true;

  pollIntervalId = setInterval(async () => {
    try {
      await pollForEvents();
      setConnected(true);
      reconnectAttempts = 0;
    } catch (error) {
      handlePollingError(error);
    }
  }, config.events.pollingInterval);

  setConnected(true);
}

/**
 * Stop polling for blockchain events.
 */
export function stopEventPolling(): void {
  isPolling = false;

  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }

  setConnected(false);
}

/**
 * Restart event polling.
 */
export function restartEventPolling(): void {
  stopEventPolling();
  startEventPolling();
}

// ─── Subscription Management ────────────────────────────────────────────────

/**
 * Subscribe to blockchain events.
 */
export function subscribeToEvents(
  contractName: ContractName,
  eventTypes: EventType[],
  callback: EventCallback,
): () => void {
  const subscription: EventSubscription = {
    contractName,
    eventTypes,
    callback,
  };

  subscriptions.push(subscription);

  // Return unsubscribe function
  return () => {
    const index = subscriptions.indexOf(subscription);
    if (index !== -1) {
      subscriptions.splice(index, 1);
    }
  };
}

/**
 * Subscribe to connection status changes.
 */
export function onConnectionChange(
  callback: ConnectionCallback,
): () => void {
  connectionCallbacks.push(callback);

  // Immediately notify with current status
  callback(isConnected);

  // Return unsubscribe function
  return () => {
    const index = connectionCallbacks.indexOf(callback);
    if (index !== -1) {
      connectionCallbacks.splice(index, 1);
    }
  };
}

/**
 * Get current connection status.
 */
export function getConnectionStatus(): boolean {
  return isConnected;
}

// ─── Event Polling ──────────────────────────────────────────────────────────

/**
 * Poll for new events from the blockchain.
 */
async function pollForEvents(): Promise<void> {
  const server = getHorizonServer();

  try {
    // Poll recent operations from the Horizon network
    const operations = await server
      .operations()
      .limit(20)
      .order("desc")
      .call();

    for (const op of operations.records) {
      const eventId = `op_${op.id}`;

      // Deduplicate
      if (processedEventIds.has(eventId)) continue;

      processedEventIds.add(eventId);

      // Remove old event IDs if the set gets too large
      if (processedEventIds.size > config.events.maxEvents * 2) {
        const idsToRemove = [...processedEventIds].slice(
          0,
          processedEventIds.size - config.events.maxEvents,
        );
        for (const id of idsToRemove) {
          processedEventIds.delete(id);
        }
      }

      // Create blockchain event from operation
      const event: BlockchainEvent = {
        id: eventId,
        type: mapOperationToEventType(op.type),
        contract: "router",
        data: {
          operation_type: op.type,
          source: op.source_account || "",
        },
        txHash: op.transaction_hash || "",
        blockNumber: 0,
        timestamp: Date.now(),
        processed: false,
      };

      // Notify matching subscribers
      for (const subscription of subscriptions) {
        if (subscription.eventTypes.includes(event.type)) {
          try {
            subscription.callback(event);
          } catch {
            // Silently handle subscriber errors
          }
        }
      }
    }
  } catch {
    // Silently handle polling errors
  }
}

/**
 * Map Horizon operation type to application event type.
 */
function mapOperationToEventType(operationType: string): EventType {
  switch (operationType) {
    case "manage_sell_offer":
    case "manage_buy_offer":
    case "path_payment_strict_send":
    case "path_payment_strict_receive":
      return "swap_executed";
    case "change_trust":
      return "liquidity_added";
    case "payment":
      return "fee_collected";
    default:
      return "swap_executed";
  }
}

// ─── Error Handling ─────────────────────────────────────────────────────────

/**
 * Handle polling errors with reconnection logic.
 */
function handlePollingError(_error: unknown): void {
  reconnectAttempts++;

  if (reconnectAttempts >= config.events.maxReconnectAttempts) {
    setConnected(false);
    stopEventPolling();
    return;
  }

  // Exponential backoff for reconnection
  const delay = Math.min(
    config.events.reconnectDelay * Math.pow(2, reconnectAttempts - 1),
    30000,
  );

  setTimeout(() => {
    if (isPolling) return; // Already polling
    startEventPolling();
  }, delay);
}

/**
 * Set connection status and notify callbacks.
 */
function setConnected(connected: boolean): void {
  if (isConnected !== connected) {
    isConnected = connected;
    for (const callback of connectionCallbacks) {
      try {
        callback(connected);
      } catch {
        // Silently handle callback errors
      }
    }
  }
}

// ─── State Management ───────────────────────────────────────────────────────

/**
 * Reset the event service state.
 */
export function resetEventService(): void {
  stopEventPolling();
  subscriptions.length = 0;
  connectionCallbacks.length = 0;
  processedEventIds.clear();
  reconnectAttempts = 0;
  isConnected = false;
}

/**
 * Get the number of processed events.
 */
export function getProcessedEventCount(): number {
  return processedEventIds.size;
}
