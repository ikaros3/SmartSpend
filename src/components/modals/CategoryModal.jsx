import React from "react";
import { X, Save, Edit3, Trash2 } from "lucide-react";

const CategoryModal = ({ isOpen, onClose, categories, onAdd, onDelete, onUpdate, newName, setNewName, editingCat, setEditingCat }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg">카테고리 관리</h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-5 space-y-4 overflow-y-auto">
                    <div className="flex gap-2">
                        <input type="text" placeholder="새 카테고리 이름" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-grow bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" />
                        <button onClick={() => onAdd(newName)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">추가</button>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 mt-4 uppercase">현재 카테고리</h4>
                        {categories.map(cat => (
                            <div key={cat.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                {editingCat?.id === cat.id ? (
                                    <>
                                        <input type="text" value={editingCat.name} onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })} className="flex-grow bg-white border border-blue-300 rounded-md py-1 px-2 text-sm" autoFocus />
                                        <div className="flex gap-1 ml-2">
                                            <button onClick={() => { onUpdate(cat.id, editingCat.name); setEditingCat(null); }} className="p-1 text-green-600"><Save size={16} /></button>
                                            <button onClick={() => setEditingCat(null)} className="p-1 text-gray-500"><X size={16} /></button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded flex items-center justify-center text-sm text-white ${cat.chartColor.replace("text", "bg")}`}>{cat.icon}</div>
                                            <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => setEditingCat(cat)} className="p-1 text-gray-400 hover:text-blue-600"><Edit3 size={16} /></button>
                                            <button onClick={() => onDelete(cat.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;
