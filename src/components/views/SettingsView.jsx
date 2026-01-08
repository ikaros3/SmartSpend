import React from "react";
import { User, Edit3, Settings, Save, Download, RotateCcw, Trash2, ChevronRight, LogOut, RefreshCw, Cloud, CloudOff } from "lucide-react";
import { useBudgetContext } from "../../context/BudgetContext";
import { useBudget } from "../../hooks/useBudget";
import { useExcel } from "../../hooks/useExcel";
import { useAuth } from "../../hooks/useAuth";

const SettingsView = () => {
    const { setIsCategoryModalOpen, syncStatus, manualSync, userId } = useBudgetContext();
    const { handleSaveData, resetData } = useBudget();
    const { handleDownloadExcel, handleFileUpload } = useExcel();
    const { user, signOut } = useAuth();

    // 동기화 상태 아이콘 및 텍스트
    const getSyncStatusDisplay = () => {
        switch (syncStatus) {
            case "syncing":
                return { icon: <RefreshCw size={18} className="text-blue-500 animate-spin" />, text: "동기화 중...", color: "text-blue-500" };
            case "synced":
                return { icon: <Cloud size={18} className="text-green-500" />, text: "동기화됨", color: "text-green-500" };
            case "error":
                return { icon: <CloudOff size={18} className="text-red-500" />, text: "동기화 오류", color: "text-red-500" };
            default:
                return { icon: <Cloud size={18} className="text-gray-400" />, text: "대기 중", color: "text-gray-400" };
        }
    };

    const syncDisplay = getSyncStatusDisplay();

    const handleSignOut = async () => {
        if (window.confirm("로그아웃하시겠습니까?")) {
            await signOut();
        }
    };

    return (
        <div className="flex-1 overflow-y-auto pb-24 p-5 animate-in fade-in duration-300">
            {/* 사용자 정보 섹션 */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="프로필" className="w-full h-full object-cover" />
                    ) : (
                        <User size={32} className="text-gray-400" />
                    )}
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">{user?.displayName || "사용자"}</h2>
                    <p className="text-xs text-gray-500">{user?.email || "이메일 없음"}</p>
                </div>
                {/* 동기화 상태 배지 */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 ${syncDisplay.color}`}>
                    {syncDisplay.icon}
                    <span className="text-xs font-medium">{syncDisplay.text}</span>
                </div>
            </div>

            <div className="space-y-4">
                {/* 동기화 섹션 */}
                <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <h3 className="text-xs font-bold text-gray-400 p-4 pb-0 mb-2 uppercase">
                        동기화
                    </h3>
                    <div>
                        <div
                            onClick={manualSync}
                            className="p-4 flex justify-between items-center border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <RefreshCw size={18} className={`text-blue-500 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
                                <span className="text-sm font-medium">지금 동기화</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </div>
                        <div
                            onClick={handleSignOut}
                            className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <LogOut size={18} className="text-gray-500" />
                                <span className="text-sm font-medium">로그아웃</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </div>
                    </div>
                </section>

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
