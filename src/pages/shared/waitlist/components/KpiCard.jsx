import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const KpiCard = ({ icon: Icon, label, value, sub, iconBg, valueColor }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className={`text-2xl font-bold ${valueColor || "text-gray-900"}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${iconBg || "bg-[#1E3A5F]/10 text-[#1E3A5F]"}`}>
          <Icon size={18} />
        </div>
      </div>
      {sub && <div className="mt-2 text-xs text-gray-500">{sub}</div>}
    </CardContent>
  </Card>
);

export default KpiCard;
