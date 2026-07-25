/**
 * OrbitSwap Pro - Toast Component
 *
 * Non-blocking toast notification with auto-dismiss and animations.
 */

import { Z_INDEX } from "../../constants";

interface ToastProps {
  notifications: Array<{
    id: string;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
  }>;
  onDismiss: (id: string) => void;
}

const typeStyles = {
  success: {
    border: "border-green-500/30",
    bg: "bg-green-500/10",
    icon: "text-green-400",
    iconPath:
      "M5 13l4 4L19 7",
  },
  error: {
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    icon: "text-red-400",
    iconPath:
      "M6 18L18 6M6 6l12 12",
  },
  info: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    icon: "text-blue-400",
    iconPath:
      "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  warning: {
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
    icon: "text-yellow-400",
    iconPath:
      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z",
  },
};

/**
 * Toast notification display component.
 */
export function Toast({ notifications, onDismiss }: ToastProps) {
  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 space-y-2 max-w-sm w-full pointer-events-none"
      style={{ zIndex: Z_INDEX.TOAST }}
    >
      {notifications.map((notification) => {
        const style = typeStyles[notification.type];

        return (
          <div
            key={notification.id}
            className={`
              pointer-events-auto
              ${style.bg} ${style.border}
              border rounded-xl p-4
              shadow-xl backdrop-blur-xl
              transform transition-all duration-300
              animate-slide-in
            `}
            role="alert"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`flex-shrink-0 mt-0.5 ${style.icon}`}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={style.iconPath}
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">
                  {notification.title}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {notification.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => onDismiss(notification.id)}
                className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
                aria-label="Dismiss notification"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
