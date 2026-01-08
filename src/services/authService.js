// Firebase Authentication 서비스
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

/**
 * Google 계정으로 로그인
 * @returns {Promise<UserCredential>}
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error('Google 로그인 실패:', error);
        throw error;
    }
};

/**
 * 로그아웃
 * @returns {Promise<void>}
 */
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('로그아웃 실패:', error);
        throw error;
    }
};

/**
 * 인증 상태 변경 구독
 * @param {Function} callback - 인증 상태 변경 시 호출될 콜백
 * @returns {Function} 구독 해제 함수
 */
export const subscribeToAuth = (callback) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * 현재 로그인된 사용자 반환
 * @returns {User|null}
 */
export const getCurrentUser = () => {
    return auth.currentUser;
};
