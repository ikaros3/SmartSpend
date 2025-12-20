import React from "react";

const Chip = ({ label, active, onClick }) => (
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

export default Chip;
