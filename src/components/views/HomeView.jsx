import React from "react";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useBudgetContext } from "../../context/BudgetContext";
import { useBudget } from "../../hooks/useBudget";
import { formatCurrency } from "../../utils/formatters";
import CalendarView from "../CalendarView";

const HomeView = () => {
    const { currentYear, currentMonth, categories } = useBudgetContext();
    const { currentData, prevMonthTotal, diffAmount, upcomingFixedExpenses, monthlyData } = useBudget();

    return (
        <div className="flex-1 overflow-y-auto pb-24 p-5 flex flex-col space-y-5 animate-in fade-in duration-300">
            {/* Total Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden flex flex-col justify-center min-h-[200px]">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
                <p className="text-gray-500 text-sm mb-1 font-medium">
                    {currentYear}년 {currentMonth} 지출
                </p>
                <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
                    {formatCurrency(currentData.total)}
                </h2>
                <div className="mt-6 flex flex-col items-center justify-center space-y-2">
                    {prevMonthTotal > 0 && (
                        <div
                            className={`flex items-center text-xs font-bold px-3 py-1 rounded-full border ${diffAmount > 0
                                    ? "bg-red-50 text-red-600 border-red-100"
                                    : "bg-green-50 text-green-600 border-green-100"
                                }`}
                        >
                            {diffAmount > 0 ? (
                                <TrendingUp size={14} className="mr-1" />
                            ) : (
                                <TrendingDown size={14} className="mr-1" />
                            )}
                            지난달보다 {formatCurrency(Math.abs(diffAmount))}{" "}
                            {diffAmount > 0 ? "더 썼어요 🔺" : "덜 썼어요 📉"}
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Fixed Expenses Summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center">
                    <AlertCircle size={16} className="text-blue-500 mr-2" />
                    지출 예정 고정비 (이번달)
                </h3>
                {upcomingFixedExpenses.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingFixedExpenses.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between items-center text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs">
                                        {item.day}일
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-700">{item.name}</p>
                                        <p className="text-xs text-gray-400">{item.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-800">
                                        {formatCurrency(item.amount)}
                                    </p>
                                    <p className="text-xs text-red-500">
                                        D-{Math.max(0, item.day - new Date().getDate())}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div className="pt-2 text-center">
                            <p className="text-xs text-gray-500">
                                총{" "}
                                <span className="font-bold text-blue-600">
                                    {formatCurrency(
                                        upcomingFixedExpenses.reduce((a, b) => a + b.amount, 0)
                                    )}
                                </span>
                                이 더 나갈 예정입니다.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-400 text-xs">
                        남은 고정 지출이 없습니다.
                    </div>
                )}
            </div>

            {/* Calendar Component */}
            <div className="mt-5 pb-5">
                <CalendarView
                    currentYear={currentYear}
                    currentMonth={currentMonth}
                    monthlyData={monthlyData}
                    categories={categories}
                    formatCurrency={formatCurrency}
                />
            </div>
        </div>
    );
};

export default HomeView;
