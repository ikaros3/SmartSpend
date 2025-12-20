import React, { useEffect } from "react";
import { useBudgetContext } from "../../context/BudgetContext";

const Toast = () => {
    const { toast } = useBudgetContext();

    if (!toast.show) return null;

    const bgColors = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
        warning: "bg-yellow-500",
    };

    return (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 duration-300">
            <div
                className={`${bgColors[toast.type]} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[250px] max-w-md`}
            >
                <span className="text-sm font-medium">{toast.message}</span>
            </div>
        </div>
    );
};

export default Toast;
