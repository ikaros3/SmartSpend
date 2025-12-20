import React from "react";
import { Plus } from "lucide-react";
import { useBudgetContext } from "./context/BudgetContext";
import { useBudget } from "./hooks/useBudget";

// Layout
import Header from "./components/layout/Header";
import Navigation from "./components/layout/Navigation";

// Views
import HomeView from "./components/views/HomeView";
import LedgerView from "./components/views/LedgerView";
import StatsView from "./components/views/StatsView";
import SettingsView from "./components/views/SettingsView";

// Modals
import ItemInputModal from "./components/modals/ItemInputModal";
import CategoryManageModal from "./components/modals/CategoryManageModal";

// Common
import Toast from "./components/common/Toast";

export default function App() {
  const { activeTab } = useBudgetContext();
  const { openCreateModal } = useBudget();

  const renderView = () => {
    switch (activeTab) {
      case "home":
        return <HomeView />;
      case "ledger":
        return <LedgerView />;
      case "stats":
        return <StatsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen">
      <div className="w-full md:max-w-4xl md:mx-auto md:my-4 md:rounded-[2.5rem] bg-white shadow-2xl flex flex-col h-screen md:h-[95vh] overflow-hidden relative transition-all duration-300">
        <Header />

        <main className="flex-1 overflow-hidden bg-gray-50 flex flex-col relative">
          {renderView()}
        </main>

        <Navigation />

        {/* Floating Action Button (FAB) */}
        <div className="absolute bottom-24 md:bottom-28 right-6 z-20">
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl shadow-blue-600/40 transition-transform active:scale-95 flex items-center justify-center"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>

        {/* Modals */}
        <ItemInputModal />
        <CategoryManageModal />

        {/* Toast Notifications */}
        <Toast />
      </div>
    </div>
  );
}
