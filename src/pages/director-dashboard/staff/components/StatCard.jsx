import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const StatCard = ({ icon: Icon, label, value, sub, iconBg = "bg-[#1E3A5F]/10 text-[#1E3A5F]", valueColor = "text-gray-900", isLoading = false }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4 flex items-center justify-between">
      {isLoading ? (
        <div className="space-y-2 w-full animate-pulse">
          <div className="w-16 h-3 bg-gray-200 rounded" />
          <div className="w-10 h-6 bg-gray-200 rounded" />
          <div className="w-20 h-2.5 bg-gray-100 rounded" />
        </div>
      ) : (
        <>
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
        </>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
