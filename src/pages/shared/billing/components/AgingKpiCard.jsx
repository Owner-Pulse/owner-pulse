import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const AgingKpiCard = ({ icon: Icon, label, value, sub, iconBg, valueColor }) => (
  <Card className="bg-white border-none shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase">{label}</p>
          <p className={`text-2xl font-bold ${valueColor || "text-gray-900"}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${iconBg}`}><Icon size={18} /></div>
      </div>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </CardContent>
  </Card>
);

export default AgingKpiCard;
