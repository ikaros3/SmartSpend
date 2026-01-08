import React from "react";
import { useAuth } from "./hooks/useAuth";
import { BudgetProvider } from "./context/BudgetContext";
import App from "./App";
import LoginScreen from "./components/common/LoginScreen";
import LoadingSpinner from "./components/common/LoadingSpinner";

/**
 * AppWrapper - 인증 상태에 따라 화면을 분기
 * - 로딩 중: LoadingSpinner 표시
 * - 미인증: LoginScreen 표시
 * - 인증됨: BudgetProvider + App 표시
 */
export default function AppWrapper() {
    const { user, loading, error, signIn } = useAuth();

    // 인증 상태 로딩 중
    if (loading) {
        return <LoadingSpinner message="인증 확인 중..." />;
    }

    // 미인증 상태 → 로그인 화면
    if (!user) {
        return <LoginScreen onSignIn={signIn} error={error} />;
    }

    // 인증됨 → 메인 앱
    return (
        <BudgetProvider userId={user.uid}>
            <App />
        </BudgetProvider>
    );
}
