import React from "react";

const TabButton = ({ isActive, icon: Icon, label, onClick }) => (
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

export default TabButton;
