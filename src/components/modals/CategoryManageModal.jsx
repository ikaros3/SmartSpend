import React, { useState } from "react";
import { X, Save, Edit3, Trash2, GripVertical } from "lucide-react";
import { useBudgetContext } from "../../context/BudgetContext";
import { useCategories } from "../../hooks/useCategories";

const CategoryManageModal = () => {
    const {
        isCategoryModalOpen,
        setIsCategoryModalOpen,
        categories,
    } = useBudgetContext();

    const {
        newCategoryName,
        setNewCategoryName,
        editingCategory,
        setEditingCategory,
        handleAddCategory,
        handleUpdateCategory,
        handleDeleteCategory,
        handleReorderCategories,
    } = useCategories();

    // 드래그 앤 드롭 상태
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);

    const handleDragStart = (e, catId) => {
        setDraggedId(catId);
        e.dataTransfer.effectAllowed = "move";
        // 드래그 시 투명도 조정을 위한 타임아웃
        setTimeout(() => {
            e.target.style.opacity = "0.5";
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = "1";
        setDraggedId(null);
        setDragOverId(null);
    };

    const handleDragOver = (e, catId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (catId !== draggedId) {
            setDragOverId(catId);
        }
    };

    const handleDragLeave = () => {
        setDragOverId(null);
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (draggedId && draggedId !== targetId) {
            const draggedIndex = categories.findIndex((c) => c.id === draggedId);
            const targetIndex = categories.findIndex((c) => c.id === targetId);

            if (draggedIndex !== -1 && targetIndex !== -1) {
                const newCategories = [...categories];
                const [removed] = newCategories.splice(draggedIndex, 1);
                newCategories.splice(targetIndex, 0, removed);
                handleReorderCategories(newCategories);
            }
        }
        setDraggedId(null);
        setDragOverId(null);
    };

    if (!isCategoryModalOpen) return null;

    return (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white shrink-0">
                    <h3 className="font-bold text-lg">카테고리 관리</h3>
                    <button
                        onClick={() => {
                            setIsCategoryModalOpen(false);
                            setEditingCategory(null);
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto flex-1">
                    {/* Add Category Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="새 카테고리 이름"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="flex-grow bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleAddCategory}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                        >
                            추가
                        </button>
                    </div>

                    {/* Category List */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 mt-4 flex items-center gap-2">
                            현재 카테고리
                            <span className="text-[10px] font-normal text-gray-400">
                                (드래그하여 순서 변경)
                            </span>
                        </h4>
                        <div className="space-y-2">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    draggable={editingCategory?.id !== cat.id}
                                    onDragStart={(e) => handleDragStart(e, cat.id)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => handleDragOver(e, cat.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, cat.id)}
                                    className={`flex justify-between items-center bg-gray-50 p-3 rounded-lg transition-all duration-200
                                        ${draggedId === cat.id ? "opacity-50 scale-95" : ""}
                                        ${dragOverId === cat.id ? "ring-2 ring-blue-400 bg-blue-50" : ""}
                                        ${editingCategory?.id !== cat.id ? "cursor-grab active:cursor-grabbing" : ""}
                                    `}
                                >
                                    {editingCategory?.id === cat.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editingCategory.name}
                                                onChange={(e) =>
                                                    setEditingCategory({
                                                        ...editingCategory,
                                                        name: e.target.value,
                                                    })
                                                }
                                                className="flex-grow bg-white border border-blue-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                autoFocus
                                            />
                                            <div className="flex gap-1 ml-2">
                                                <button
                                                    onClick={() =>
                                                        handleUpdateCategory(editingCategory.id, editingCategory.name)
                                                    }
                                                    className="p-1 text-green-600 hover:bg-green-100 rounded-md"
                                                >
                                                    <Save size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingCategory(null)}
                                                    className="p-1 text-gray-500 hover:bg-gray-100 rounded-md"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <GripVertical size={16} className="text-gray-400 shrink-0" />
                                                <div
                                                    className={`w-8 h-8 rounded flex items-center justify-center text-sm text-white shrink-0 ${cat.chartColor.replace(
                                                        "text",
                                                        "bg"
                                                    )}`}
                                                >
                                                    {cat.icon}
                                                </div>
                                                <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                                            </div>
                                            <div className="flex gap-0.5">
                                                <button
                                                    onClick={() => setEditingCategory(cat)}
                                                    className="p-1 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                                                    title="이름 수정"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        {categories.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">
                                카테고리가 없습니다.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryManageModal;
