import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import { FULL_MONTHS } from "../constants";

const BudgetContext = createContext();

export const useBudgetContext = () => {
    const context = useContext(BudgetContext);
    if (!context) {
        throw new Error("useBudgetContext must be used within a BudgetProvider");
    }
    return context;
};

export const BudgetProvider = ({ children }) => {
    const [dbData, setDbData] = useState({});
    const [categories, setCategories] = useState([]);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(FULL_MONTHS[0]);
    const [activeTab, setActiveTab] = useState("home");

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

    // Legacy Migration
    useEffect(() => {
        if (Object.keys(dbData).length === 0) return;
        let hasLegacy = false;
        const newDbData = JSON.parse(JSON.stringify(dbData));
        const thisYear = new Date().getFullYear();

        Object.keys(newDbData).forEach((key) => {
            if (/^\d+월$/.test(key)) {
                hasLegacy = true;
                const newKey = `${thisYear}-${key}`;
                if (!newDbData[newKey]) {
                    newDbData[newKey] = newDbData[key];
                } else {
                    newDbData[newKey].items = [...newDbData[newKey].items, ...newDbData[key].items];
                }
                delete newDbData[key];
            }
        });

        if (hasLegacy) {
            setDbData(newDbData);
        }
    }, [dbData]);

    // Auto-save
    useEffect(() => {
        if (Object.keys(dbData).length > 0 || categories.length > 0) {
            try {
                localStorage.setItem("budgetData", JSON.stringify({ dbData, categories }));
            } catch (error) {
                console.error("Auto-save failed", error);
            }
        }
    }, [dbData, categories]);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isInputModalOpen, setIsInputModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [inputForm, setInputForm] = useState({
        date: new Date().toISOString().slice(0, 10),
        category: "생활비",
        amount: "",
        details: "",
        memo: "",
        type: "variable",
    });

    const value = {
        dbData,
        setDbData,
        categories,
        setCategories,
        currentYear,
        setCurrentYear,
        currentMonth,
        setCurrentMonth,
        activeTab,
        setActiveTab,
        isCategoryModalOpen,
        setIsCategoryModalOpen,
        isInputModalOpen,
        setIsInputModalOpen,
        editingId,
        setEditingId,
        inputForm,
        setInputForm,
    };

    return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};
