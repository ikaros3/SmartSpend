import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import HomeTab from "./components/tabs/HomeTab";
import LedgerTab from "./components/tabs/LedgerTab";
import StatsTab from "./components/tabs/StatsTab";
import SettingsTab from "./components/tabs/SettingsTab";
import InputModal from "./components/modals/InputModal";
import CategoryModal from "./components/modals/CategoryModal";
import { Header, Navigation } from "./components/layout/Layout";
import { useBudgetData } from "./hooks/useBudgetData";
import { formatCurrency } from "./utils/formatters";

export default function App() {
  const fullMonths = useMemo(() => Array.from({ length: 12 }, (_, i) => `${i + 1}월`), []);
  const [activeTab, setActiveTab] = useState("home");
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  const {
    currentYear, setCurrentYear,
    currentMonth, setCurrentMonth,
    categories, monthlyData, currentData,
    handleSaveItem, deleteItem,
    handleAddCategory, handleDeleteCategory, handleUpdateCategory,
    handleFileUpload, handleDownloadExcel, handleSaveData
  } = useBudgetData(fullMonths);

  const [inputForm, setInputForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "생활비",
    amount: "",
    details: "",
    memo: "",
    type: "variable",
  });

  const handleEditClick = (item) => {
    setEditingId(item.id);
    const [y, m, d] = item.fullDate ? item.fullDate.split("-") : [currentYear, currentMonth.replace("월", ""), item.day];
    setInputForm({
      date: `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
      category: item.category,
      amount: item.amount.toString(),
      details: item.name,
      memo: item.memo || "",
      type: item.type,
    });
    setIsInputModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingId(null);
    const m = parseInt(currentMonth).toString().padStart(2, '0');
    const d = new Date().getDate().toString().padStart(2, '0');
    setInputForm({ date: `${currentYear}-${m}-${d}`, category: categories[0]?.name || "기타", amount: "", details: "", memo: "", type: "variable" });
    setIsInputModalOpen(true);
  };

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen">
      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");
        body { font-family: "Pretendard Variable", sans-serif; }
      `}</style>

      <div className="w-full md:max-w-4xl md:mx-auto md:my-4 md:rounded-[2.5rem] bg-white shadow-2xl flex flex-col h-screen md:h-[95vh] overflow-hidden relative">
        <Header currentYear={currentYear} setCurrentYear={setCurrentYear} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} fullMonths={fullMonths} />

        <main className="flex-1 overflow-hidden bg-gray-50 flex flex-col relative">
          {activeTab === "home" && <HomeTab currentYear={currentYear} currentMonth={currentMonth} monthlyData={monthlyData} currentData={currentData} categories={categories} formatCurrency={formatCurrency} />}
          {activeTab === "ledger" && <LedgerTab currentMonth={currentMonth} currentData={currentData} categories={categories} formatCurrency={formatCurrency} onEdit={handleEditClick} onDelete={(item) => confirm(`'${item.name}' 항목을 삭제하시겠습니까?`) && deleteItem(item.id)} />}
          {activeTab === "stats" && <StatsTab currentYear={currentYear} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} monthlyData={monthlyData} currentData={currentData} categories={categories} fullMonths={fullMonths} />}
          {activeTab === "settings" && <SettingsTab onOpenCategory={() => setIsCategoryModalOpen(true)} onSaveData={handleSaveData} onDownloadExcel={handleDownloadExcel} onFileUpload={handleFileUpload} />}
        </main>

        <div className="absolute bottom-24 right-6 z-20">
          <button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-transform active:scale-95"><Plus size={28} strokeWidth={3} /></button>
        </div>

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <InputModal isOpen={isInputModalOpen} onClose={() => setIsInputModalOpen(false)} onSave={() => { handleSaveItem(inputForm, editingId); setIsInputModalOpen(false); }} editingId={editingId} inputForm={inputForm} setInputForm={setInputForm} categories={categories} />

        <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={categories} onAdd={handleAddCategory} onDelete={handleDeleteCategory} onUpdate={handleUpdateCategory} newName={newCategoryName} setNewName={setNewCategoryName} editingCat={editingCategory} setEditingCat={setEditingCategory} />
      </div>
    </div>
  );
}
