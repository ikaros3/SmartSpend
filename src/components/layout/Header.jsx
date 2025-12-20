import React from "react";
import { Wallet, ChevronDown } from "lucide-react";
import { useBudgetContext } from "../../context/BudgetContext";
import { FULL_MONTHS } from "../../constants";

const Header = () => {
    const { currentYear, setCurrentYear, currentMonth, setCurrentMonth } =
        useBudgetContext();

    return (
        <header className="bg-blue-600 pt-6 pb-4 px-4 shadow-lg rounded-b-xl z-20 shrink-0 flex flex-row items-center justify-between gap-4">
            {/* Left Area: Title & Year */}
            <div className="flex-[3] flex flex-col items-center justify-center gap-2 shrink-0">
                <h1 className="text-lg font-bold tracking-tight flex items-center justify-center gap-1 text-white whitespace-nowrap">
                    <Wallet size={20} className="text-blue-200" />
                    SmartSpend
                </h1>

                {/* Centered Year Selector */}
                <div className="relative group w-full flex justify-center">
                    <button className="flex items-center space-x-1 bg-blue-700/50 hover:bg-blue-700 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-blue-500 text-white">
                        <span>{currentYear}년</span>
                        <ChevronDown size={14} />
                    </button>
                    <div className="absolute top-full mt-1 w-24 bg-white rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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

            {/* Right Area: Month Selection Grid */}
            <div className="flex-[7] grid grid-cols-6 gap-1">
                {FULL_MONTHS.map((month) => (
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
};

export default Header;
