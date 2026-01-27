// Firestore 데이터베이스 서비스
import {
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * 사용자 예산 데이터 문서 참조 반환
 * @param {string} userId - 사용자 UID
 * @returns {DocumentReference}
 */
const getUserBudgetRef = (userId) => doc(db, 'budgets', userId);

/**
 * 예산 데이터 저장
 * @param {string} userId - 사용자 UID
 * @param {Object} data - 저장할 데이터 { dbData, categories }
 * @returns {Promise<void>}
 */
export const saveBudgetData = async (userId, data) => {
    if (!userId) {
        console.error('saveBudgetData: userId가 필요합니다');
        return;
    }

    try {
        await setDoc(getUserBudgetRef(userId), {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });
        console.log('Firestore에 데이터 저장 완료');
    } catch (error) {
        console.error('Firestore 저장 실패:', error);
        throw error;
    }
};

/**
 * 예산 데이터 불러오기
 * @param {string} userId - 사용자 UID
 * @returns {Promise<Object|null>}
 */
export const loadBudgetData = async (userId) => {
    if (!userId) {
        console.error('loadBudgetData: userId가 필요합니다');
        return null;
    }

    try {
        const snapshot = await getDoc(getUserBudgetRef(userId));
        if (snapshot.exists()) {
            const data = snapshot.data();
            console.log('Firestore에서 데이터 로드 완료');
            return data;
        }
        console.log('Firestore에 저장된 데이터 없음');
        return null;
    } catch (error) {
        console.error('Firestore 로드 실패:', error);
        throw error;
    }
};

/**
 * 예산 데이터 실시간 구독
 * @param {string} userId - 사용자 UID
 * @param {Function} callback - 데이터 변경 시 호출될 콜백
 * @returns {Function} 구독 해제 함수
 */
export const subscribeToBudgetData = (userId, callback) => {
    if (!userId) {
        console.error('subscribeToBudgetData: userId가 필요합니다');
        return () => { };
    }

    return onSnapshot(
        getUserBudgetRef(userId),
        (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.data());
            } else {
                callback(null);
            }
        },
        (error) => {
            console.error('Firestore 구독 오류:', error);
        }
    );
};

/**
 * LocalStorage에서 Firestore로 데이터 마이그레이션
 * 최초 로그인 시 기존 데이터를 이전합니다.
 * @param {string} userId - 사용자 UID
 * @returns {Promise<boolean>} 마이그레이션 수행 여부
 */
export const migrateFromLocalStorage = async (userId) => {
    try {
        // 로컬 데이터 확인
        const localData = localStorage.getItem('budgetData');
        if (!localData) {
            return false;
        }

        // Firestore에 이미 데이터가 있는지 확인
        const existingData = await loadBudgetData(userId);
        if (existingData && existingData.dbData && Object.keys(existingData.dbData).length > 0) {
            console.log('Firestore에 이미 데이터가 있어 마이그레이션을 건너뜁니다');
            return false;
        }

        // LocalStorage 데이터를 Firestore로 이전
        const parsed = JSON.parse(localData);
        await saveBudgetData(userId, parsed);
        console.log('LocalStorage → Firestore 마이그레이션 완료');

        return true;
    } catch (error) {
        console.error('마이그레이션 실패:', error);
        return false;
    }
};

/**
 * 사용자 데이터 완전 삭제
 * @param {string} userId - 사용자 UID
 * @returns {Promise<void>}
 */
export const deleteUserData = async (userId) => {
    if (!userId) {
        console.error('deleteUserData: userId가 필요합니다');
        return;
    }

    try {
        // Firestore 문서를 빈 객체로 덮어쓰기 (완전 초기화)
        await setDoc(getUserBudgetRef(userId), {
            dbData: {},
            categories: [],
            updatedAt: serverTimestamp()
        });
        console.log('Firestore 데이터 완전 삭제 완료');
    } catch (error) {
        console.error('Firestore 삭제 실패:', error);
        throw error;
    }
};

/**
 * 고정비 템플릿 저장
 * @param {string} userId - 사용자 UID
 * @param {Array} templates - 고정비 템플릿 배열
 * @returns {Promise<void>}
 */
export const saveFixedExpenseTemplates = async (userId, templates) => {
    if (!userId) {
        console.error('saveFixedExpenseTemplates: userId가 필요합니다');
        return;
    }

    try {
        await setDoc(getUserBudgetRef(userId), {
            fixedExpenseTemplates: templates,
            updatedAt: serverTimestamp()
        }, { merge: true });
        console.log('고정비 템플릿 저장 완료');
    } catch (error) {
        console.error('고정비 템플릿 저장 실패:', error);
        throw error;
    }
};

/**
 * 고정비 템플릿 로드
 * @param {string} userId - 사용자 UID
 * @returns {Promise<Array>}
 */
export const loadFixedExpenseTemplates = async (userId) => {
    if (!userId) {
        console.error('loadFixedExpenseTemplates: userId가 필요합니다');
        return [];
    }

    try {
        const snapshot = await getDoc(getUserBudgetRef(userId));
        if (snapshot.exists()) {
            const data = snapshot.data();
            return data.fixedExpenseTemplates || [];
        }
        return [];
    } catch (error) {
        console.error('고정비 템플릿 로드 실패:', error);
        throw error;
    }
};
