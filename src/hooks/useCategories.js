import { useState, useCallback } from "react";
import { useBudgetContext } from "../context/BudgetContext";
import { COLOR_PALETTE } from "../constants";

export const useCategories = () => {
    const { categories, setCategories } = useBudgetContext();
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);

    const handleAddCategory = useCallback(() => {
        if (!newCategoryName.trim()) {
            alert("카테고리 이름을 입력해주세요.");
            return;
        }

        if (categories.some((c) => c.name === newCategoryName.trim())) {
            alert("이미 존재하는 카테고리입니다.");
            return;
        }

        const palette = COLOR_PALETTE[categories.length % COLOR_PALETTE.length];
        const newCat = {
            id: `c${Date.now()}`,
            name: newCategoryName.trim(),
            ...palette,
        };

        setCategories([...categories, newCat]);
        setNewCategoryName("");
    }, [newCategoryName, categories, setCategories]);

    const handleUpdateCategory = useCallback((id, newName) => {
        if (!newName.trim()) return;
        setCategories(
            categories.map((c) => (c.id === id ? { ...c, name: newName.trim() } : c))
        );
        setEditingCategory(null);
    }, [categories, setCategories]);

    const handleDeleteCategory = useCallback((id) => {
        if (window.confirm("이 카테고리를 삭제하시겠습니까? 해당 카테고리의 지출 내역은 유지되지만 카테고리 정보가 '기타'로 표시될 수 있습니다.")) {
            setCategories(categories.filter((c) => c.id !== id));
        }
    }, [categories, setCategories]);

    return {
        newCategoryName,
        setNewCategoryName,
        editingCategory,
        setEditingCategory,
        handleAddCategory,
        handleUpdateCategory,
        handleDeleteCategory,
    };
};
