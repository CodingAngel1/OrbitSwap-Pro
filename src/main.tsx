/**
 * OrbitSwap Pro - Application Entry Point
 *
 * Mounts the React application with error boundary.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * Error boundary fallback component.
 */
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="max-w-md text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-400 text-sm mb-4">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
          <p className="text-xs text-red-400 font-mono">{error.message}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

/**
 * Mount the application with error handling.
 */
function mountApp() {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error("Root element not found. Ensure index.html has a div with id 'root'.");
    return;
  }

  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    // Fallback rendering if the app fails to mount
    rootElement.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#030712;padding:20px;">
        <div style="text-align:center;max-width:400px;">
          <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
          <h1 style="color:white;font-size:20px;margin-bottom:8px;">Failed to load application</h1>
          <p style="color:#9CA3AF;font-size:14px;margin-bottom:16px;">
            ${error instanceof Error ? error.message : "An unexpected error occurred."}
          </p>
          <button onclick="location.reload()" style="padding:12px 24px;background:#6366F1;color:white;border:none;border-radius:12px;cursor:pointer;font-size:14px;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}

mountApp();
