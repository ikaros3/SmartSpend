import React, { useMemo } from "react";
import CalendarView from "../CalendarView";
import { formatCurrency } from "../../utils/formatters";
import { TrendingUp, TrendingDown, Landmark } from "lucide-react";

const HomeTab = ({ currentYear, currentMonth, monthlyData, currentData, categories, formatCurrency }) => {
    const fullMonths = useMemo(() => Array.from({ length: 12 }, (_, i) => `${i + 1}월`), []);

    const prevMonthIndex = fullMonths.indexOf(currentMonth) - 1;
    const prevDataKey = prevMonthIndex >= 0 ? `${currentYear}-${parseInt(fullMonths[prevMonthIndex].replace("월", ""))}\uC6D4` : null;
    const prevMonthTotal = (monthlyData[prevDataKey] || { total: 0 }).total;
    const diffAmount = currentData.total - prevMonthTotal;

    const upcomingFixed = useMemo(() => {
        const now = new Date();
        const today = now.getDate();
        const currentM = now.getMonth() + 1;
        const selectedM = parseInt(currentMonth.replace("월", ""));
        const selectedY = currentYear;
        const currentY = now.getFullYear();

        if (selectedY < currentY || (selectedY === currentY && selectedM < currentM)) return [];
        if (selectedY === currentY && selectedM === currentM) {
            return currentData.items.filter(i => i.type === "fixed" && i.day && i.day >= today).sort((a, b) => a.day - b.day);
        }
        return currentData.items.filter(i => i.type === "fixed" && i.day).sort((a, b) => a.day - b.day);
    }, [currentData, currentMonth, currentYear]);

    return (
        <div className="flex-1 overflow-y-auto pb-24 p-5 flex flex-col space-y-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden flex flex-col justify-center min-h-[200px]">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
                <p className="text-gray-500 text-sm mb-1 font-medium">{currentYear}년 {currentMonth} 지출</p>
                <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">{formatCurrency(currentData.total)}</h2>
                <div className="mt-6 flex flex-col items-center justify-center space-y-2">
                    {prevMonthIndex >= 0 && (
                        <div className={`flex items-center gap-1 content-center px-4 py-1.5 rounded-full text-xs font-bold ${diffAmount > 0 ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}>
                            {diffAmount > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            저번달보다 {formatCurrency(Math.abs(diffAmount))} {diffAmount > 0 ? "많음" : "적음"}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                        <Landmark size={18} className="text-blue-500" /> 지출 예정 고정비 ({currentMonth})
                    </h3>
                </div>
                {upcomingFixed.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingFixed.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs">{item.day}일</div>
                                    <div>
                                        <p className="font-medium text-gray-700">{item.name}</p>
                                        <p className="text-xs text-gray-400">{item.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-800">{formatCurrency(item.amount)}</p>
                                    <p className="text-xs text-red-500">D-{Math.max(0, item.day - new Date().getDate())}</p>
                                </div>
                            </div>
                        ))}
                        <div className="pt-2 text-center">
                            <p className="text-xs text-gray-500">총 <span className="font-bold text-blue-600">{formatCurrency(upcomingFixed.reduce((a, b) => a + b.amount, 0))}</span>이 더 나갈 예정입니다.</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-400 text-xs">남은 고정 지출이 없습니다.</div>
                )}
            </div>

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

export default HomeTab;
