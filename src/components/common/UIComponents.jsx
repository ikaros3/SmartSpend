import React from "react";

export const TabButton = ({ isActive, icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full py-2 transition-all active:scale-95 ${isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
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

export const Chip = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${active
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
    >
        {label}
    </button>
);
