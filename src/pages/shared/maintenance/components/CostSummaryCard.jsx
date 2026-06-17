import React from "react";
import { DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();

const CostSummaryCard = ({ totalEstCost, openCount }) => (
  <Card className="bg-white border-none shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg"><DollarSign size={18} className="text-purple-600" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Estimated Cost for Open Items</p>
            <p className="text-lg font-bold text-gray-900">{fmtMoney(totalEstCost)}</p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {openCount} open {openCount === 1 ? "request" : "requests"}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default CostSummaryCard;
