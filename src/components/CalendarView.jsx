import React, { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';

export default function CalendarView({
    currentYear,
    currentMonth,
    monthlyData,
    categories,
    formatCurrency
}) {
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());

    const monthNum = parseInt(currentMonth.replace("월", ""));
    const currentData = useMemo(() => {
        // useBudget의 monthlyData는 12개월 배열이므로 인덱스로 접근
        return monthlyData[monthNum - 1] || { items: [] };
    }, [monthlyData, monthNum]);

    // 달력 데이터 생성
    const calendarData = useMemo(() => {
        const daysInMonth = new Date(currentYear, monthNum, 0).getDate();
        const startDay = new Date(currentYear, monthNum - 1, 1).getDay(); // 0: 일요일

        const days = [];

        // 시작 요일 맞추기 위한 빈 칸
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // 날짜 채우기
        for (let day = 1; day <= daysInMonth; day++) {
            const items = currentData.items.filter(item => item.day === day);
            days.push({ day, items });
        }

        return days;
    }, [currentYear, monthNum, currentData]);

    // 선택된 날짜의 아이템 필터링
    const selectedDayItems = useMemo(() => {
        if (!selectedDay) return [];
        return currentData.items.filter(item => item.day === selectedDay);
    }, [selectedDay, currentData]);

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-2 text-sm flex items-center">
                <Calendar size={16} className="text-blue-500 mr-2" />
                {currentYear}년 {currentMonth}
            </h3>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                    <div key={idx} className={`text-center text-[17px] font-bold py-1 ${idx === 0 ? 'text-red-400' : idx === 6 ? 'text-blue-400' : 'text-gray-400'
                        }`}>
                        {day}
                    </div>
                ))}
            </div>

            {/* 달력 그리드 */}
            <div className="grid grid-cols-7 gap-0.5">
                {calendarData.map((dayData, idx) => (
                    <div key={idx} className="h-12">
                        {dayData ? (
                            <button
                                onClick={() => setSelectedDay(dayData.day)}
                                className={`w-full h-full rounded-md flex flex-col items-center justify-start pt-1 transition-all relative border ${selectedDay === dayData.day
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-1 ring-blue-200 z-10'
                                    : dayData.items.length > 0
                                        ? 'bg-indigo-50 text-indigo-900 border-indigo-100 font-semibold hover:bg-indigo-100 hover:border-indigo-200'
                                        : 'bg-white text-gray-400 border-transparent hover:bg-gray-50 hover:border-gray-200'
                                    }`}
                            >
                                <span className={`text-[16px] ${selectedDay === dayData.day ? 'font-bold' : ''
                                    }`}>
                                    {dayData.day}
                                </span>
                                {dayData.items.length > 0 && (
                                    <div className="absolute bottom-1 flex gap-0.5 justify-center w-full px-0.5">
                                        {dayData.items.slice(0, 3).map((item, itemIdx) => {
                                            const cat = categories.find(c => c.name === item.category) || { icon: '•', chartColor: 'text-gray-400' };
                                            // 선택되지 않았을 때 아이콘 색상을 좀 더 진하게 조정할 필요가 있음
                                            const colorClass = selectedDay === dayData.day ? 'text-white' : cat.chartColor;
                                            return (
                                                <span key={itemIdx} className={`text-[6px] leading-none ${colorClass}`}>
                                                    ●
                                                </span>
                                            );
                                        })}
                                        {dayData.items.length > 3 && (
                                            <span className={`text-[6px] leading-none font-bold ${selectedDay === dayData.day ? 'text-white' : 'text-gray-400'
                                                }`}>
                                                +
                                            </span>
                                        )}
                                    </div>
                                )}
                            </button>
                        ) : (
                            <div className="w-full h-full"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* 선택된 날짜의 지출 내역 */}
            {selectedDay && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="font-bold text-gray-800 mb-3 text-sm">
                        {currentMonth.replace('월', '')}/{selectedDay}일 지출 내역
                    </h4>
                    {selectedDayItems.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">
                            이 날짜에 지출 내역이 없습니다.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {selectedDayItems.map((item, idx) => {
                                const cat = categories.find(c => c.name === item.category) || { icon: '⋯', chartColor: 'text-gray-400' };
                                return (
                                    <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-lg ${cat.chartColor}`}>{cat.icon}</span>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.category}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-gray-900">-{formatCurrency(item.amount)}</p>
                                    </div>
                                );
                            })}
                            <div className="mt-2 pt-2 border-t border-gray-200 text-right">
                                <p className="text-base text-gray-600">
                                    합계: <span className="font-bold text-blue-600">
                                        {formatCurrency(selectedDayItems.reduce((sum, item) => sum + item.amount, 0))}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
