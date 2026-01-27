import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { FULL_MONTHS, COLOR_PALETTE } from "../constants";
import { saveBudgetData, loadBudgetData, subscribeToBudgetData, migrateFromLocalStorage, saveFixedExpenseTemplates, loadFixedExpenseTemplates } from "../services/firestoreService";
import { DEFAULT_FIXED_EXPENSE_TEMPLATES, isNewMonth, createExpenseFromTemplate, isFixedExpenseAlreadyCreated, getCurrentMonthDateString } from "../utils/fixedExpenseHelper";

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
    const [fixedExpenseTemplates, setFixedExpenseTemplates] = useState([]);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(FULL_MONTHS[0]);
    const [activeTab, setActiveTab] = useState("home");
    const [isLoading, setIsLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState("idle"); // idle, syncing, synced, error

    const alertShownRef = useRef(false);
    const isInitialLoad = useRef(true);
    const saveTimeoutRef = useRef(null);
    const isDirty = useRef(false); // 변경 사항 추적

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
                    setFixedExpenseTemplates(data.fixedExpenseTemplates || []);
                }

                // 고정비 자동 생성 체크
                await checkAndGenerateMonthlyExpenses(userId);

                // 실시간 구독 설정
                unsubscribe = subscribeToBudgetData(userId, (remoteData) => {
                    if (remoteData && !isInitialLoad.current) {
                        // 원격 데이터와 현재 데이터 비교
                        const remoteUpdatedAt = remoteData.updatedAt?.toMillis?.() || 0;
                        console.log("원격 데이터 수신:", remoteUpdatedAt);

                        setDbData(remoteData.dbData || {});
                        setCategories(remoteData.categories || []);
                        setSyncStatus("synced");
                        isDirty.current = false; // 원격에서 왔으므로 dirty 해제

                        // 동기화 알림 표시
                        if (!alertShownRef.current) {
                            setToast({ show: true, message: "데이터가 동기화되었습니다 ✓", type: "success" });
                            setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
                        }
                    }
                });

                setSyncStatus("synced");

                // 초기 로드 효과가 끝난 후 dirty 상태 관리 시작
                setTimeout(() => {
                    isInitialLoad.current = false;
                    isDirty.current = false;
                }, 100);

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
            isDirty.current = true; // 마이그레이션 발생 시 저장 필요
        }
    }, [dbData]);

    // Firestore 저장 (수동 동기화 및 앱 종료 시 사용)
    const saveToFirestore = useCallback(async (data) => {
        if (!userId) return;

        try {
            setSyncStatus("syncing");
            await saveBudgetData(userId, data);
            setSyncStatus("synced");
            isDirty.current = false; // 저장 성공 시 dirty 해제
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

        // 데이터가 변경되었음을 표시
        isDirty.current = true;

        // LocalStorage에만 백업 저장
        try {
            localStorage.setItem("budgetData", JSON.stringify({ dbData, categories }));
        } catch (error) {
            console.error("LocalStorage 저장 실패:", error);
        }
    }, [dbData, categories]);

    // 변경 사항이 있을 때만 저장하는 함수 (로그아웃 및 앱 종료 시 사용)
    const saveIfDirty = useCallback(async () => {
        const currentData = latestDataRef.current;

        // 데이터가 있고 변경 사항이 있을 때만 저장
        if ((Object.keys(currentData.dbData).length > 0 || currentData.categories.length > 0) && isDirty.current) {
            console.log("변경 사항 감지: 저장 시작...");
            try {
                // 저장 중임을 알림 (UI 블로킹 등은 호출 측에서 처리 가능하지만, 여기선 Toast만)
                // 비동기 처리를 기다려야 하므로 await 필수
                await saveBudgetData(userId, currentData);
                console.log("변경 사항 저장 완료");
                isDirty.current = false;
                return true;
            } catch (err) {
                console.error("변경 사항 저장 실패:", err);
                return false;
            }
        }
        return true; // 저장할 필요 없음
    }, [userId]);

    // 앱 종료 및 백그라운드 전환 시 Firestore에 동기화
    useEffect(() => {
        if (!userId) return;

        const handleBeforeUnload = (e) => {
            // 변경 사항이 있으면 브라우저 종료 전 저장 시도
            if (isDirty.current) {
                // 비동기 호출을 보장하기 어려우므로 표준적인 방법은 아니지만 시도
                saveIfDirty();

                // 일부 브라우저에서 '변경사항이 저장되지 않을 수 있습니다' 경고 표시 가능
                // e.preventDefault();
                // e.returnValue = '';
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                saveIfDirty();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [userId, saveIfDirty]);

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
    const [isFixedExpenseModalOpen, setIsFixedExpenseModalOpen] = useState(false);
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

    // 고정비 자동 생성 체크 함수
    const checkAndGenerateMonthlyExpenses = useCallback(async (uid) => {
        try {
            const lastCheck = localStorage.getItem('lastFixedExpenseCheck');

            if (isNewMonth(lastCheck)) {
                console.log('새로운 달 감지: 고정비 자동 생성 시작');

                // 고정비 템플릿 로드
                const templates = await loadFixedExpenseTemplates(uid);
                const activeTemplates = templates.filter(t => t.isActive);

                if (activeTemplates.length === 0) {
                    console.log('활성화된 고정비 템플릿 없음');
                    localStorage.setItem('lastFixedExpenseCheck', new Date().toISOString());
                    return;
                }

                // 현재 dbData 로드
                const currentData = await loadBudgetData(uid);
                const currentDbData = currentData?.dbData || {};
                const newDbData = { ...currentDbData };
                let generatedCount = 0;

                // 각 템플릿에 대해 지출 항목 생성
                for (const template of activeTemplates) {
                    const dateKey = getCurrentMonthDateString(template.dayOfMonth);

                    // 중복 체크
                    if (!isFixedExpenseAlreadyCreated(newDbData, template.description, dateKey)) {
                        const expense = createExpenseFromTemplate(template);

                        if (!newDbData[dateKey]) {
                            newDbData[dateKey] = [];
                        }

                        newDbData[dateKey].push(expense);
                        generatedCount++;
                        console.log(`고정비 생성: ${template.description} - ${dateKey}`);
                    }
                }

                // 생성된 항목이 있으면 저장
                if (generatedCount > 0) {
                    await saveBudgetData(uid, { ...currentData, dbData: newDbData });
                    setDbData(newDbData);
                    showToast(`${generatedCount}개의 고정비가 자동 생성되었습니다 ✓`, 'success');
                }

                // 마지막 체크 날짜 업데이트
                localStorage.setItem('lastFixedExpenseCheck', new Date().toISOString());
            }
        } catch (error) {
            console.error('고정비 자동 생성 실패:', error);
        }
    }, []);

    // 고정비 템플릿 저장
    const handleSaveFixedExpenseTemplate = useCallback(async (template) => {
        try {
            const existingIndex = fixedExpenseTemplates.findIndex(t => t.id === template.id);
            let updatedTemplates;

            if (existingIndex >= 0) {
                // 수정
                updatedTemplates = [...fixedExpenseTemplates];
                updatedTemplates[existingIndex] = template;
            } else {
                // 추가
                updatedTemplates = [...fixedExpenseTemplates, template];
            }

            await saveFixedExpenseTemplates(userId, updatedTemplates);
            setFixedExpenseTemplates(updatedTemplates);
            showToast('고정비 템플릿이 저장되었습니다 ✓', 'success');
        } catch (error) {
            console.error('고정비 템플릿 저장 실패:', error);
            showToast('저장 실패', 'error');
        }
    }, [userId, fixedExpenseTemplates]);

    // 고정비 템플릿 삭제
    const handleDeleteFixedExpenseTemplate = useCallback(async (templateId) => {
        try {
            const updatedTemplates = fixedExpenseTemplates.filter(t => t.id !== templateId);
            await saveFixedExpenseTemplates(userId, updatedTemplates);
            setFixedExpenseTemplates(updatedTemplates);
            showToast('고정비 템플릿이 삭제되었습니다', 'info');
        } catch (error) {
            console.error('고정비 템플릿 삭제 실패:', error);
            showToast('삭제 실패', 'error');
        }
    }, [userId, fixedExpenseTemplates]);

    // 고정비 템플릿 활성화/비활성화 토글
    const handleToggleFixedExpenseActive = useCallback(async (templateId) => {
        try {
            const updatedTemplates = fixedExpenseTemplates.map(t =>
                t.id === templateId ? { ...t, isActive: !t.isActive } : t
            );
            await saveFixedExpenseTemplates(userId, updatedTemplates);
            setFixedExpenseTemplates(updatedTemplates);
        } catch (error) {
            console.error('고정비 템플릿 토글 실패:', error);
            showToast('변경 실패', 'error');
        }
    }, [userId, fixedExpenseTemplates]);

    // 기본 고정비 템플릿으로 초기화
    const handleInitializeDefaultTemplates = useCallback(async () => {
        try {
            const templatesWithTimestamp = DEFAULT_FIXED_EXPENSE_TEMPLATES.map(t => ({
                ...t,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }));

            await saveFixedExpenseTemplates(userId, templatesWithTimestamp);
            setFixedExpenseTemplates(templatesWithTimestamp);
            showToast('기본 템플릿으로 초기화되었습니다 ✓', 'success');
        } catch (error) {
            console.error('기본 템플릿 초기화 실패:', error);
            showToast('초기화 실패', 'error');
        }
    }, [userId]);

    const value = useMemo(() => ({
        dbData,
        setDbData,
        categories,
        setCategories,
        fixedExpenseTemplates,
        setFixedExpenseTemplates,
        currentYear,
        setCurrentYear,
        currentMonth,
        setCurrentMonth,
        activeTab,
        setActiveTab,
        isCategoryModalOpen,
        setIsCategoryModalOpen,
        isFixedExpenseModalOpen,
        setIsFixedExpenseModalOpen,
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
        saveIfDirty, // 노출
        userId,
        // 고정비 관련
        handleSaveFixedExpenseTemplate,
        handleDeleteFixedExpenseTemplate,
        handleToggleFixedExpenseActive,
        handleInitializeDefaultTemplates,
    }), [dbData, categories, fixedExpenseTemplates, currentYear, currentMonth, activeTab,
        isCategoryModalOpen, isFixedExpenseModalOpen, isInputModalOpen, editingId, inputForm, toast,
        isLoading, syncStatus, manualSync, saveIfDirty, userId,
        handleSaveFixedExpenseTemplate, handleDeleteFixedExpenseTemplate,
        handleToggleFixedExpenseActive, handleInitializeDefaultTemplates]);

    return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};
