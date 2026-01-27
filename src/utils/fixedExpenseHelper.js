// 고정비 자동 생성 관련 유틸리티 함수

/**
 * 기본 고정비 템플릿 정의
 */
export const DEFAULT_FIXED_EXPENSE_TEMPLATES = [
    {
        id: 'default-1',
        category: '생활비',
        description: '생활비(효원)',
        amount: 4000000,
        dayOfMonth: 1,
        isActive: true
    },
    {
        id: 'default-2',
        category: '용돈',
        description: '규리',
        amount: 1000000,
        dayOfMonth: 25,
        isActive: true
    },
    {
        id: 'default-3',
        category: '용돈',
        description: '시연',
        amount: 800000,
        dayOfMonth: 25,
        isActive: true
    },
    {
        id: 'default-4',
        category: '대출상환',
        description: '담보대출(0.8억)',
        amount: 350000,
        dayOfMonth: 27,
        isActive: true
    },
    {
        id: 'default-5',
        category: '대출상환',
        description: '담보대출(1억)',
        amount: 350000,
        dayOfMonth: 27,
        isActive: true
    },
    {
        id: 'default-6',
        category: '대출상환',
        description: '보금자리론(1.2억)',
        amount: 350000,
        dayOfMonth: 30,
        isActive: true
    },
    {
        id: 'default-7',
        category: '세금/공과금',
        description: '건강보험료(지역)',
        amount: 177450,
        dayOfMonth: 10,
        isActive: true
    }
];

/**
 * 분류별 색상 매핑
 */
export const CATEGORY_COLORS = {
    '생활비': 'bg-blue-500',
    '용돈': 'bg-green-500',
    '대출상환': 'bg-orange-500',
    '세금/공과금': 'bg-purple-500',
    '기타': 'bg-gray-500'
};

/**
 * 두 날짜가 같은 월인지 확인
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {boolean}
 */
export const isSameMonth = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth();
};

/**
 * 새로운 달로 넘어갔는지 확인
 * @param {string|null} lastCheckDate - ISO 문자열 형태의 마지막 체크 날짜
 * @returns {boolean}
 */
export const isNewMonth = (lastCheckDate) => {
    if (!lastCheckDate) return true;

    const lastCheck = new Date(lastCheckDate);
    const today = new Date();

    return !isSameMonth(lastCheck, today);
};

/**
 * 특정 월의 특정 일자에 해당하는 날짜 생성
 * 해당 월에 그 날짜가 없으면 마지막 날로 조정
 * @param {number} year 
 * @param {number} month - 0-based (0 = January)
 * @param {number} dayOfMonth - 1-31
 * @returns {Date}
 */
export const getDateForMonth = (year, month, dayOfMonth) => {
    // 해당 월의 마지막 날 구하기
    const lastDay = new Date(year, month + 1, 0).getDate();

    // dayOfMonth가 해당 월의 마지막 날보다 크면 마지막 날로 조정
    const adjustedDay = Math.min(dayOfMonth, lastDay);

    return new Date(year, month, adjustedDay);
};

/**
 * 현재 월의 특정 일자에 해당하는 날짜 문자열 생성 (YYYY-MM-DD)
 * @param {number} dayOfMonth 
 * @returns {string}
 */
export const getCurrentMonthDateString = (dayOfMonth) => {
    const today = new Date();
    const date = getDateForMonth(today.getFullYear(), today.getMonth(), dayOfMonth);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * dbData에서 특정 고정비가 이미 생성되었는지 확인
 * @param {Object} dbData - { "YYYY-MM-DD": [...items] }
 * @param {string} description - 고정비 설명
 * @param {string} dateKey - YYYY-MM-DD 형태의 날짜 키
 * @returns {boolean}
 */
export const isFixedExpenseAlreadyCreated = (dbData, description, dateKey) => {
    if (!dbData || !dbData[dateKey]) return false;

    const items = dbData[dateKey];
    return items.some(item =>
        item.description === description &&
        item.isFixedExpense === true
    );
};

/**
 * 고정비 템플릿으로부터 지출 항목 생성
 * @param {Object} template - 고정비 템플릿
 * @returns {Object} - 지출 항목
 */
export const createExpenseFromTemplate = (template) => {
    const dateKey = getCurrentMonthDateString(template.dayOfMonth);

    return {
        id: `fixed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: dateKey,
        category: template.category,
        description: template.description,
        amount: template.amount,
        isFixedExpense: true, // 고정비 자동 생성 항목임을 표시
        createdAt: new Date().toISOString()
    };
};

/**
 * UUID 생성 (간단한 버전)
 * @returns {string}
 */
export const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
