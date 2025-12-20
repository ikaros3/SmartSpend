import React from "react";
import { Home, List, PieChart, Settings } from "lucide-react";
import TabButton from "../common/TabButton";
import { useBudgetContext } from "../../context/BudgetContext";

const Navigation = () => {
    const { activeTab, setActiveTab } = useBudgetContext();

    return (
        <nav className="bg-white border-t border-gray-200 h-20 flex justify-around items-center px-2 pb-safe w-full z-30 rounded-t-2xl shadow-[0_-5px_10px_rgba(0,0,0,0.02)] shrink-0 relative">
            <TabButton
                isActive={activeTab === "home"}
                onClick={() => setActiveTab("home")}
                icon={Home}
                label="홈"
            />
            <TabButton
                isActive={activeTab === "ledger"}
                onClick={() => setActiveTab("ledger")}
                icon={List}
                label="내역"
            />
            <TabButton
                isActive={activeTab === "stats"}
                onClick={() => setActiveTab("stats")}
                icon={PieChart}
                label="통계"
            />
            <TabButton
                isActive={activeTab === "settings"}
                onClick={() => setActiveTab("settings")}
                icon={Settings}
                label="설정"
            />
        </nav>
    );
};

export default Navigation;
