/**
 * OrbitSwap Pro - Notification Provider
 *
 * Provider component for toast notification management.
 * Handles auto-dismiss, deduplication, and notification lifecycle.
 */

import { type ReactNode, useState, useCallback, useRef, useMemo } from "react";
import {
  NotificationContext,
  type NotificationContextType,
} from "../contexts/NotificationContext";
import type { Notification } from "../types";
import { config } from "../config";

interface NotificationProviderProps {
  children: ReactNode;
}

let notificationCounter = 0;

/**
 * Provider for toast notification state.
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  /**
   * Add a notification to the queue.
   * Returns the notification ID for later removal.
   */
  const addNotification = useCallback(
    (
      notification: Omit<Notification, "id" | "timestamp">,
    ): string => {
      const id = `notif_${++notificationCounter}_${Date.now()}`;
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: Date.now(),
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Auto-dismiss
      const duration = notification.duration ?? config.ui.toastDuration;
      if (duration > 0) {
        const timer = setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
          timersRef.current.delete(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [],
  );

  /**
   * Remove a notification by ID.
   */
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  /**
   * Clear all notifications.
   */
  const clearAll = useCallback(() => {
    setNotifications([]);

    // Clear all timers
    for (const timer of timersRef.current.values()) {
      clearTimeout(timer);
    }
    timersRef.current.clear();
  }, []);

  const value: NotificationContextType = useMemo(
    () => ({
      notifications,
      addNotification,
      removeNotification,
      clearAll,
    }),
    [notifications, addNotification, removeNotification, clearAll],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
