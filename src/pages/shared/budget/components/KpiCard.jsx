import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const KpiCard = ({ icon: Icon, label, value, sub, pct = 75, iconBg, color = "#1E3A5F" }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              strokeWidth="3.5"
              strokeDasharray={`${Math.min(100, Math.max(0, pct))}, 100`}
              strokeLinecap="round"
              stroke={color}
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className={`absolute p-1 rounded-full ${iconBg || "text-[#1E3A5F]"}`}>
            <Icon size={14} />
          </div>
        </div>
      </div>
      {sub && <div className="mt-2 text-xs text-gray-500">{sub}</div>}
    </CardContent>
  </Card>
);

export default KpiCard;
