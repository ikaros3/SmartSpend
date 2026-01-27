import React, { useState } from "react";
import { X, Plus, Edit3, Trash2, Save, RotateCcw, Calendar } from "lucide-react";
import { CATEGORY_COLORS, generateId } from "../../utils/fixedExpenseHelper";

const FixedExpenseModal = ({
    isOpen,
    onClose,
    templates,
    categories,
    onSave,
    onDelete,
    onToggleActive,
    onInitializeDefaults
}) => {
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        category: categories && categories.length > 0 ? categories[0].name : '생활비',
        description: '',
        amount: '',
        dayOfMonth: 1
    });

    if (!isOpen) return null;

    const handleSaveTemplate = () => {
        if (!formData.description || !formData.amount) {
            alert('내용과 금액을 입력해주세요');
            return;
        }

        const newTemplate = {
            id: editingTemplate?.id || generateId(),
            category: formData.category,
            description: formData.description,
            amount: parseInt(formData.amount),
            dayOfMonth: parseInt(formData.dayOfMonth),
            isActive: true,
            createdAt: editingTemplate?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        onSave(newTemplate);
        resetForm();
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData({
            category: template.category,
            description: template.description,
            amount: template.amount.toString(),
            dayOfMonth: template.dayOfMonth
        });
        setIsAdding(true);
    };

    const resetForm = () => {
        setFormData({
            category: categories && categories.length > 0 ? categories[0].name : '생활비',
            description: '',
            amount: '',
            dayOfMonth: 1
        });
        setEditingTemplate(null);
        setIsAdding(false);
    };

    const handleInitialize = () => {
        if (window.confirm('기본 고정비 템플릿으로 초기화하시겠습니까?\n기존 템플릿은 모두 삭제됩니다.')) {
            onInitializeDefaults();
        }
    };

    const getCategoryColor = (categoryName) => {
        // 정의된 카테고리에서 색상 찾기
        const category = categories?.find(cat => cat.name === categoryName);
        if (category && category.chartColor) {
            // "text-blue-500" -> "bg-blue-500"
            return category.chartColor.replace('text-', 'bg-');
        }
        return CATEGORY_COLORS[categoryName] || CATEGORY_COLORS['기타'];
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2">
            <div className="bg-white w-full max-w-[420px] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 p-3 px-4 flex justify-between items-center text-white">
                    <div>
                        <h3 className="font-bold text-lg">고정비 설정</h3>
                        <p className="text-[10px] text-green-100 opacity-90 mt-0.5">매월 자동 생성될 항목 관리</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-lg transition">
                        <X size={20} />
                    </button>
                </div>

                {/* 컨텐츠 */}
                <div className="p-5 space-y-4 overflow-y-auto flex-1">
                    {/* 기본 템플릿 초기화 버튼 */}
                    <button
                        onClick={handleInitialize}
                        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-xl flex items-center justify-center gap-2 font-medium transition"
                    >
                        <RotateCcw size={18} />
                        기본 고정비 템플릿으로 초기화
                    </button>

                    {/* 고정비 목록 */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center justify-between px-1">
                            <span>보유 템플릿 ({templates.length}개)</span>
                            {!isAdding && (
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-green-700 transition shadow-sm shadow-green-200"
                                >
                                    <Plus size={14} />
                                    추가
                                </button>
                            )}
                        </h4>

                        {/* 추가/수정 폼 */}
                        {isAdding && (
                            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl border-2 border-green-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h5 className="font-bold text-sm text-gray-700">
                                        {editingTemplate ? '고정비 수정' : '새 고정비 추가'}
                                    </h5>
                                    <button
                                        onClick={resetForm}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-600 font-medium mb-1 block">분류</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm"
                                        >
                                            {categories && categories.length > 0 ? (
                                                categories.map(cat => (
                                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="생활비">생활비</option>
                                                    <option value="용돈">용돈</option>
                                                    <option value="대출상환">대출상환</option>
                                                    <option value="세금/공과금">세금/공과금</option>
                                                    <option value="기타">기타</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-600 font-medium mb-1 block">매월 날짜</label>
                                        <select
                                            value={formData.dayOfMonth}
                                            onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                                            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm"
                                        >
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                <option key={day} value={day}>{day}일</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-600 font-medium mb-1 block">내용</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="예: 생활비(효원)"
                                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-600 font-medium mb-1 block">금액 (원)</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="예: 4000000"
                                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm"
                                    />
                                </div>

                                <button
                                    onClick={handleSaveTemplate}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg font-bold flex items-center justify-center gap-2 transition"
                                >
                                    <Save size={18} />
                                    {editingTemplate ? '수정 완료' : '추가하기'}
                                </button>
                            </div>
                        )}

                        {/* 템플릿 리스트 */}
                        {templates.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p className="text-sm">등록된 고정비 템플릿이 없습니다</p>
                                <p className="text-xs mt-1">기본 템플릿으로 초기화하거나 새로 추가해주세요</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {templates.map(template => (
                                    <div
                                        key={template.id}
                                        className={`bg-white border-2 rounded-xl p-2.5 px-3 transition ${template.isActive
                                            ? 'border-gray-100 hover:border-green-200'
                                            : 'border-gray-50 bg-gray-50 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0 mr-2">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span className={`${getCategoryColor(template.category)} text-white text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0`}>
                                                        {template.category}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 flex items-center gap-0.5 shrink-0">
                                                        <Calendar size={11} />
                                                        {template.dayOfMonth}일
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-1">
                                                    <p className="font-bold text-sm text-gray-800 truncate flex-1">{template.description}</p>
                                                    <p className="text-base font-black text-gray-900 shrink-0">
                                                        ₩{template.amount.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1.5 ml-1 border-l border-gray-50 pl-2 shrink-0">
                                                <button
                                                    onClick={() => onToggleActive(template.id)}
                                                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${template.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-200 text-gray-600'
                                                        }`}
                                                >
                                                    {template.isActive ? '활성' : '중단'}
                                                </button>
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => handleEdit(template)}
                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                        title="수정"
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('이 고정비 템플릿을 삭제하시겠습니까?')) {
                                                                onDelete(template.id);
                                                            }
                                                        }}
                                                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                                                        title="삭제"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 푸터 */}
                <div className="bg-gray-50 p-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center font-medium">
                        💡 활성화된 항목은 매월 자동 생성됩니다
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FixedExpenseModal;
