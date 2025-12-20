import { useCallback } from "react";
import * as XLSX from "xlsx";
import { useBudgetContext } from "../context/BudgetContext";
import { COLOR_PALETTE } from "../constants";

export const useExcel = () => {
    const {
        dbData,
        setDbData,
        categories,
        setCategories,
        setCurrentYear,
    } = useBudgetContext();

    const handleDownloadExcel = useCallback(() => {
        if (Object.keys(dbData).length === 0) {
            alert("내보낼 데이터가 없습니다.");
            return;
        }

        const wb = XLSX.utils.book_new();
        const sortedMonths = Object.keys(dbData).sort((a, b) => {
            const [y1, m1] = a.split("-");
            const [y2, m2] = b.split("-");
            if (y1 !== y2) return parseInt(y1) - parseInt(y2);
            return parseInt(m1) - parseInt(m2);
        });

        for (const monthKey of sortedMonths) {
            const monthData = dbData[monthKey];
            if (!monthData || monthData.items.length === 0) continue;

            const [year, month] = monthKey.split("-");
            const sheetName = monthKey.replace("-", "년");

            const wsData = [
                [`${year}년 ${month}`],
                ["분류", "내용", "구분", "금액", "날짜", "메모"],
            ];

            monthData.items
                .sort((a, b) => a.day - b.day)
                .forEach((item) => {
                    wsData.push([
                        item.category,
                        item.name || item.details,
                        item.type === "fixed" ? "고정비" : "변동비",
                        item.amount.toLocaleString(),
                        item.day ? `${parseInt(month)}/${item.day}` : "",
                        item.memo || "",
                    ]);
                });

            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        }

        XLSX.writeFile(wb, `SmartSpend_백업_${new Date().toISOString().split("T")[0]}.xlsx`);
    }, [dbData]);

    const handleFileUpload = useCallback((e) => {
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
                alert("파일을 파싱하는 데 실패했습니다.");
                return;
            }

            try {
                const mergedDbData = JSON.parse(JSON.stringify(dbData));
                const mergedCategories = [...categories];
                const getItemKey = (item) => `${item.category}|${item.name}|${item.amount}|${item.type}|${item.day}|${item.memo || ""}`;

                const existingKeysMap = {};
                for (const mKey in mergedDbData) {
                    existingKeysMap[mKey] = new Set(mergedDbData[mKey].items.map(getItemKey));
                }

                let addedCount = 0;
                let duplicateCount = 0;
                let fileYear = null;
                let currentIdCounter = Date.now();

                for (const wsname of wb.SheetNames) {
                    const ws = wb.Sheets[wsname];
                    if (!ws) continue;

                    const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
                    if (rawData.length < 2) continue;

                    const yearMonthStr = rawData[0] && rawData[0][0];
                    if (!yearMonthStr || typeof yearMonthStr !== "string") continue;

                    const yearMatch = yearMonthStr.match(/(\d{4})년/);
                    const monthMatch = yearMonthStr.match(/(\d{1,2})월/);
                    if (!yearMatch || !monthMatch) continue;

                    const sheetYear = parseInt(yearMatch[1]);
                    const sheetMonthNum = parseInt(monthMatch[1]);
                    const targetMonthKey = `${sheetYear}-${sheetMonthNum}월`;

                    if (!fileYear) fileYear = sheetYear;
                    if (!mergedDbData[targetMonthKey]) {
                        mergedDbData[targetMonthKey] = { items: [] };
                        existingKeysMap[targetMonthKey] = new Set();
                    }

                    for (let i = 2; i < rawData.length; i++) {
                        const row = rawData[i];
                        if (!row || row.length === 0) continue;

                        const categoryName = row[0];
                        const itemName = row[1];
                        const itemTypeRaw = row[2];
                        const rawAmount = row[3];
                        const amount = typeof rawAmount === "string" ? parseInt(rawAmount.replace(/,/g, "")) : parseInt(rawAmount);
                        const dateValue = row[4];
                        const memo = row[5] || "";

                        let day;
                        if (dateValue instanceof Date) day = dateValue.getDate();
                        else if (typeof dateValue === "string" && dateValue.includes("/")) day = parseInt(dateValue.split("/")[1]);
                        else day = parseInt(dateValue);

                        if (!categoryName || !itemName || isNaN(amount)) continue;

                        const newItem = {
                            id: currentIdCounter++,
                            category: categoryName,
                            name: itemName,
                            amount: amount,
                            type: itemTypeRaw === "고정비" ? "fixed" : "variable",
                            day: isNaN(day) ? null : day,
                            details: itemName,
                            memo: memo,
                        };

                        const key = getItemKey(newItem);
                        if (existingKeysMap[targetMonthKey].has(key)) {
                            duplicateCount++;
                            continue;
                        }

                        mergedDbData[targetMonthKey].items.push(newItem);
                        existingKeysMap[targetMonthKey].add(key);
                        addedCount++;

                        if (!mergedCategories.some(c => c.name === categoryName)) {
                            const palette = COLOR_PALETTE[mergedCategories.length % COLOR_PALETTE.length];
                            mergedCategories.push({
                                id: `c${mergedCategories.length + 1}_${Date.now()}`,
                                name: categoryName,
                                ...palette
                            });
                        }
                    }
                }

                setCategories(mergedCategories);
                setDbData(mergedDbData);
                if (fileYear) setCurrentYear(fileYear);
                alert(`데이터 불러오기 완료!\n- 새 항목: ${addedCount}개 추가\n- 중복 항목: ${duplicateCount}개 제외`);
            } catch (error) {
                console.error("Error processing Excel:", error);
                alert("Excel 처리 중 오류가 발생했습니다.");
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.files = null;
    }, [dbData, categories, setCategories, setDbData, setCurrentYear]);

    return {
        handleDownloadExcel,
        handleFileUpload,
    };
};
