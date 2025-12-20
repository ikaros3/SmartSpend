import React from "react";
import { X } from "lucide-react";
import { useBudgetContext } from "../../context/BudgetContext";
import { useBudget } from "../../hooks/useBudget";
import { formatNumber, cleanNumberString } from "../../utils/formatters";

const ItemInputModal = () => {
    const {
        isInputModalOpen,
        setIsInputModalOpen,
        editingId,
        categories,
        inputForm,
        setInputForm,
    } = useBudgetContext();

    const { saveItem } = useBudget();

    if (!isInputModalOpen) return null;

    const handleSave = () => {
        if (!inputForm.amount || !inputForm.details) {
            alert("금액과 내용을 입력해주세요.");
            return;
        }

        const day = parseInt(inputForm.date.split("-")[2]);
        const itemData = {
            category: inputForm.category,
            name: inputForm.details,
            amount: parseInt(inputForm.amount),
            type: inputForm.type,
            day: isNaN(day) ? null : day,
            details: inputForm.details,
            memo: inputForm.memo,
        };

        saveItem(itemData, editingId);
        setIsInputModalOpen(false);
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 flex flex-col max-h-[95vh]">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white shrink-0">
                    <h3 className="font-bold text-lg">
                        {editingId ? "지출 수정" : "지출 입력"}
                    </h3>
                    <button onClick={() => setIsInputModalOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto flex-1">
                    {/* Date */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">날짜</label>
                        <input
                            type="date"
                            value={inputForm.date}
                            onChange={(e) => setInputForm({ ...inputForm, date: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">카테고리</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setInputForm({ ...inputForm, category: cat.name })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${inputForm.category === cat.name
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Type */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setInputForm({ ...inputForm, type: "variable" })}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium border ${inputForm.type === "variable"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : "bg-white border-gray-200"
                                }`}
                        >
                            변동비
                        </button>
                        <button
                            onClick={() => setInputForm({ ...inputForm, type: "fixed" })}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium border ${inputForm.type === "fixed"
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : "bg-white border-gray-200"
                                }`}
                        >
                            고정비
                        </button>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">금액</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="0"
                                value={formatNumber(inputForm.amount)}
                                onChange={(e) => {
                                    const cleanedValue = cleanNumberString(e.target.value);
                                    setInputForm({ ...inputForm, amount: cleanedValue });
                                }}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="absolute right-3 top-3 text-sm text-gray-400">원</span>
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">세부내역</label>
                        <input
                            type="text"
                            placeholder="내용을 입력하세요"
                            value={inputForm.details}
                            onChange={(e) => setInputForm({ ...inputForm, details: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Memo */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">메모</label>
                        <textarea
                            placeholder="추가 메모"
                            value={inputForm.memo}
                            onChange={(e) => setInputForm({ ...inputForm, memo: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors"
                    >
                        {editingId ? "수정 완료" : "저장하기"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemInputModal;
