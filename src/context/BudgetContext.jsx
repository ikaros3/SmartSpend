import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { FULL_MONTHS, COLOR_PALETTE } from "../constants";
import { saveBudgetData, loadBudgetData, subscribeToBudgetData, migrateFromLocalStorage } from "../services/firestoreService";

const BudgetContext = createContext();

export const useBudgetContext = () => {
    const context = useContext(BudgetContext);
    if (!context) {
        throw new Error("useBudgetContext must be used within a BudgetProvider");
    }
    return context;
};

export const BudgetProvider = ({ children, userId }) => {
    const [dbData, setDbData] = useState({});
    const [categories, setCategories] = useState([]);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(FULL_MONTHS[0]);
    const [activeTab, setActiveTab] = useState("home");
    const [isLoading, setIsLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState("idle"); // idle, syncing, synced, error

    const alertShownRef = useRef(false);
    const isInitialLoad = useRef(true);
    const saveTimeoutRef = useRef(null);

    // Firestore에서 데이터 로드 및 실시간 구독
    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        let unsubscribe = () => { };

        const initializeData = async () => {
            try {
                setIsLoading(true);
                setSyncStatus("syncing");

                // LocalStorage → Firestore 마이그레이션 (최초 1회)
                await migrateFromLocalStorage(userId);

                // Firestore에서 초기 데이터 로드
                const data = await loadBudgetData(userId);
                if (data) {
                    setDbData(data.dbData || {});
                    setCategories(data.categories || []);
                }

                // 실시간 구독 설정
                unsubscribe = subscribeToBudgetData(userId, (remoteData) => {
                    if (remoteData && !isInitialLoad.current) {
                        // 원격 데이터와 현재 데이터 비교
                        const remoteUpdatedAt = remoteData.updatedAt?.toMillis?.() || 0;
                        console.log("원격 데이터 수신:", remoteUpdatedAt);

                        setDbData(remoteData.dbData || {});
                        setCategories(remoteData.categories || []);
                        setSyncStatus("synced");

                        // 동기화 알림 표시
                        if (!alertShownRef.current) {
                            setToast({ show: true, message: "데이터가 동기화되었습니다 ✓", type: "success" });
                            setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
                        }
                    }
                });

                setSyncStatus("synced");
                isInitialLoad.current = false;

                // 초기 로드 완료 알림
                if (!alertShownRef.current) {
                    setToast({ show: true, message: "데이터를 불러왔습니다 ✓", type: "success" });
                    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
                    alertShownRef.current = true;
                }
            } catch (error) {
                console.error("데이터 로드 실패:", error);
                setSyncStatus("error");

                // 오프라인 모드: LocalStorage에서 로드
                try {
                    const savedData = localStorage.getItem("budgetData");
                    if (savedData) {
                        const { dbData: loadedDbData, categories: loadedCategories } = JSON.parse(savedData);
                        setDbData(loadedDbData || {});
                        setCategories(loadedCategories || []);
                        setToast({ show: true, message: "오프라인 모드: 로컬 데이터 사용 중", type: "info" });
                        setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
                    }
                } catch (e) {
                    console.error("LocalStorage 로드 실패:", e);
                }
            } finally {
                setIsLoading(false);
            }
        };

        initializeData();

        return () => {
            unsubscribe();
        };
    }, [userId]);

    // Legacy Migration (연도 없는 키 → 연도 포함 키)
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

    // Firestore 자동 저장 (디바운스 적용)
    const saveToFirestore = useCallback(async (data) => {
        if (!userId) return;

        try {
            setSyncStatus("syncing");
            await saveBudgetData(userId, data);
            setSyncStatus("synced");
        } catch (error) {
            console.error("Firestore 저장 실패:", error);
            setSyncStatus("error");
            // 로컬에도 백업 저장
            localStorage.setItem("budgetData", JSON.stringify(data));
        }
    }, [userId]);

    // 데이터 변경 시 LocalStorage에만 백업 저장 (Firestore 자동 동기화 제거)
    // Firestore 저장을 위한 최신 데이터 참조 유지
    const latestDataRef = useRef({ dbData, categories });
    useEffect(() => {
        latestDataRef.current = { dbData, categories };

        if (isInitialLoad.current) return;

        // LocalStorage에만 백업 저장
        try {
            localStorage.setItem("budgetData", JSON.stringify({ dbData, categories }));
        } catch (error) {
            console.error("LocalStorage 저장 실패:", error);
        }
    }, [dbData, categories]);

    // 앱 종료 및 백그라운드 전환 시 Firestore에 동기화
    useEffect(() => {
        if (!userId) return;

        const handleSave = () => {
            // 데이터가 비어있지 않은 경우에만 저장 (안전장치)
            const currentData = latestDataRef.current;
            if (Object.keys(currentData.dbData).length > 0 || currentData.categories.length > 0) {
                // 비동기 함수지만 이벤트 핸들러 내부라 await 불가, fire-and-forget 방식 사용
                saveBudgetData(userId, currentData).catch(err =>
                    console.error("자동 저장 실패:", err)
                );
                // 일부 브라우저를 위한 fetch keepalive (옵션)
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                handleSave();
            }
        };

        window.addEventListener('beforeunload', handleSave);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleSave);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [userId]);

    // 수동 동기화 함수
    const manualSync = useCallback(async () => {
        if (!userId) return;

        try {
            setSyncStatus("syncing");
            await saveToFirestore({ dbData, categories });
            setToast({ show: true, message: "동기화 완료 ✓", type: "success" });
            setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
        } catch (error) {
            setToast({ show: true, message: "동기화 실패", type: "error" });
            setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
        }
    }, [userId, dbData, categories, saveToFirestore]);

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

    // Toast state
    const [toast, setToast] = useState({ show: false, message: "", type: "info" });

    const showToast = (message, type = "info") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "info" });
        }, 3000);
    };

    const value = useMemo(() => ({
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
        toast,
        showToast,
        // 새로운 속성
        isLoading,
        syncStatus,
        manualSync,
        userId,
    }), [dbData, categories, currentYear, currentMonth, activeTab,
        isCategoryModalOpen, isInputModalOpen, editingId, inputForm, toast,
        isLoading, syncStatus, manualSync, userId]);

    return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};
