// Firebase 인증 상태 관리 훅
import { useState, useEffect, useCallback } from 'react';
import { subscribeToAuth, signInWithGoogle, signOut } from '../services/authService';

/**
 * Firebase 인증 상태를 관리하는 커스텀 훅
 * @returns {Object} { user, loading, error, signIn, signOut }
 */
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 인증 상태 구독
    useEffect(() => {
        const unsubscribe = subscribeToAuth((authUser) => {
            setUser(authUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Google 로그인
    const handleSignIn = useCallback(async () => {
        try {
            setError(null);
            await signInWithGoogle();
        } catch (err) {
            setError(err.message);
            console.error('로그인 오류:', err);
        }
    }, []);

    // 로그아웃
    const handleSignOut = useCallback(async () => {
        try {
            setError(null);
            await signOut();
        } catch (err) {
            setError(err.message);
            console.error('로그아웃 오류:', err);
        }
    }, []);

    return {
        user,
        loading,
        error,
        signIn: handleSignIn,
        signOut: handleSignOut,
        isAuthenticated: !!user
    };
};

export default useAuth;
