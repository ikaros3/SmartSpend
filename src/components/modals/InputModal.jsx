import React from "react";
import { X } from "lucide-react";
import { formatNumber, cleanNumberString } from "../../utils/formatters";

const InputModal = ({ isOpen, onClose, onSave, editingId, inputForm, setInputForm, categories }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg">{editingId ? "지출 수정" : "지출 입력"}</h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-5 space-y-4 overflow-y-auto">
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">날짜</label>
                        <input type="date" value={inputForm.date} onChange={(e) => setInputForm({ ...inputForm, date: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">카테고리</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button key={cat.id} onClick={() => setInputForm({ ...inputForm, category: cat.name })} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${inputForm.category === cat.name ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>{cat.name}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {["variable", "fixed"].map(t => (
                            <button key={t} onClick={() => setInputForm({ ...inputForm, type: t })} className={`flex-1 py-2 rounded-xl text-sm font-medium border ${inputForm.type === t ? (t === "fixed" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-green-100 text-green-700 border-green-200") : "bg-white border-gray-200"}`}>{t === "fixed" ? "고정비" : "변동비"}</button>
                        ))}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">금액</label>
                        <div className="relative">
                            <input type="text" placeholder="0" value={formatNumber(inputForm.amount)} onChange={(e) => setInputForm({ ...inputForm, amount: cleanNumberString(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pr-8 text-sm focus:ring-2 focus:ring-blue-500" />
                            <span className="absolute right-3 top-3 text-sm text-gray-400">원</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">세부내역</label>
                        <input type="text" placeholder="내용을 입력하세요" value={inputForm.details} onChange={(e) => setInputForm({ ...inputForm, details: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">메모</label>
                        <textarea placeholder="메모를 입력하세요" value={inputForm.memo} onChange={(e) => setInputForm({ ...inputForm, memo: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 h-20 resize-none" />
                    </div>
                    <button onClick={onSave} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg mt-4">{editingId ? "수정 완료" : "저장하기"}</button>
                </div>
            </div>
        </div>
    );
};

export default InputModal;
