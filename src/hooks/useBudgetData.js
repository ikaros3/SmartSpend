import { useState, useMemo, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { formatCurrency } from "../utils/formatters";

export const useBudgetData = (fullMonths) => {
    const colorPalette = useMemo(
        () => [
            { color: "bg-amber-100 text-amber-700", chartColor: "text-amber-400", fillColor: "#fbbf24", icon: "🛒" },
            { color: "bg-green-100 text-green-700", chartColor: "text-green-400", fillColor: "#4ade80", icon: "💸" },
            { color: "bg-blue-100 text-blue-700", chartColor: "text-blue-400", fillColor: "#60a5fa", icon: "💳" },
            { color: "bg-pink-100 text-pink-700", chartColor: "text-pink-400", fillColor: "#f472b6", icon: "🎉" },
            { color: "bg-cyan-100 text-cyan-700", chartColor: "text-cyan-500", fillColor: "#06b6d4", icon: "📉" },
            { color: "bg-orange-100 text-orange-700", chartColor: "text-orange-400", fillColor: "#fb923c", icon: "🏦" },
            { color: "bg-violet-100 text-violet-700", chartColor: "text-violet-400", fillColor: "#a78bfa", icon: "🏛️" },
            { color: "bg-gray-100 text-gray-700", chartColor: "text-gray-400", fillColor: "#9ca3af", icon: "⋯" },
        ],
        []
    );

    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(fullMonths[0]);
    const [categories, setCategories] = useState([]);
    const [dbData, setDbData] = useState({});
    const alertShownRef = useRef(false);

    // Load data from local storage
    useEffect(() => {
        try {
            const savedData = localStorage.getItem("budgetData");
            if (savedData) {
                const { dbData: loadedDbData, categories: loadedCategories } = JSON.parse(savedData);
                if (loadedDbData && loadedCategories) {
                    setDbData(loadedDbData);
                    setCategories(loadedCategories);
                    if (!alertShownRef.current) {
                        alert("데이터 로딩이 완료되었습니다.");
                        alertShownRef.current = true;
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load data", error);
        }
    }, []);

    // Auto-save
    useEffect(() => {
        if (Object.keys(dbData).length > 0 || categories.length > 0) {
            localStorage.setItem("budgetData", JSON.stringify({ dbData, categories }));
        }
    }, [dbData, categories]);

    const monthlyData = useMemo(() => {
        const computed = {};
        for (const [month, data] of Object.entries(dbData)) {
            computed[month] = {
                ...data,
                total: data.items.reduce((sum, item) => sum + item.amount, 0),
            };
        }
        return computed;
    }, [dbData]);

    const currentDataKey = `${currentYear}-${parseInt(currentMonth.replace("월", ""))}\uC6D4`;
    const currentData = monthlyData[currentDataKey] || { total: 0, items: [] };

    const handleSaveItem = (inputForm, editingId) => {
        const newItem = {
            id: editingId || Date.now(),
            category: inputForm.category,
            name: inputForm.details,
            amount: parseInt(inputForm.amount),
            type: inputForm.type,
            day: parseInt(inputForm.date.split("-")[2]),
            fullDate: inputForm.date,
            details: inputForm.details,
            memo: inputForm.memo,
        };

        setDbData((prev) => {
            const newData = JSON.parse(JSON.stringify(prev));
            const [year, month] = inputForm.date.split("-");
            const targetMonthKey = `${year}-${parseInt(month)}\uC6D4`;

            if (editingId) {
                for (const m in newData) {
                    newData[m].items = newData[m].items.filter((i) => i.id !== editingId);
                }
            }

            if (!newData[targetMonthKey]) newData[targetMonthKey] = { total: 0, items: [] };
            newData[targetMonthKey].items.push(newItem);
            return newData;
        });
    };

    const deleteItem = (idToDelete) => {
        setDbData((prev) => {
            const newData = JSON.parse(JSON.stringify(prev));
            for (const m in newData) {
                newData[m].items = newData[m].items.filter((i) => i.id !== idToDelete);
            }
            return newData;
        });
    };

    const handleAddCategory = (name) => {
        const trimmedName = name.trim();
        if (!trimmedName || categories.some(cat => cat.name === trimmedName)) return;

        const palette = colorPalette[categories.length % colorPalette.length];
        setCategories(prev => [...prev, { id: `c${Date.now()}`, name: trimmedName, ...palette }]);
    };

    const handleDeleteCategory = (id) => {
        const cat = categories.find(c => c.id === id);
        if (!cat || !confirm(`'${cat.name}' 카테고리를 삭제하시겠습니까?`)) return;

        setCategories(prev => prev.filter(c => c.id !== id));
        setDbData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            for (const m in newData) {
                newData[m].items.forEach(item => { if (item.category === cat.name) item.category = "기타"; });
            }
            return newData;
        });
    };

    const handleUpdateCategory = (id, newName) => {
        const trimmedName = newName.trim();
        const oldCat = categories.find(c => c.id === id);
        if (!trimmedName || !oldCat) return;

        setCategories(prev => prev.map(c => c.id === id ? { ...c, name: trimmedName } : c));
        setDbData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            for (const m in newData) {
                newData[m].items.forEach(item => { if (item.category === oldCat.name) item.category = trimmedName; });
            }
            return newData;
        });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const wb = XLSX.read(evt.target.result, { type: "array", cellDates: true });
                const newDbData = {};
                let fileYear = null;

                for (const wsname of wb.SheetNames) {
                    const ws = wb.Sheets[wsname];
                    const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
                    if (rawData.length < 2) continue;

                    const yearMonthStr = rawData[0][0];
                    const yearMatch = yearMonthStr.match(/(\d{4})년/);
                    const monthMatch = yearMonthStr.match(/(\d{1,2})월/);
                    if (!yearMatch || !monthMatch) continue;

                    const sheetYear = parseInt(yearMatch[1]);
                    const sheetMonthStr = `${parseInt(monthMatch[1])}월`;
                    if (!fileYear) fileYear = sheetYear;

                    for (let i = 2; i < rawData.length; i++) {
                        const row = rawData[i];
                        if (!row[0] || !row[1] || isNaN(row[3])) continue;

                        const dateValue = row[4];
                        let day = (dateValue instanceof Date) ? dateValue.getDate() : parseInt(dateValue);

                        const newItem = {
                            id: Date.now() + i,
                            category: row[0],
                            name: row[1],
                            amount: parseInt(row[3]),
                            type: row[2] === "고정비" ? "fixed" : "variable",
                            day: isNaN(day) ? null : day,
                            memo: row[5] || "",
                        };

                        if (!newDbData[sheetMonthStr]) newDbData[sheetMonthStr] = { items: [] };
                        newDbData[sheetMonthStr].items.push(newItem);
                    }
                }
                setDbData(newDbData);
                if (fileYear) setCurrentYear(fileYear);
                alert("데이터를 성공적으로 불러왔습니다.");
            } catch (err) {
                console.error(err);
                alert("파일 처리 중 오류가 발생했습니다.");
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = null;
    };

    const handleDownloadExcel = () => {
        try {
            const wb = XLSX.utils.book_new();
            Object.keys(dbData).forEach(month => {
                const wsData = [
                    [`${currentYear}년 ${month}`],
                    ["분류", "내용", "구분", "금액", "날짜", "메모"],
                    ...dbData[month].items.sort((a, b) => a.day - b.day).map(item => [
                        item.category, item.name, item.type === "fixed" ? "고정비" : "변동비",
                        item.amount, item.day ? `${month.replace("월", "")}/${item.day}` : "", item.memo || ""
                    ])
                ];
                XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsData), month);
            });
            XLSX.writeFile(wb, "SmartSpend_지출내역.xlsx");
        } catch (err) {
            console.error(err);
            alert("내보내기 중 오류가 발생했습니다.");
        }
    };

    return {
        currentYear, setCurrentYear,
        currentMonth, setCurrentMonth,
        categories, setCategories,
        dbData, setDbData,
        monthlyData, currentData,
        handleSaveItem, deleteItem,
        handleAddCategory, handleDeleteCategory, handleUpdateCategory,
        handleFileUpload, handleDownloadExcel,
        colorPalette
    };
};
