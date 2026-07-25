/**
 * OrbitSwap Pro - Card Component
 *
 * Reusable card container with consistent styling.
 */

import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
  hover?: boolean;
  onClick?: () => void;
}

const paddingClasses = {
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
  none: "",
};

/**
 * Card container with consistent styling and optional hover effects.
 */
export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={`
        bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl
        ${paddingClasses[padding]}
        ${hover ? "hover:border-gray-700 transition-colors duration-200 cursor-pointer" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
