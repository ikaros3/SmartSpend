import React, { useState, useMemo, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import {
  formatNumber,
  formatCurrency,
  cleanNumberString,
} from "./utils/formatters";
import {
  Home,
  List,
  PieChart,
  Settings,
  Plus,
  Bell,
  ChevronRight,
  Wallet,
  CreditCard,
  Gift,
  Landmark,
  ChevronDown,
  Calendar,
  Filter,
  Sparkles,
  X,
  Loader2,
  Send,
  Save,
  RotateCcw,
  User,
  Edit3,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  MoreHorizontal,
  Download,
} from "lucide-react";

// -----------------------------------------------------------------------------
// 0. Mock Data & Configuration
// -----------------------------------------------------------------------------
const apiKey = ""; // API Key will be injected by the runtime environment

// -----------------------------------------------------------------------------
// 1. Helper Components
// -----------------------------------------------------------------------------

const TabButton = ({ isActive, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-2 transition-all active:scale-95 ${
      isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
    }`}
  >
    <Icon
      size={24}
      className={`mb-1 ${isActive ? "fill-blue-100" : ""}`}
      strokeWidth={isActive ? 2.5 : 2}
    />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const Chip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
      active
        ? "bg-blue-600 text-white border-blue-600 shadow-md"
        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
    }`}
  >
    {label}
  </button>
);

// -----------------------------------------------------------------------------
// 2. Main Application
// -----------------------------------------------------------------------------

export default function App() {
  const fullMonths = useMemo(
    () => Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
    []
  );

  const colorPalette = useMemo(
    () => [
      {
        color: "bg-amber-100 text-amber-700",
        chartColor: "text-amber-400",
        fillColor: "#fbbf24",
        icon: "🛒",
      },
      {
        color: "bg-green-100 text-green-700",
        chartColor: "text-green-400",
        fillColor: "#4ade80",
        icon: "💸",
      },
      {
        color: "bg-blue-100 text-blue-700",
        chartColor: "text-blue-400",
        fillColor: "#60a5fa",
        icon: "💳",
      },
      {
        color: "bg-pink-100 text-pink-700",
        chartColor: "text-pink-400",
        fillColor: "#f472b6",
        icon: "🎉",
      },
      {
        color: "bg-cyan-100 text-cyan-700",
        chartColor: "text-cyan-500",
        fillColor: "#06b6d4",
        icon: "📉",
      },
      {
        color: "bg-orange-100 text-orange-700",
        chartColor: "text-orange-400",
        fillColor: "#fb923c",
        icon: "🏦",
      },
      {
        color: "bg-violet-100 text-violet-700",
        chartColor: "text-violet-400",
        fillColor: "#a78bfa",
        icon: "🏛️",
      },
      {
        color: "bg-gray-100 text-gray-700",
        chartColor: "text-gray-400",
        fillColor: "#9ca3af",
        icon: "⋯",
      },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState("home");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(fullMonths[0]);

  // States
  const [categories, setCategories] = useState([]);
  const [dbData, setDbData] = useState({});
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const alertShownRef = useRef(false); // Ref to track if the alert has been shown

  // Load data from local storage on startup
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("budgetData");
      if (savedData) {
        const { dbData: loadedDbData, categories: loadedCategories } =
          JSON.parse(savedData);
        if (loadedDbData && loadedCategories) {
          setDbData(loadedDbData);
          setCategories(loadedCategories);
          if (!alertShownRef.current) {
            // Only show alert if it hasn't been shown before
            alert("데이터 로딩이 완료되었습니다.");
            alertShownRef.current = true; // Mark alert as shown
          }
        }
      }
    } catch (error) {
      console.error("Failed to load data from local storage", error);
      if (!alertShownRef.current) {
        // Also control error alert
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
        alertShownRef.current = true;
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Input Form State
  const [inputForm, setInputForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "", // No default category
    amount: "",
    details: "",
    memo: "",
    type: "variable",
  });

  const monthlyData = useMemo(() => {
    const computed = {};
    for (const [month, data] of Object.entries(dbData)) {
      const itemSum = data.items.reduce((sum, item) => sum + item.amount, 0);
      const finalTotal = itemSum > 0 ? itemSum : 0;
      computed[month] = {
        ...data,
        total: finalTotal,
      };
    }
    return computed;
  }, [dbData]);

  const currentData = monthlyData[currentMonth] || { total: 0, items: [] };

  // --- Logic for Home Dashboard ---
  const prevMonthIndex = fullMonths.indexOf(currentMonth) - 1;
  const prevMonthName = prevMonthIndex >= 0 ? fullMonths[prevMonthIndex] : null;
  const prevMonthTotal = (monthlyData[prevMonthName] || { total: 0 }).total;
  const diffAmount = currentData.total - prevMonthTotal;

  // Upcoming Fixed Expenses
  const todayDate = 10;
  const upcomingFixed = useMemo(() => {
    return currentData.items
      .filter((i) => i.type === "fixed" && i.day >= todayDate)
      .sort((a, b) => a.day - b.day);
  }, [currentData]);

  // --- Logic for Ledger Filter ---
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredItems = useMemo(() => {
    let items = currentData.items;

    if (typeFilter !== "all") {
      items = items.filter((i) => i.type === typeFilter);
    }

    if (categoryFilter !== "all") {
      items = items.filter((i) => i.category === categoryFilter);
    }

    return items.sort((a, b) => a.day - b.day);
  }, [currentData, typeFilter, categoryFilter]);

  const groupedByDay = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const dayKey = item.day;
      if (!acc[dayKey]) acc[dayKey] = { day: dayKey, items: [], total: 0 };
      acc[dayKey].items.push(item);
      acc[dayKey].total += item.amount;
      return acc;
    }, {});
  }, [filteredItems]);

  const maxValInData =
    Math.max(...Object.values(monthlyData).map((d) => d.total)) || 1;
  const chartMax = Math.max(maxValInData, 16000000);
  const getPct = (val) => (val / chartMax) * 100;

  const pieSlices = useMemo(() => {
    const totalToUse = currentData.total;
    if (totalToUse === 0) return [];

    if (currentData.items.length === 0 && currentData.total > 0) {
      return [
        {
          name: "기타",
          amount: currentData.total,
          percent: 1,
          startPercent: 0,
          endPercent: 1,
          chartColor: "text-gray-300",
          fillColor: "#d1d5db",
          icon: "?",
        },
      ];
    }

    let cumulativePercent = 0;
    return categories
      .map((cat) => {
        const catAmount = currentData.items
          .filter((i) => i.category === cat.name)
          .reduce((sum, item) => sum + item.amount, 0);

        if (catAmount === 0) return null;

        const percent = catAmount / totalToUse;
        const startPercent = cumulativePercent;
        cumulativePercent += percent;
        const endPercent = cumulativePercent;

        return {
          ...cat,
          amount: catAmount,
          percent,
          startPercent,
          endPercent,
        };
      })
      .filter(Boolean);
  }, [currentData, categories]);

  const getSlicePath = (startPct, endPct) => {
    const startX = Math.cos(2 * Math.PI * startPct);
    const startY = Math.sin(2 * Math.PI * startPct);
    const endX = Math.cos(2 * Math.PI * endPct);
    const endY = Math.sin(2 * Math.PI * endPct);

    if (Math.abs(endPct - startPct) >= 0.9999) {
      return `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0 Z`;
    }

    const largeArcFlag = endPct - startPct > 0.5 ? 1 : 0;

    return `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    const monthNum = parseInt(currentMonth.replace("월", ""));
    const monthStr = monthNum < 10 ? `0${monthNum}` : monthNum;
    const dayStr = item.day < 10 ? `0${item.day}` : item.day;

    setInputForm({
      date: `${currentYear}-${monthStr}-${dayStr}`,
      category: item.category,
      amount: item.amount,
      details: item.name,
      memo: item.memo || "",
      type: item.type,
    });
    setIsInputModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingId(null);
    const monthNum = parseInt(currentMonth.replace("월", ""));
    const monthStr = monthNum < 10 ? `0${monthNum}` : monthNum;
    const today = new Date().getDate();
    const dayStr = today < 10 ? `0${today}` : today;

    setInputForm({
      date: `${currentYear}-${monthStr}-${dayStr}`,
      category: "생활비",
      amount: "",
      details: "",
      memo: "",
      type: "variable",
    });
    setIsInputModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!inputForm.amount || !inputForm.details) {
      alert("금액과 내용을 입력해주세요.");
      return;
    }

    const newItem = {
      id: editingId || Date.now(),
      category: inputForm.category,
      name: inputForm.details,
      amount: parseInt(inputForm.amount),
      type: inputForm.type,
      day: parseInt(inputForm.date.split("-")[2]),
      details: inputForm.details,
      memo: inputForm.memo,
    };

    setDbData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const targetMonthKey = `${parseInt(inputForm.date.split("-")[1])}월`;

      if (editingId) {
        for (const month in newData) {
          newData[month].items = newData[month].items.filter(
            (i) => i.id !== editingId
          );
        }
      }

      if (!newData[targetMonthKey]) {
        newData[targetMonthKey] = { total: 0, items: [] };
      }
      newData[targetMonthKey].items.push(newItem);

      return newData;
    });

    setIsInputModalOpen(false);
  };

  const deleteItem = (idToDelete) => {
    setDbData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      for (const month in newData) {
        newData[month].items = newData[month].items.filter(
          (i) => i.id !== idToDelete
        );
      }
      return newData;
    });
  };

  const handleDeleteItem = () => {
    if (!editingId) return;
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteItem(editingId);
      setIsInputModalOpen(false);
    }
  };

  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      alert("카테고리 이름을 입력해주세요.");
      return;
    }
    if (categories.some((cat) => cat.name === trimmedName)) {
      alert("이미 존재하는 카테고리입니다.");
      return;
    }

    const newId = `c${Date.now()}`;
    const palette = colorPalette[categories.length % colorPalette.length];

    const newCategory = {
      id: newId,
      name: trimmedName,
      ...palette,
    };

    setCategories((prev) => [...prev, newCategory]);
    setNewCategoryName("");
  };

  const handleDeleteCategory = (idToDelete) => {
    const categoryToDelete = categories.find((c) => c.id === idToDelete);
    if (!categoryToDelete) return;

    if (
      confirm(
        `'${categoryToDelete.name}' 카테고리를 삭제하시겠습니까?\n해당 카테고리로 지정된 모든 항목은 '기타'로 변경됩니다.`
      )
    ) {
      const categoryName = categoryToDelete.name;

      // Update categories - remove the deleted one
      setCategories((prev) => prev.filter((cat) => cat.id !== idToDelete));

      // Update dbData to change the category of associated items to '기타'
      setDbData((prev) => {
        const newData = JSON.parse(JSON.stringify(prev));
        let isUpdated = false;
        for (const month in newData) {
          newData[month].items.forEach((item) => {
            if (item.category === categoryName) {
              item.category = "기타";
              isUpdated = true;
            }
          });
        }
        return isUpdated ? newData : prev;
      });
    }
  };

  const handleUpdateCategory = (id, newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      alert("카테고리 이름은 비워둘 수 없습니다.");
      return;
    }

    const oldCategory = categories.find((cat) => cat.id === id);
    if (!oldCategory) return;
    const oldName = oldCategory.name;

    if (
      trimmedName !== oldName &&
      categories.some((cat) => cat.name === trimmedName)
    ) {
      alert("이미 존재하는 카테고리 이름입니다.");
      return;
    }

    // Update categories state
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, name: trimmedName } : cat))
    );

    // Update dbData state
    setDbData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      for (const month in newData) {
        newData[month].items.forEach((item) => {
          if (item.category === oldName) {
            item.category = trimmedName;
          }
        });
      }
      return newData;
    });

    setEditingCategory(null);
  };

  const handleDeleteClick = (itemToDelete) => {
    if (confirm(`'${itemToDelete.name}' 항목을 정말 삭제하시겠습니까?`)) {
      deleteItem(itemToDelete.id);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      let wb;
      try {
        const arrayBuffer = evt.target.result;
        wb = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert(
          "파일을 파싱하는 데 실패했습니다. 유효한 Excel 파일인지 확인해주세요."
        );
        return;
      }

      try {
        const newDbData = {};
        const allMonths = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
        allMonths.forEach((m) => (newDbData[m] = { items: [] }));

        let fileYear = null;
        let currentIdCounter = 1;
        const skippedSheets = [];

        for (const wsname of wb.SheetNames) {
          const ws = wb.Sheets[wsname];
          if (!ws) {
            skippedSheets.push(`${wsname} (시트를 찾을 수 없음)`);
            continue;
          }

          const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
          if (rawData.length < 2) {
            skippedSheets.push(`${wsname} (내용이 부족하여 건너뜀)`);
            continue;
          }

          const yearMonthRow = rawData[0];
          const yearMonthStr = yearMonthRow && yearMonthRow[0];
          if (!yearMonthStr || typeof yearMonthStr !== "string") {
            skippedSheets.push(`${wsname} (A1셀에 년월 정보가 없음)`);
            continue;
          }

          const yearMatch = yearMonthStr.match(/(\d{4})년/);
          const monthMatch = yearMonthStr.match(/(\d{1,2})월/);

          if (!yearMatch || !monthMatch) {
            skippedSheets.push(
              `${wsname} (A1셀의 년월 형식이 'YYYY년 MM월'이 아님)`
            );
            continue;
          }

          const sheetYear = parseInt(yearMatch[1]);
          const sheetMonthStr = `${parseInt(monthMatch[1])}월`;

          if (!fileYear) {
            fileYear = sheetYear;
          }

          for (let i = 2; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length === 0) continue;

            const categoryName = row[0];
            const itemName = row[1];
            const itemTypeRaw = row[2];
            const amount = parseInt(row[3]);
            const dateValue = row[4];
            const memo = row[5] || "";

            let day;
            if (dateValue instanceof Date) {
              day = dateValue.getDate();
            } else if (
              typeof dateValue === "string" &&
              dateValue.includes("/")
            ) {
              day = parseInt(dateValue.split("/")[1]);
            } else {
              day = parseInt(dateValue);
            }

            if (isNaN(day)) {
              day = null;
            }

            if (!categoryName || !itemName || isNaN(amount) || amount <= 0) {
              continue;
            }

            const itemType = itemTypeRaw === "고정비" ? "fixed" : "variable";

            const newItem = {
              id: currentIdCounter++,
              category: categoryName,
              name: itemName,
              amount: amount,
              type: itemType,
              day: day,
              details: itemName,
              memo: memo,
            };

            if (newDbData[sheetMonthStr]) {
              newDbData[sheetMonthStr].items.push(newItem);
            }
          }
        }

        const allItems = Object.values(newDbData).flatMap(
          (month) => month.items
        );
        const uniqueCategoryNames = [
          ...new Set(allItems.map((item) => item.category)),
        ];

        const newCategories = uniqueCategoryNames.map((name, index) => {
          const palette = colorPalette[index % colorPalette.length];
          return {
            id: `c${index + 1}`,
            name: name,
            ...palette,
          };
        });

        setCategories(newCategories);

        const summary = Object.entries(newDbData)
          .filter(([, data]) => data.items.length > 0)
          .map(([month, data]) => `${month}: ${data.items.length}개 항목`)
          .join("\n");

        setDbData(newDbData);
        if (fileYear) {
          setCurrentYear(fileYear);
        }

        if (skippedSheets.length > 0) {
          alert(
            `데이터를 불러왔습니다. 하지만 다음 시트는 건너뛰었습니다:\n\n${skippedSheets.join(
              "\n"
            )}\n\n처리된 데이터 요약:\n${summary || "없음"}`
          );
        } else {
          alert(
            `데이터를 성공적으로 불러왔습니다.\n\n처리된 데이터 요약:\n${
              summary || "없음"
            }`
          );
        }
      } catch (error) {
        console.error("Error processing data from Excel sheet:", error);
        alert(
          "Excel 시트에서 데이터를 처리하는 중 오류가 발생했습니다. 데이터 구조를 확인해주세요."
        );
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  const handleSaveData = () => {
    if (Object.keys(dbData).length === 0 && categories.length === 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }
    try {
      const dataToSave = {
        dbData,
        categories,
      };
      localStorage.setItem("budgetData", JSON.stringify(dataToSave));
      alert("데이터가 로컬 스토리지에 저장되었습니다.");
    } catch (error) {
      console.error("Failed to save data to local storage", error);
      alert("데이터를 저장하는 중 오류가 발생했습니다.");
    }
  };

  const handleDownloadExcel = () => {
    if (Object.keys(dbData).length === 0) {
      alert("내보낼 데이터가 없습니다.");
      return;
    }

    try {
      const wb = XLSX.utils.book_new();
      const year = currentYear;

      const sortedMonths = Object.keys(dbData).sort(
        (a, b) => parseInt(a) - parseInt(b)
      );

      for (const month of sortedMonths) {
        const monthData = dbData[month];
        if (!monthData || monthData.items.length === 0) continue;

        const wsData = [
          [`${year}년 ${month}`],
          ["분류", "내용", "구분", "금액", "날짜", "메모"],
        ];

        monthData.items
          .sort((a, b) => a.day - b.day)
          .forEach((item) => {
            wsData.push([
              item.category,
              item.name,
              item.type === "fixed" ? "고정비" : "변동비",
              item.amount,
              item.day ? `${parseInt(month)}/${item.day}` : "",
              item.memo || "",
            ]);
          });

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, month);
      }

      if (wb.SheetNames.length === 0) {
        alert("내보낼 데이터가 없습니다.");
        return;
      }

      XLSX.writeFile(wb, "지출내역.xlsx");
    } catch (error) {
      console.error("Error creating Excel file:", error);
      alert("Excel 파일을 생성하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen">
      <style>
        {`
        @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");
        body { font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif; }
        `}
      </style>

      <div className="w-full md:max-w-4xl md:mx-auto md:my-4 md:rounded-[2.5rem] bg-white shadow-2xl flex flex-col h-screen md:h-[95vh] overflow-hidden relative transition-all duration-300">
        {/* --- Header --- */}
        <header className="bg-blue-600 pt-6 pb-4 px-4 shadow-lg rounded-b-xl z-20 shrink-0 flex flex-row items-center justify-between gap-4">
          {/* Left Area: Title & Year - Ratio 3 (approx 30%) */}
          <div className="flex-[3] flex flex-col items-center justify-center gap-2 shrink-0">
            {/* Merged Title with whitespace-nowrap to keep it in one line */}
            <h1 className="text-lg font-bold tracking-tight flex items-center justify-center gap-1 text-white whitespace-nowrap">
              <Wallet size={20} className="text-blue-200" />
              겸이네 가족 가계부
            </h1>

            {/* Centered Year Selector */}
            <div className="relative group w-full flex justify-center">
              <button className="flex items-center space-x-1 bg-blue-700/50 hover:bg-blue-700 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-blue-500 text-white">
                <span>{currentYear}년</span>
                <ChevronDown size={14} />
              </button>
              <div className="absolute top-full mt-1 w-24 bg-white rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {[2024, 2025, 2026].map((year) => (
                  <div
                    key={year}
                    onClick={() => setCurrentYear(year)}
                    className="px-4 py-2 text-sm text-center hover:bg-blue-50 text-gray-700 cursor-pointer"
                  >
                    {year}년
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Area: Month Selection Grid (6 cols x 2 rows) - Ratio 7 (approx 70%) */}
          <div className="flex-[7] grid grid-cols-6 gap-1">
            {fullMonths.map((month) => (
              <button
                key={month}
                onClick={() => setCurrentMonth(month)}
                className={`py-1.5 rounded text-xs font-bold transition-all duration-200 border flex items-center justify-center ${
                  currentMonth === month
                    ? "bg-white text-blue-600 border-white shadow-md scale-105"
                    : "text-blue-100 border-blue-500 hover:bg-blue-500 hover:text-white"
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </header>

        {/* --- Main Content --- */}
        <main className="flex-1 overflow-hidden bg-gray-50 flex flex-col relative">
          {/* TAB 1: HOME */}
          {activeTab === "home" && (
            <div className="flex-1 overflow-y-auto pb-24 p-5 flex flex-col space-y-5 animate-in fade-in duration-300">
              {/* Total Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden flex flex-col justify-center min-h-[200px]">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
                <p className="text-gray-500 text-sm mb-1 font-medium">
                  {currentYear}년 {currentMonth} 지출
                </p>
                <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
                  {formatCurrency(currentData.total)}
                </h2>
                <div className="mt-6 flex flex-col items-center justify-center space-y-2">
                  {/* Prev Month Comparison - Only show if prev month has data */}
                  {prevMonthTotal > 0 && (
                    <div
                      className={`flex items-center text-xs font-bold px-3 py-1 rounded-full border ${
                        diffAmount > 0
                          ? "bg-red-50 text-red-600 border-red-100"
                          : "bg-green-50 text-green-600 border-green-100"
                      }`}
                    >
                      {diffAmount > 0 ? (
                        <TrendingUp size={14} className="mr-1" />
                      ) : (
                        <TrendingDown size={14} className="mr-1" />
                      )}
                      지난달보다 {formatCurrency(Math.abs(diffAmount))}{" "}
                      {diffAmount > 0 ? "더 썼어요 🔺" : "덜 썼어요 📉"}
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Fixed Expenses Summary */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center">
                  <AlertCircle size={16} className="text-blue-500 mr-2" />
                  지출 예정 고정비 (이번달)
                </h3>
                {upcomingFixed.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingFixed.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs">
                            {item.day}일
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {item.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">
                            {formatCurrency(item.amount)}
                          </p>
                          <p className="text-xs text-red-500">
                            D-{Math.max(0, item.day - todayDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 text-center">
                      <p className="text-xs text-gray-500">
                        총{" "}
                        <span className="font-bold text-blue-600">
                          {formatCurrency(
                            upcomingFixed.reduce((a, b) => a + b.amount, 0)
                          )}
                        </span>
                        이 더 나갈 예정입니다.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-xs">
                    남은 고정 지출이 없습니다.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HISTORY (Ledger) */}
          {activeTab === "ledger" && (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              {/* Filter Header - Fixed at Top */}
              <div className="bg-white px-4 py-3 border-b border-gray-100 z-10 space-y-2 shadow-sm shrink-0">
                <div className="flex space-x-2">
                  <Chip
                    label="전체 내역"
                    active={typeFilter === "all"}
                    onClick={() => setTypeFilter("all")}
                  />
                  <Chip
                    label="고정비"
                    active={typeFilter === "fixed"}
                    onClick={() => setTypeFilter("fixed")}
                  />
                  <Chip
                    label="변동비"
                    active={typeFilter === "variable"}
                    onClick={() => setTypeFilter("variable")}
                  />
                </div>
                <div className="flex flex-wrap gap-0.5 pb-1">
                  <Chip
                    label="전체"
                    active={categoryFilter === "all"}
                    onClick={() => setCategoryFilter("all")}
                  />
                  {categories.map((cat) => (
                    <Chip
                      key={cat.id}
                      label={cat.name}
                      active={categoryFilter === cat.name}
                      onClick={() => setCategoryFilter(cat.name)}
                    />
                  ))}
                </div>
              </div>

              {/* Table - Scrollable Area */}
              <div className="flex-1 overflow-y-auto pb-24">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <List size={48} className="mb-4 opacity-20" />
                    <p>조건에 맞는 내역이 없습니다.</p>
                  </div>
                ) : (
                  <div className="bg-white">
                    {/* Table Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                      <div className="grid grid-cols-[2fr_1fr_0.8fr_1fr_0.7fr] gap-4 px-4 py-3 text-xs font-bold text-gray-700">
                        <div>항목</div>
                        <div className="text-right">금액</div>
                        <div className="text-center">날짜</div>
                        <div>메모</div>
                        <div className="text-right">관리</div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-100">
                      {filteredItems.map((item, idx) => {
                        const fallbackCat = {
                          name: "기타",
                          icon: "⋯",
                          chartColor: "text-gray-400",
                        };
                        const catInfo =
                          categories.find((c) => c.name === item.category) ||
                          fallbackCat;
                        return (
                          <div
                            key={item.id || idx}
                            className="grid grid-cols-[2fr_1fr_0.8fr_1fr_0.7fr] gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            {/* 항목 열 */}
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-8 h-8 rounded flex items-center justify-center text-sm text-white shrink-0 ${catInfo.chartColor.replace(
                                  "text",
                                  "bg"
                                )}`}
                              >
                                {catInfo.icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-gray-800 truncate">
                                  {item.name}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-xs text-gray-500">
                                    {item.category}
                                  </span>
                                  <span
                                    className={`text-[10px] px-1 py-0 rounded border font-medium ${
                                      item.type === "fixed"
                                        ? "bg-blue-50 text-blue-600 border-blue-200"
                                        : "bg-orange-50 text-orange-600 border-orange-200"
                                    }`}
                                  >
                                    {item.type === "fixed" ? "고정" : "변동"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* 금액 열 */}
                            <div className="text-right flex items-center justify-end">
                              <span className="text-sm font-bold text-gray-900">
                                - {formatCurrency(item.amount)}
                              </span>
                            </div>

                            {/* 날짜 열 */}
                            <div className="text-center flex items-center justify-center">
                              <span className="text-sm text-gray-600">
                                {item.day
                                  ? `${currentMonth.replace("월", "")}/${
                                      item.day
                                    }`
                                  : ""}
                              </span>
                            </div>

                            {/* 메모 열 */}
                            <div className="flex items-center min-w-0">
                              {item.memo ? (
                                <span className="text-xs text-gray-500 truncate">
                                  {item.memo}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-300">-</span>
                              )}
                            </div>

                            {/* 관리 열 */}
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleEditClick(item)}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(item)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* 총합계 행 */}
                      {filteredItems.length > 0 && (
                        <div className="grid grid-cols-[2fr_1fr_0.8fr_1fr_0.7fr] gap-4 px-4 py-4 bg-gray-50 border-t-2 border-gray-300 font-bold">
                          <div className="text-sm text-gray-700">합계</div>
                          <div className="text-right">
                            <span className="text-sm text-gray-900">
                              -
                              {formatCurrency(
                                filteredItems.reduce(
                                  (sum, item) => sum + item.amount,
                                  0
                                )
                              )}
                            </span>
                          </div>
                          <div></div>
                          <div></div>
                          <div></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STATISTICS */}
          {activeTab === "stats" && (
            <div className="flex-1 overflow-y-auto pb-24 p-5 flex flex-col space-y-5 animate-in fade-in duration-300">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  월별 지출 추이
                </h2>
                <div className="relative h-64 w-full mt-4">
                  <div className="absolute inset-0 flex flex-col justify-end">
                    <div
                      className="absolute w-full border-b border-dashed border-gray-200"
                      style={{ bottom: `${getPct(5000000)}%` }}
                    >
                      <span className="absolute -top-3 left-0 text-[10px] text-gray-400 bg-white pr-1">
                        500만
                      </span>
                    </div>
                    <div
                      className="absolute w-full border-b border-red-300 border-solid"
                      style={{ bottom: `${getPct(10000000)}%` }}
                    >
                      <span className="absolute -top-3 left-0 text-[10px] font-bold text-red-400 bg-white pr-1">
                        1,000만
                      </span>
                    </div>
                    <div
                      className="absolute w-full border-b border-dashed border-gray-200"
                      style={{ bottom: `${getPct(15000000)}%` }}
                    >
                      <span className="absolute -top-3 left-0 text-[10px] text-gray-400 bg-white pr-1">
                        1,500만
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-end justify-between gap-1 pb-2 pl-8">
                    {fullMonths.map((month) => {
                      const data = monthlyData[month] || { total: 0 };
                      const total = data.total;
                      const isActive = month === currentMonth;
                      const heightPct = getPct(total);
                      const isOverLimit = total > 10000000;
                      return (
                        <div
                          key={month}
                          className="flex flex-col items-center justify-end h-full flex-1 group cursor-pointer"
                          onClick={() => setCurrentMonth(month)}
                        >
                          <div className="w-full flex-1 flex items-end justify-center relative">
                            <div
                              className={`w-full max-w-[32px] rounded-t-sm transition-all duration-500 relative ${
                                isActive
                                  ? isOverLimit
                                    ? "bg-pink-500 shadow-md"
                                    : "bg-blue-600 shadow-md"
                                  : isOverLimit
                                  ? "bg-pink-200 group-hover:bg-pink-300"
                                  : "bg-blue-100 group-hover:bg-blue-200"
                              }`}
                              style={{ height: `${Math.max(heightPct, 4)}%` }}
                            >
                              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[9px] font-bold text-gray-600 whitespace-nowrap">
                                {formatNumber(Math.floor(total / 10000))}만원
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] mt-2 whitespace-nowrap ${
                              isActive
                                ? "font-bold text-gray-800"
                                : "text-gray-400"
                            }`}
                          >
                            {month.replace("월", "")}월
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h2 className="text-lg font-bold text-gray-800 mb-4 self-start">
                  지출 분석
                </h2>

                {/* 5/12 Pie vs 7/12 Legend Split */}
                <div className="flex flex-row items-center w-full justify-between gap-4">
                  <div className="w-5/12 flex justify-center items-center">
                    <div className="w-[85%] aspect-square relative flex items-center justify-center">
                      <svg
                        viewBox="-1.2 -1.2 2.4 2.4"
                        className="w-full h-full transform -rotate-90"
                      >
                        {currentData.total === 0 ? (
                          <circle cx="0" cy="0" r="1" fill="#e5e7eb" />
                        ) : (
                          pieSlices.map((slice, i) => (
                            <g key={i}>
                              <path
                                d={getSlicePath(
                                  slice.startPercent,
                                  slice.endPercent
                                )}
                                fill={slice.fillColor || "#9ca3af"}
                              />
                            </g>
                          ))
                        )}
                        <circle cx="0" cy="0" r="0.6" fill="white" />
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] text-gray-400">
                          총 지출
                        </span>
                        <span className="text-sm md:text-lg font-bold text-gray-800">
                          {currentData.total > 10000000
                            ? (currentData.total / 10000000).toFixed(1) + "천만"
                            : formatNumber(currentData.total / 10000) + "만"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-7/12 flex flex-col justify-center space-y-3 pl-1">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex justify-between items-center text-sm w-full"
                      >
                        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center text-xs text-white shrink-0 ${cat.chartColor.replace(
                              "text",
                              "bg"
                            )}`}
                          >
                            {cat.icon}
                          </div>
                          <span className="font-bold text-gray-700 truncate text-[15px]">
                            {cat.name}
                          </span>
                        </div>
                        <span className="font-bold text-gray-600 whitespace-nowrap text-[13px]">
                          {formatNumber(
                            Math.round(
                              currentData.items
                                .filter((i) => i.category === cat.name)
                                .reduce((a, b) => a + b.amount, 0) / 10000
                            )
                          )}
                          만원
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === "settings" && (
            <div className="flex-1 overflow-y-auto pb-24 p-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    겸이네 가족
                  </h2>
                  <p className="text-xs text-gray-500">관리자 계정</p>
                </div>
              </div>

              <div className="space-y-4">
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
                        <span className="text-sm font-medium">
                          카테고리 관리
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                    <div className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Settings size={18} className="text-green-500" />
                        <span className="text-sm font-medium">
                          고정비/변동비 기준 설정
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </section>

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
                        <span className="text-sm font-medium">
                          데이터 백업/저장
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                    <div
                      onClick={handleDownloadExcel}
                      className="p-4 flex justify-between items-center border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Download size={18} className="text-teal-500" />
                        <span className="text-sm font-medium">
                          엑셀로 내보내기
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                    <label className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <RotateCcw size={18} className="text-orange-500" />
                        <span className="text-sm font-medium">
                          데이터 불러오기
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                      />
                      <ChevronRight size={16} className="text-gray-400" />
                    </label>
                  </div>
                </section>
              </div>
            </div>
          )}
        </main>

        {/* --- FAB (Floating Action Button) --- */}
        <div className="absolute bottom-24 md:bottom-28 right-6 z-20">
          <button
            onClick={handleCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl shadow-blue-600/40 transition-transform active:scale-95 flex items-center justify-center"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>

        {/* --- Bottom Navigation Bar (Fixed Layout) --- */}
        <nav className="bg-white border-t border-gray-200 h-20 flex justify-around items-center px-2 pb-safe w-full z-30 rounded-t-2xl shadow-[0_-5px_10px_rgba(0,0,0,0.02)] shrink-0 relative">
          <TabButton
            isActive={activeTab === "home"}
            onClick={() => setActiveTab("home")}
            icon={Home}
            label="홈"
          />
          <TabButton
            isActive={activeTab === "ledger"}
            onClick={() => setActiveTab("ledger")}
            icon={List}
            label="내역"
          />
          <TabButton
            isActive={activeTab === "stats"}
            onClick={() => setActiveTab("stats")}
            icon={PieChart}
            label="통계"
          />
          <TabButton
            isActive={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            icon={Settings}
            label="설정"
          />
        </nav>

        {/* --- Input Modal --- */}
        {isInputModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 flex flex-col max-h-[95vh]">
              <div className="bg-blue-600 p-4 flex justify-between items-center text-white shrink-0">
                <h3 className="font-bold text-lg">
                  {editingId ? "지출 수정" : "지출 입력"}
                </h3>
                <button onClick={() => setIsInputModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                {/* Date */}
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">
                    날짜
                  </label>
                  <input
                    type="date"
                    value={inputForm.date}
                    onChange={(e) =>
                      setInputForm({ ...inputForm, date: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">
                    카테고리
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() =>
                          setInputForm({ ...inputForm, category: cat.name })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          inputForm.category === cat.name
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Type */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setInputForm({ ...inputForm, type: "variable" })
                    }
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border ${
                      inputForm.type === "variable"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    변동비
                  </button>
                  <button
                    onClick={() =>
                      setInputForm({ ...inputForm, type: "fixed" })
                    }
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border ${
                      inputForm.type === "fixed"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    고정비
                  </button>
                </div>
                {/* Amount */}
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">
                    금액
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0"
                      value={formatNumber(inputForm.amount)}
                      onChange={(e) => {
                        const cleanedValue = cleanNumberString(e.target.value);
                        setInputForm({ ...inputForm, amount: cleanedValue });
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-3 text-sm text-gray-400">
                      원
                    </span>
                  </div>
                </div>
                {/* Details */}
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">
                    세부내역
                  </label>
                  <input
                    type="text"
                    placeholder="내용을 입력하세요 (예: 점심 식사)"
                    value={inputForm.details}
                    onChange={(e) =>
                      setInputForm({ ...inputForm, details: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {/* Memo (Added) */}
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">
                    메모
                  </label>
                  <textarea
                    placeholder="추가적인 메모를 입력하세요"
                    value={inputForm.memo}
                    onChange={(e) =>
                      setInputForm({ ...inputForm, memo: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveItem}
                    className={`bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors ${
                      editingId ? "flex-[2]" : "w-full"
                    }`}
                  >
                    {editingId ? "수정 완료" : "저장하기"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Category Management Modal --- */}
        {isCategoryModalOpen && (
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
                  <h4 className="text-xs font-bold text-gray-500 mt-4">
                    현재 카테고리
                  </h4>
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
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
                                handleUpdateCategory(
                                  editingCategory.id,
                                  editingCategory.name
                                )
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
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded flex items-center justify-center text-sm text-white shrink-0 ${cat.chartColor.replace(
                                "text",
                                "bg"
                              )}`}
                            >
                              {cat.icon}
                            </div>
                            <span className="text-sm font-medium text-gray-800">
                              {cat.name}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingCategory(cat)}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">
                      카테고리가 없습니다.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
