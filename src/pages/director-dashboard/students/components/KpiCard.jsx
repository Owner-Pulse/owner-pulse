import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const ACCENT_COLORS = {
  "bg-[#1E3A5F]/10 text-[#1E3A5F]": "border-t-[#1E3A5F]",
  "bg-[#3E7A54]/10 text-[#2F6042]": "border-t-[#3E7A54]",
  "bg-[#B78A2F]/10 text-[#8F6A1F]": "border-t-[#B78A2F]",
  "bg-[#AE4A3E]/10 text-[#8A362C]": "border-t-[#AE4A3E]",
  "bg-gray-50 text-gray-600": "border-t-gray-400",
};

const KpiCard = ({ icon: Icon, label, value, sub, valueColor, iconBg }) => {
  const accentClass = ACCENT_COLORS[iconBg] || "border-t-[#1E3A5F]";
  return (
    <Card className={`bg-white border-none shadow-sm hover:shadow-md transition-shadow border-t-2 ${accentClass}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-black ${valueColor || "text-gray-900"}`}>{value}</p>
          </div>
          <div className={`p-2.5 rounded-xl ${iconBg || "bg-[#1E3A5F]/10 text-[#1E3A5F]"}`}>
            <Icon size={18} />
          </div>
        </div>
        {sub && <p className="mt-2 text-[11px] text-gray-400 font-medium">{sub}</p>}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
