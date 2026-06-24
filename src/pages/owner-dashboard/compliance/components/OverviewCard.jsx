import React from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const OverviewCard = ({ complianceScore, totalItems, ownerCount, directorCount }) => {
  const categories = [
    { label: "All Items", count: totalItems, color: "bg-blue-500" },
    { label: "Owner-owned", count: ownerCount, color: "bg-amber-500" },
    { label: "Director-owned", count: directorCount, color: "bg-cyan-500" },
  ];

  return (
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-500" />
          Overview
        </CardTitle>
        <CardDescription>Status breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Visual progress ring */}
        <div className="flex justify-center mb-4">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={complianceScore >= 80 ? "#16A34A" : complianceScore >= 50 ? "#D97706" : "#DC2626"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(complianceScore / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-extrabold ${
                complianceScore >= 80 ? "text-emerald-600" : complianceScore >= 50 ? "text-amber-600" : "text-red-500"
              }`}>
                {complianceScore}%
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                <span className="text-sm text-gray-600">{cat.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{cat.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewCard;
