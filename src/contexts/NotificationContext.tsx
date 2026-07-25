/**
 * OrbitSwap Pro - Notification Context
 *
 * React context for toast notification management.
 */

import { createContext, useContext } from "react";
import type { Notification } from "../types";

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

/**
 * Hook to access notification context.
 * Must be used within a NotificationProvider.
 */
export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider",
    );
  }
  return context;
}
