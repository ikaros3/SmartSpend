import { useMemo, useCallback } from "react";
import { useBudgetContext } from "../context/BudgetContext";
import { FULL_MONTHS } from "../constants";

export const useBudget = () => {
    const {
        dbData,
        setDbData,
        categories,
        setCategories,
        currentYear,
        currentMonth,
        setCurrentMonth,
        setEditingId,
        setInputForm,
        setIsInputModalOpen,
    } = useBudgetContext();

    const monthKey = `${currentYear}-${currentMonth}`;

    // Summary with totals
    const monthlyData = useMemo(() => {
        return FULL_MONTHS.map((m) => {
            const key = `${currentYear}-${m}`;
            const data = dbData[key] || { items: [] };
            const total = data.items.reduce((sum, item) => sum + item.amount, 0);
            return { ...data, total };
        });
    }, [dbData, currentYear]);

    // Current month's data with total
    const currentData = useMemo(() => {
        const monthIndex = parseInt(currentMonth) - 1;
        return monthlyData[monthIndex];
    }, [monthlyData, currentMonth]);

    // Previous month total calculation
    const prevMonthTotal = useMemo(() => {
        const currentMonthNum = parseInt(currentMonth);
        let prevYear = currentYear;
        let prevMonthNum = currentMonthNum - 1;

        if (prevMonthNum === 0) {
            prevMonthNum = 12;
            prevYear -= 1;
        }

        const prevKey = `${prevYear}-${prevMonthNum}월`;
        const prevData = dbData[prevKey] || { items: [] };
        return prevData.items.reduce((sum, item) => sum + item.amount, 0);
    }, [dbData, currentYear, currentMonth]);

    const diffAmount = currentData.total - prevMonthTotal;

    // Fixed expenses
    const upcomingFixedExpenses = useMemo(() => {
        const now = new Date();
        const actualYear = now.getFullYear();
        const actualMonth = now.getMonth() + 1; // 1-indexed (Jan is 1)
        const today = now.getDate();

        const viewMonthNum = parseInt(currentMonth);

        // 미래의 달을 보고 있는 경우: 해당 달의 모든 고정비가 예정됨
        if (currentYear > actualYear || (currentYear === actualYear && viewMonthNum > actualMonth)) {
            return currentData.items
                .filter((item) => item.type === "fixed")
                .sort((a, b) => a.day - b.day);
        }

        // 과거의 달을 보고 있는 경우: 예정된 고정비가 없음
        if (currentYear < actualYear || (currentYear === actualYear && viewMonthNum < actualMonth)) {
            return [];
        }

        // 현재 달을 보고 있는 경우: 오늘 이후의 고정비만 예정됨
        return currentData.items
            .filter((item) => item.type === "fixed" && item.day >= today)
            .sort((a, b) => a.day - b.day);
    }, [currentData, currentYear, currentMonth]);

    const saveItem = useCallback((itemData, editingId) => {
        setDbData((prev) => {
            const newDb = { ...prev };
            if (!newDb[monthKey]) newDb[monthKey] = { items: [] };

            const newItems = [...newDb[monthKey].items];
            if (editingId) {
                const idx = newItems.findIndex((i) => i.id === editingId);
                if (idx > -1) newItems[idx] = { ...itemData, id: editingId };
            } else {
                newItems.push({ ...itemData, id: Date.now() });
            }

            newDb[monthKey] = { ...newDb[monthKey], items: newItems };
            return newDb;
        });
    }, [monthKey, setDbData]);

    const deleteItem = useCallback((id) => {
        setDbData((prev) => {
            const newDb = { ...prev };
            if (newDb[monthKey]) {
                newDb[monthKey].items = newDb[monthKey].items.filter((i) => i.id !== id);
            }
            return newDb;
        });
    }, [monthKey, setDbData]);

    const resetData = useCallback(() => {
        if (window.confirm("정말 모든 데이터를 초기화하시겠습니까?\n지출 내역과 카테고리가 모두 삭제되며, 복구할 수 없습니다.")) {
            setDbData({});
            setCategories([]);
            localStorage.removeItem("budgetData");
            alert("모든 데이터가 초기화되었습니다.");
        }
    }, [setDbData, setCategories]);

    const openCreateModal = useCallback(() => {
        setEditingId(null);
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        setInputForm({
            date: `${year}-${month}-${day}`,
            category: "생활비",
            amount: "",
            details: "",
            memo: "",
            type: "variable",
        });
        setIsInputModalOpen(true);
    }, [setEditingId, setInputForm, setIsInputModalOpen]);

    const openEditModal = useCallback((item) => {
        setEditingId(item.id);
        const monthNum = parseInt(currentMonth.replace("월", ""));
        const monthStr = String(monthNum).padStart(2, "0");
        const dayStr = String(item.day).padStart(2, "0");

        setInputForm({
            date: `${currentYear}-${monthStr}-${dayStr}`,
            category: item.category,
            amount: item.amount,
            details: item.name || item.details,
            memo: item.memo || "",
            type: item.type,
        });
        setIsInputModalOpen(true);
    }, [currentYear, currentMonth, setEditingId, setInputForm, setIsInputModalOpen]);

    const handleSaveData = useCallback(() => {
        const dataToSave = { dbData, categories };
        localStorage.setItem("budgetData", JSON.stringify(dataToSave));
        alert("데이터가 안전하게 저장되었습니다.");
    }, [dbData, categories]);

    return {
        currentData,
        monthlyData,
        prevMonthTotal,
        diffAmount,
        upcomingFixedExpenses,
        saveItem,
        deleteItem,
        resetData,
        openCreateModal,
        openEditModal,
        handleSaveData,
        monthKey,
    };
};
