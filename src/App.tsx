/**
 * OrbitSwap Pro - Main Application Component
 *
 * Root component with routing, providers, and layout.
 */

import { useEffect, useState } from "react";
import { WalletProvider } from "./providers/WalletProvider";
import { NotificationProvider } from "./providers/NotificationProvider";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Toast } from "./components/ui/Toast";
import { startEventPolling, stopEventPolling } from "./services/events";
import { useNotificationContext } from "./contexts/NotificationContext";
import { HomePage } from "./pages/Home";
import { SwapPage } from "./pages/Swap";
import { AssetsPage } from "./pages/Assets";
import { HistoryPage } from "./pages/History";

/**
 * Application content with routing.
 */
function AppContent() {
  const { notifications, removeNotification } = useNotificationContext();
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || "/");

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash.slice(1) || "/");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const renderPage = () => {
    const path = hash.split("?")[0];
    switch (path) {
      case "/swap":
        return <SwapPage />;
      case "/assets":
        return <AssetsPage />;
      case "/history":
        return <HistoryPage />;
      case "/":
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
      <Footer />
      <Toast
        notifications={notifications}
        onDismiss={removeNotification}
      />
    </div>
  );
}

/**
 * Root application component with providers.
 */
export default function App() {
  // Start blockchain event polling on mount
  useEffect(() => {
    startEventPolling();
    return () => {
      stopEventPolling();
    };
  }, []);

  return (
    <NotificationProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </NotificationProvider>
  );
}
