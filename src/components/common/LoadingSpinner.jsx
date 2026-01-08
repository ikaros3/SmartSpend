import React from 'react';

/**
 * 로딩 스피너 컴포넌트
 * @param {Object} props
 * @param {string} props.message - 표시할 메시지 (옵션)
 */
export const LoadingSpinner = ({ message = '로딩 중...' }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            {/* 스피너 */}
            <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500" />
            </div>

            {/* 메시지 */}
            {message && (
                <p className="mt-4 text-gray-500 text-sm">{message}</p>
            )}
        </div>
    );
};

export default LoadingSpinner;
