import React, { useMemo } from "react";
import { formatNumber } from "../../utils/formatters";

const StatsTab = ({ currentYear, currentMonth, setCurrentMonth, monthlyData, currentData, categories, fullMonths }) => {
    const chartMax = Math.max(...Object.values(monthlyData).map(d => d.total), 16000000);
    const getPct = (val) => (val / chartMax) * 100;

    const pieSlices = useMemo(() => {
        const total = currentData.total;
        if (total === 0) return [];
        let cumulative = 0;
        return categories.map(cat => {
            const amount = currentData.items.filter(i => i.category === cat.name).reduce((s, i) => s + i.amount, 0);
            if (amount === 0) return null;
            const start = cumulative;
            cumulative += amount / total;
            return { ...cat, amount, startPercent: start, endPercent: cumulative };
        }).filter(Boolean);
    }, [currentData, categories]);

    const getSlicePath = (start, end) => {
        const sX = Math.cos(2 * Math.PI * start), sY = Math.sin(2 * Math.PI * start);
        const eX = Math.cos(2 * Math.PI * end), eY = Math.sin(2 * Math.PI * end);
        return end - start >= 0.9999 ? "M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0 Z" : `M 0 0 L ${sX} ${sY} A 1 1 0 ${end - start > 0.5 ? 1 : 0} 1 ${eX} ${eY} Z`;
    };

    return (
        <div className="flex-1 overflow-y-auto pb-24 p-5 flex flex-col space-y-5">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h2 className="text-lg font-bold text-gray-800 mb-4">월별 지출 추이</h2>
                <div className="relative h-64 w-full mt-4">
                    <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none">
                        {[1500, 1000, 500].map(v => (
                            <div key={v} className="relative w-full border-b border-dashed border-gray-200" style={{ height: `${100 - getPct(v * 10000)}%` }}>
                                <span className="absolute -top-3 left-0 text-[10px] text-gray-400 bg-white pr-1">{v}만</span>
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 flex items-end justify-between gap-1 pb-2 pl-8">
                        {fullMonths.map(m => {
                            const total = (monthlyData[`${currentYear}-${parseInt(m)}\uC6D4`] || { total: 0 }).total;
                            return (
                                <div key={m} className="flex flex-col items-center justify-end h-full flex-1 group cursor-pointer" onClick={() => setCurrentMonth(m)}>
                                    <div className="w-full flex-1 flex items-end justify-center relative">
                                        <div className={`w-full max-w-[32px] rounded-t-sm transition-all duration-500 relative ${m === currentMonth ? (total > 10000000 ? "bg-pink-500" : "bg-blue-600") : (total > 10000000 ? "bg-pink-100" : "bg-blue-100")}`} style={{ height: `${Math.max(getPct(total), 4)}%` }}>
                                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-600">{(total / 10000).toFixed(0)}만</div>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] mt-2 ${m === currentMonth ? "font-bold text-gray-800" : "text-gray-400"}`}>{m.replace("월", "")}월</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">지출 분석</h2>
                <div className="flex flex-row items-center w-full justify-between gap-4">
                    <div className="w-5/12 aspect-square relative flex items-center justify-center">
                        <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full -rotate-90">
                            {pieSlices.length === 0 ? <circle cx="0" cy="0" r="1" fill="#e5e7eb" /> : pieSlices.map((s, i) => <path key={i} d={getSlicePath(s.startPercent, s.endPercent)} fill={s.fillColor} />)}
                            <circle cx="0" cy="0" r="0.6" fill="white" />
                        </svg>
                        <div className="absolute flex flex-col items-center"><span className="text-[10px] text-gray-400">총 지출</span><span className="text-sm font-bold">{currentData.total > 10000000 ? (currentData.total / 10000000).toFixed(1) + "천만" : (currentData.total / 10000).toFixed(0) + "만"}</span></div>
                    </div>
                    <div className="w-7/12 space-y-3">
                        {categories.map(cat => {
                            const amt = currentData.items.filter(i => i.category === cat.name).reduce((a, b) => a + b.amount, 0);
                            return (
                                <div key={cat.id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs text-white ${cat.chartColor.replace("text", "bg")}`}>{cat.icon}</div>
                                        <span className="font-bold text-gray-700 truncate">{cat.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-600">{(amt / 10000).toFixed(0)}만원</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsTab;
