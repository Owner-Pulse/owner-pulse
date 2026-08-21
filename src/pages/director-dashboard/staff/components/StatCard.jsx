import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const StatCard = ({ icon: Icon, label, value, sub, iconBg = "bg-[#1E3A5F]/10 text-[#1E3A5F]", valueColor = "text-gray-900" }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-black mt-1 ${valueColor}`}>{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
      </div>
      {Icon && (
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon size={18} />
        </div>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
