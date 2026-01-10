import React, { useMemo, useState } from "react";
import { useBudgetContext } from "../../context/BudgetContext";
import { useBudget } from "../../hooks/useBudget";
import { formatNumber, formatCurrency } from "../../utils/formatters";
import { FULL_MONTHS } from "../../constants";
import Chip from "../common/Chip";

const StatsView = () => {
    const { currentYear, currentMonth, setCurrentMonth, categories } = useBudgetContext();
    const { monthlyData, currentData } = useBudget();

    // 카테고리 필터 상태 ("all" = 전체, 또는 카테고리 이름)
    const [selectedCategory, setSelectedCategory] = useState("all");

    // 선택된 카테고리에 따른 월별 데이터 계산
    const filteredMonthlyData = useMemo(() => {
        if (selectedCategory === "all") {
            return monthlyData.map((d) => ({
                ...d,
                filteredTotal: d.total,
            }));
        }

        return monthlyData.map((d) => {
            const filteredTotal = d.items
                .filter((item) => item.category === selectedCategory)
                .reduce((sum, item) => sum + item.amount, 0);
            return {
                ...d,
                filteredTotal,
            };
        });
    }, [monthlyData, selectedCategory]);

    // Bar Chart Logic - 선택된 카테고리 기준으로 최대값 계산
    const maxValInData = useMemo(() => {
        return Math.max(...filteredMonthlyData.map((d) => d.filteredTotal)) || 1;
    }, [filteredMonthlyData]);

    // 전체일 때는 기존 chartMax, 카테고리 선택 시 동적으로 조정
    const chartMax = selectedCategory === "all"
        ? Math.max(maxValInData, 16000000)
        : Math.max(maxValInData * 1.2, 100000); // 카테고리별은 20% 여유 + 최소값

    const getPct = (val) => (val / chartMax) * 100;

    // Y축 라벨 동적 계산
    const yAxisLabels = useMemo(() => {
        if (selectedCategory === "all") {
            return [5000000, 10000000, 15000000];
        }
        // 카테고리별일 때 동적 라벨 생성
        const step = chartMax / 3;
        return [
            Math.round(step),
            Math.round(step * 2),
            Math.round(step * 3 * 0.9),
        ];
    }, [selectedCategory, chartMax]);

    // 선택된 카테고리 정보 가져오기
    const selectedCategoryInfo = useMemo(() => {
        if (selectedCategory === "all") return null;
        return categories.find((c) => c.name === selectedCategory);
    }, [selectedCategory, categories]);

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

    // 금액 포맷팅 함수 (단위 자동 조정)
    const formatAmount = (val) => {
        if (val >= 10000) {
            return formatNumber(Math.floor(val / 10000)) + "만";
        }
        return formatNumber(val);
    };

    return (
        <div className="flex-1 overflow-y-auto pb-24 p-5 flex flex-col space-y-5 animate-in fade-in duration-300">
            {/* Monthly Trend Bar Chart */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-gray-800">월별 지출 추이</h2>
                    {selectedCategory !== "all" && selectedCategoryInfo && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg">
                            <div
                                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] text-white ${selectedCategoryInfo.chartColor.replace(
                                    "text",
                                    "bg"
                                )}`}
                            >
                                {selectedCategoryInfo.icon}
                            </div>
                            <span className="text-xs font-bold text-blue-600">{selectedCategory}</span>
                        </div>
                    )}
                </div>

                {/* 카테고리 필터 */}
                <div className="flex flex-wrap gap-1 mb-4">
                    <Chip
                        label="전체"
                        active={selectedCategory === "all"}
                        onClick={() => setSelectedCategory("all")}
                    />
                    {categories.map((cat) => (
                        <Chip
                            key={cat.id}
                            label={cat.name}
                            active={selectedCategory === cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                        />
                    ))}
                </div>

                <div className="relative h-64 w-full mt-2">
                    {/* Y-axis Labels / Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-end">
                        {yAxisLabels.map((val, idx) => (
                            <div
                                key={val}
                                className={`absolute w-full border-b ${selectedCategory === "all" && val === 10000000
                                        ? "border-red-300 border-solid"
                                        : "border-dashed border-gray-200"
                                    }`}
                                style={{ bottom: `${getPct(val)}%` }}
                            >
                                <span
                                    className={`absolute -top-3 left-0 text-[10px] bg-white pr-1 ${selectedCategory === "all" && val === 10000000
                                            ? "font-bold text-red-400"
                                            : "text-gray-400"
                                        }`}
                                >
                                    {formatAmount(val)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end justify-between gap-1 pb-2 pl-8">
                        {FULL_MONTHS.map((month, idx) => {
                            const data = filteredMonthlyData[idx];
                            const total = data.filteredTotal;
                            const isActive = month === currentMonth;
                            const heightPct = getPct(total);
                            const isOverLimit = selectedCategory === "all" && total > 10000000;

                            // 카테고리 선택 시 해당 카테고리 색상 사용
                            const barColorActive = selectedCategoryInfo
                                ? selectedCategoryInfo.chartColor.replace("text", "bg")
                                : isOverLimit
                                    ? "bg-pink-500"
                                    : "bg-blue-600";
                            const barColorInactive = selectedCategoryInfo
                                ? selectedCategoryInfo.chartColor.replace("text", "bg") + " opacity-40"
                                : isOverLimit
                                    ? "bg-pink-200 group-hover:bg-pink-300"
                                    : "bg-blue-100 group-hover:bg-blue-200";

                            return (
                                <div
                                    key={month}
                                    className="flex flex-col items-center justify-end h-full flex-1 group cursor-pointer"
                                    onClick={() => setCurrentMonth(month)}
                                >
                                    <div className="w-full flex-1 flex items-end justify-center relative">
                                        <div
                                            className={`w-full max-w-[32px] rounded-t-sm transition-all duration-500 relative ${isActive
                                                    ? `${barColorActive} shadow-md`
                                                    : barColorInactive
                                                }`}
                                            style={{ height: `${Math.max(heightPct, 4)}%` }}
                                        >
                                            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[9px] font-bold text-gray-600 whitespace-nowrap">
                                                {formatAmount(total)}
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
                                            {cat.name} <span className="font-medium text-gray-500">({Math.round(cat.percent * 100)}%)</span>
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
