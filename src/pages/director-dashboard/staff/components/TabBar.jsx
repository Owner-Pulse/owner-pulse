import React from "react";
import { UserCheck, Users } from "lucide-react";

const TABS = [
  { id: "pto", label: "PTO Management", icon: UserCheck },
  { id: "substitute", label: "Substitutes", icon: Users },
];

const TabBar = ({ activeTab, onTabChange }) => (
  <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 w-fit">
    {TABS.map((tab) => {
      const Icon = tab.icon;
      return (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === tab.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Icon size={16} /> {tab.label}
        </button>
      );
    })}
  </div>
);

export default TabBar;
