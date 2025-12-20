import React, { useMemo } from "react";
import { useBudgetContext } from "../../context/BudgetContext";
import { useBudget } from "../../hooks/useBudget";
import { formatNumber, formatCurrency } from "../../utils/formatters";
import { FULL_MONTHS } from "../../constants";

const StatsView = () => {
    const { currentYear, currentMonth, setCurrentMonth, categories } = useBudgetContext();
    const { monthlyData, currentData } = useBudget();

    // Bar Chart Logic
    const maxValInData = useMemo(() => {
        return Math.max(...monthlyData.map((d) => d.total)) || 1;
    }, [monthlyData]);

    const chartMax = Math.max(maxValInData, 16000000);
    const getPct = (val) => (val / chartMax) * 100;

    // Pie Chart Logic
    const pieSlices = useMemo(() => {
        const totalToUse = currentData.total;
        if (totalToUse === 0) return [];

        let cumulativePercent = 0;
        const slices = categories
            .map((cat) => {
                const catAmount = currentData.items
                    .filter((i) => i.category === cat.name)
                    .reduce((sum, item) => sum + item.amount, 0);

                if (catAmount === 0) return null;

                const percent = catAmount / totalToUse;
                const startPercent = cumulativePercent;
                cumulativePercent += percent;
                const endPercent = cumulativePercent;

                return {
                    ...cat,
                    amount: catAmount,
                    percent,
                    startPercent,
                    endPercent,
                };
            })
            .filter(Boolean);

        // 카테고리가 없거나 목록에 없는 항목 합산
        const accountedAmount = slices.reduce((sum, s) => sum + s.amount, 0);
        if (accountedAmount < totalToUse) {
            const extraAmount = totalToUse - accountedAmount;
            const percent = extraAmount / totalToUse;
            const startPercent = cumulativePercent;
            cumulativePercent += percent;
            const endPercent = cumulativePercent;

            slices.push({
                id: "other",
                name: "기타",
                icon: "⋯",
                chartColor: "text-gray-400",
                fillColor: "#9ca3af",
                amount: extraAmount,
                percent,
                startPercent,
                endPercent,
            });
        }

        return slices;
    }, [currentData, categories]);

    const getSlicePath = (startPct, endPct) => {
        const startX = Math.cos(2 * Math.PI * startPct);
        const startY = Math.sin(2 * Math.PI * startPct);
        const endX = Math.cos(2 * Math.PI * endPct);
        const endY = Math.sin(2 * Math.PI * endPct);

        if (Math.abs(endPct - startPct) >= 0.9999) {
            return `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0 Z`;
        }

        const largeArcFlag = endPct - startPct > 0.5 ? 1 : 0;
        return `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    };

    return (
        <div className="flex-1 overflow-y-auto pb-24 p-5 flex flex-col space-y-5 animate-in fade-in duration-300">
            {/* Monthly Trend Bar Chart */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h2 className="text-lg font-bold text-gray-800 mb-4">월별 지출 추이</h2>
                <div className="relative h-64 w-full mt-4">
                    {/* Y-axis Labels / Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-end">
                        {[5000000, 10000000, 15000000].map((val) => (
                            <div
                                key={val}
                                className={`absolute w-full border-b ${val === 10000000 ? "border-red-300 border-solid" : "border-dashed border-gray-200"
                                    }`}
                                style={{ bottom: `${getPct(val)}%` }}
                            >
                                <span
                                    className={`absolute -top-3 left-0 text-[10px] bg-white pr-1 ${val === 10000000 ? "font-bold text-red-400" : "text-gray-400"
                                        }`}
                                >
                                    {formatNumber(val / 10000)}만
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end justify-between gap-1 pb-2 pl-8">
                        {FULL_MONTHS.map((month, idx) => {
                            const data = monthlyData[idx];
                            const total = data.total;
                            const isActive = month === currentMonth;
                            const heightPct = getPct(total);
                            const isOverLimit = total > 10000000;
                            return (
                                <div
                                    key={month}
                                    className="flex flex-col items-center justify-end h-full flex-1 group cursor-pointer"
                                    onClick={() => setCurrentMonth(month)}
                                >
                                    <div className="w-full flex-1 flex items-end justify-center relative">
                                        <div
                                            className={`w-full max-w-[32px] rounded-t-sm transition-all duration-500 relative ${isActive
                                                ? isOverLimit
                                                    ? "bg-pink-500 shadow-md"
                                                    : "bg-blue-600 shadow-md"
                                                : isOverLimit
                                                    ? "bg-pink-200 group-hover:bg-pink-300"
                                                    : "bg-blue-100 group-hover:bg-blue-200"
                                                }`}
                                            style={{ height: `${Math.max(heightPct, 4)}%` }}
                                        >
                                            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[9px] font-bold text-gray-600 whitespace-nowrap">
                                                {formatNumber(Math.floor(total / 10000))}만
                                            </div>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-[10px] mt-2 whitespace-nowrap ${isActive ? "font-bold text-gray-800" : "text-gray-400"
                                            }`}
                                    >
                                        {month.replace("월", "")}월
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Expense Analysis Pie Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h2 className="text-lg font-bold text-gray-800 mb-4 self-start">지출 분석</h2>
                <div className="flex flex-row items-center w-full justify-between gap-4">
                    <div className="w-5/12 flex justify-center items-center">
                        <div className="w-[85%] aspect-square relative flex items-center justify-center">
                            <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full transform -rotate-90">
                                {currentData.total === 0 ? (
                                    <circle cx="0" cy="0" r="1" fill="#e5e7eb" />
                                ) : (
                                    pieSlices.map((slice, i) => (
                                        <path
                                            key={i}
                                            d={getSlicePath(slice.startPercent, slice.endPercent)}
                                            fill={slice.fillColor || "#9ca3af"}
                                        />
                                    ))
                                )}
                                <circle cx="0" cy="0" r="0.6" fill="white" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] text-gray-400">총 지출</span>
                                <span className="text-sm md:text-lg font-bold text-gray-800">
                                    {currentData.total > 10000000
                                        ? (currentData.total / 10000000).toFixed(1) + "천만"
                                        : formatNumber(Math.floor(currentData.total / 10000)) + "만"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-7/12 flex flex-col justify-center space-y-3 pl-1">
                        {pieSlices.map((cat) => {
                            return (
                                <div key={cat.id} className="flex justify-between items-center text-sm w-full">
                                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                                        <div
                                            className={`w-6 h-6 rounded flex items-center justify-center text-xs text-white shrink-0 ${cat.chartColor.replace(
                                                "text",
                                                "bg"
                                            )}`}
                                        >
                                            {cat.icon}
                                        </div>
                                        <span className="font-bold text-gray-700 truncate text-[15px]">
                                            {cat.name}
                                        </span>
                                    </div>
                                    <span className="font-bold text-gray-600 whitespace-nowrap text-[13px]">
                                        {formatNumber(Math.round(cat.amount / 10000))}만원
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsView;
