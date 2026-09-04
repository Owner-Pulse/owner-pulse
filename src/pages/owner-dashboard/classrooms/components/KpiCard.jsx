import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const KpiCard = ({ icon: Icon, label, value, sub, iconBg }) => (
  <Card className="bg-white border-none shadow-xs hover:shadow-sm transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start gap-1">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-500 truncate">{label}</p>
          <p className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight truncate">{value}</p>
        </div>
        <div className={`p-2 rounded-xl shrink-0 ${iconBg || "bg-[#1E3A5F]/10 text-[#1E3A5F]"}`}>
          <Icon size={18} />
        </div>
      </div>
      {sub && (
        <div className="mt-2 flex items-center text-[11px] font-medium text-gray-500 truncate">
          {sub}
        </div>
      )}
    </CardContent>
  </Card>
);

export default KpiCard;
