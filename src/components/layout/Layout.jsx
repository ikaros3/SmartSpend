import React from "react";
import { Wallet, ChevronDown, Home, List, PieChart, Settings } from "lucide-react";
import { TabButton } from "../common/UIComponents";

export const Header = ({ currentYear, setCurrentYear, currentMonth, setCurrentMonth, fullMonths }) => (
    <header className="bg-blue-600 pt-6 pb-4 px-4 shadow-lg rounded-b-xl z-20 shrink-0 flex flex-row items-center justify-between gap-4">
        <div className="flex-[3] flex flex-col items-center justify-center gap-2 shrink-0">
            <h1 className="text-lg font-bold tracking-tight flex items-center justify-center gap-1 text-white whitespace-nowrap">
                <Wallet size={20} className="text-blue-200" />
                SmartSpend
            </h1>
            <div className="relative group w-full flex justify-center">
                <button className="flex items-center space-x-1 bg-blue-700/50 hover:bg-blue-700 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-blue-500 text-white">
                    <span>{currentYear}년</span>
                    <ChevronDown size={14} />
                </button>
                <div className="absolute top-full mt-1 w-24 bg-white rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                    {[2024, 2025, 2026].map((year) => (
                        <div
                            key={year}
                            onClick={() => setCurrentYear(year)}
                            className="px-4 py-2 text-sm text-center hover:bg-blue-50 text-gray-700 cursor-pointer"
                        >
                            {year}년
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="flex-[7] grid grid-cols-6 gap-1">
            {fullMonths.map((month) => (
                <button
                    key={month}
                    onClick={() => setCurrentMonth(month)}
                    className={`py-1.5 rounded text-xs font-bold transition-all duration-200 border flex items-center justify-center ${currentMonth === month
                            ? "bg-white text-blue-600 border-white shadow-md scale-105"
                            : "text-blue-100 border-blue-500 hover:bg-blue-500 hover:text-white"
                        }`}
                >
                    {month}
                </button>
            ))}
        </div>
    </header>
);

export const Navigation = ({ activeTab, setActiveTab }) => (
    <nav className="bg-white border-t border-gray-200 h-20 flex justify-around items-center px-2 pb-safe w-full z-30 rounded-t-2xl shadow-[0_-5px_10px_rgba(0,0,0,0.02)] shrink-0 relative">
        <TabButton isActive={activeTab === "home"} onClick={() => setActiveTab("home")} icon={Home} label="홈" />
        <TabButton isActive={activeTab === "ledger"} onClick={() => setActiveTab("ledger")} icon={List} label="내역" />
        <TabButton isActive={activeTab === "stats"} onClick={() => setActiveTab("stats")} icon={PieChart} label="통계" />
        <TabButton isActive={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={Settings} label="설정" />
    </nav>
);
