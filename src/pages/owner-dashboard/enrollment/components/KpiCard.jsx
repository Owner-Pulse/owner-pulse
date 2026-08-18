import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

const KpiCard = ({ icon: Icon, label, value, sub, accent, trend }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${accent}`}>
          <Icon size={18} />
        </div>
      </div>
      {sub && (
        <div className="mt-2 flex items-center text-xs">
          <span className="text-gray-500">{sub}</span>
        </div>
      )}
      {trend && (
        <div className="mt-2 flex items-center text-xs">
          <span className="flex items-center text-[#2F6042] font-medium">
            <ArrowUpRight size={12} className="mr-1" />
            {trend}
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

export default KpiCard;
