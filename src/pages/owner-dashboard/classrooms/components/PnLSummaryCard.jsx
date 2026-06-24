import React from "react";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
const fmtMoneyShort = (n) => (n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + n);

const PnLSummaryCard = ({ totalRevenue, totalCost, totalProfit, overallMargin }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign size={16} className="text-emerald-500" />
          P&amp;L Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">Monthly Tuition Revenue</span>
          <span className="text-sm font-bold text-gray-900">{fmtMoney(totalRevenue)}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">Monthly Operating Costs</span>
          <span className="text-sm font-bold text-red-500">{fmtMoney(totalCost)}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">Gross Margin</span>
          <span className={`text-sm font-bold ${totalProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>{overallMargin}%</span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-sm font-semibold text-gray-700">Net Monthly Profit</span>
          <span className={`text-lg font-extrabold ${totalProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {totalProfit >= 0 ? "" : "-"}{fmtMoneyShort(Math.abs(totalProfit))}
          </span>
        </div>
        <div className="mt-3 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(Math.max(overallMargin + 50, 5), 100)}%` }} />
        </div>
        <p className="text-[10px] text-gray-400 text-center">
          Margin benchmark: healthy &gt; 30% · monitoring &gt; 15% · critical &lt; 15%
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

export default PnLSummaryCard;
