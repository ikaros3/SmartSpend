import React, { useState, useMemo } from "react";
import { Chip } from "../common/UIComponents";
import { List, Edit3, Trash2 } from "lucide-react";

const LedgerTab = ({ currentMonth, currentData, categories, formatCurrency, onEdit, onDelete }) => {
    const [typeFilter, setTypeFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const filteredItems = useMemo(() => {
        let items = currentData.items;
        if (typeFilter !== "all") items = items.filter(i => i.type === typeFilter);
        if (categoryFilter !== "all") items = items.filter(i => i.category === categoryFilter);
        return items.sort((a, b) => a.day - b.day);
    }, [currentData, typeFilter, categoryFilter]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="bg-white px-4 py-3 border-b border-gray-100 z-10 space-y-2 shadow-sm shrink-0">
                <div className="flex space-x-2">
                    <Chip label="전체 내역" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
                    <Chip label="고정비" active={typeFilter === "fixed"} onClick={() => setTypeFilter("fixed")} />
                    <Chip label="변동비" active={typeFilter === "variable"} onClick={() => setTypeFilter("variable")} />
                </div>
                <div className="flex flex-wrap gap-0.5 pb-1">
                    <Chip label="전체" active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")} />
                    {categories.map(cat => (
                        <Chip key={cat.id} label={cat.name} active={categoryFilter === cat.name} onClick={() => setCategoryFilter(cat.name)} />
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-24">
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <List size={48} className="mb-4 opacity-20" />
                        <p>조건에 맞는 내역이 없습니다.</p>
                    </div>
                ) : (
                    <div className="bg-white">
                        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                            <div className="grid grid-cols-[2fr_1fr_0.8fr_1fr_0.7fr] gap-4 px-4 py-3 text-xs font-bold text-gray-700">
                                <div>항목</div><div className="text-right">금액</div><div className="text-center">날짜</div><div>메모</div><div className="text-right">관리</div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {filteredItems.map((item, idx) => {
                                const catInfo = categories.find(c => c.name === item.category) || { name: "기타", icon: "⋯", chartColor: "text-gray-400" };
                                return (
                                    <div key={item.id || idx} className="grid grid-cols-[2fr_1fr_0.8fr_1fr_0.7fr] gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className={`w-8 h-8 rounded flex items-center justify-center text-sm text-white shrink-0 ${catInfo.chartColor.replace("text", "bg")}`}>{catInfo.icon}</div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <span className="text-xs text-gray-500">{item.category}</span>
                                                    <span className={`text-[10px] px-1 py-0 rounded border font-medium ${item.type === "fixed" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-orange-50 text-orange-600 border-orange-200"}`}>{item.type === "fixed" ? "고정" : "변동"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center justify-end"><span className="text-sm font-bold text-gray-900">- {formatCurrency(item.amount)}</span></div>
                                        <div className="text-center flex items-center justify-center"><span className="text-sm text-gray-600">{item.day ? `${currentMonth.replace("월", "")}/${item.day}` : ""}</span></div>
                                        <div className="flex items-center min-w-0"><span className="text-xs text-gray-500 truncate">{item.memo || "-"}</span></div>
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => onEdit(item)} className="p-1 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"><Edit3 size={16} /></button>
                                            <button onClick={() => onDelete(item)} className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="grid grid-cols-[2fr_1fr_0.8fr_1fr_0.7fr] gap-4 px-4 py-4 bg-gray-50 border-t-2 border-gray-300 font-bold">
                                <div className="text-sm text-gray-700">합계</div>
                                <div className="text-right"><span className="text-sm text-gray-900">- {formatCurrency(filteredItems.reduce((sum, item) => sum + item.amount, 0))}</span></div>
                                <div></div><div></div><div></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LedgerTab;
