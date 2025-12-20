import React from "react";
import { User, Edit3, Settings, Save, Download, RotateCcw, Trash2, ChevronRight } from "lucide-react";
import { useBudgetContext } from "../../context/BudgetContext";
import { useBudget } from "../../hooks/useBudget";
import { useExcel } from "../../hooks/useExcel";

const SettingsView = () => {
    const { setIsCategoryModalOpen } = useBudgetContext();
    const { handleSaveData, resetData } = useBudget();
    const { handleDownloadExcel, handleFileUpload } = useExcel();

    return (
        <div className="flex-1 overflow-y-auto pb-24 p-5 animate-in fade-in duration-300">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                    <User size={32} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">겸이네 가족</h2>
                    <p className="text-xs text-gray-500">관리자 계정</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* 가계부 관리 Section */}
                <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <h3 className="text-xs font-bold text-gray-400 p-4 pb-0 mb-2 uppercase">
                        가계부 관리
                    </h3>
                    <div>
                        <div
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="p-4 flex justify-between items-center border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <Edit3 size={18} className="text-blue-500" />
                                <span className="text-sm font-medium">카테고리 관리</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </div>
                        <div className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Settings size={18} className="text-green-500" />
                                <span className="text-sm font-medium">고정비/변동비 기준 설정</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </div>
                    </div>
                </section>

                {/* 데이터 Management Section */}
                <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <h3 className="text-xs font-bold text-gray-400 p-4 pb-0 mb-2 uppercase">
                        데이터
                    </h3>
                    <div>
                        <div
                            onClick={handleSaveData}
                            className="p-4 flex justify-between items-center border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <Save size={18} className="text-purple-500" />
                                <span className="text-sm font-medium">데이터 백업/저장</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </div>
                        <div
                            onClick={handleDownloadExcel}
                            className="p-4 flex justify-between items-center border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <Download size={18} className="text-teal-500" />
                                <span className="text-sm font-medium">엑셀로 내보내기</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </div>
                        <label className="p-4 flex justify-between items-center border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-3">
                                <RotateCcw size={18} className="text-orange-500" />
                                <span className="text-sm font-medium">데이터 불러오기</span>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                            />
                            <ChevronRight size={16} className="text-gray-400" />
                        </label>
                        <div
                            onClick={resetData}
                            className="p-4 flex justify-between items-center hover:bg-red-50 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <Trash2 size={18} className="text-red-500" />
                                <span className="text-sm font-medium text-red-600">
                                    데이터 전체 초기화
                                </span>
                            </div>
                            <ChevronRight size={16} className="text-red-400" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsView;
