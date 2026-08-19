import React from "react";
import { UserCheck, Users, Calendar } from "lucide-react";

const TABS = [
  { id: "roster", label: "Staff Roster", icon: Users },
  { id: "pto", label: "PTO Management", icon: UserCheck },
  { id: "substitute", label: "Substitutes", icon: Calendar },
];

const TabBar = ({ activeTab, onTabChange }) => (
  <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 overflow-x-auto scrollbar-none max-w-full w-full md:w-fit whitespace-nowrap snap-x">
    {TABS.map((tab) => {
      const Icon = tab.icon;
      return (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all shrink-0 snap-align-start ${
            activeTab === tab.id ? "bg-[#1E3A5F] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Icon size={14} className="md:w-4 md:h-4" /> {tab.label}
        </button>
      );
    })}
  </div>
);

export default TabBar;
