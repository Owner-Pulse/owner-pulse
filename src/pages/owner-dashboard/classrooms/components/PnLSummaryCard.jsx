import React from "react";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtMoney = (n) => "$" + Math.round(n ?? 0).toLocaleString();
const fmtMoneyShort = (n) => {
  const abs = Math.abs(n ?? 0);
  return abs >= 1000 ? "$" + (abs / 1000).toFixed(1) + "K" : "$" + abs;
};

const PnLSummaryCard = ({ 
  totalRevenue, 
  totalCost, 
  totalProfit, 
  overallMargin,
  formattedRevenue,
  formattedCost,
  formattedMargin,
  formattedProfit
}) => {
  const revDisplay = formattedRevenue || fmtMoney(totalRevenue ?? 0);
  const costDisplay = formattedCost || fmtMoney(totalCost ?? 0);
  const marginDisplay = formattedMargin || `${overallMargin ?? 0}%`;
  const profitDisplay = formattedProfit || (
    (totalProfit ?? 0) >= 0 
      ? fmtMoneyShort(totalProfit ?? 0) 
      : `-${fmtMoneyShort(Math.abs(totalProfit ?? 0))}`
  );

  const marginPct = Number(overallMargin) || 0;
  const barWidth = Math.min(Math.max(marginPct, 0), 100);

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-[#FFFFFF] border-none shadow-sm h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <DollarSign size={16} className="text-[#1E3A5F]" />
            P&amp;L Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Monthly Tuition Revenue</span>
            <span className="text-sm font-bold text-gray-900">{revDisplay}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Monthly Operating Costs</span>
            <span className="text-sm font-bold text-[#1E3A5F]">{costDisplay}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Gross Margin</span>
            <span className={`text-sm font-bold ${(totalProfit ?? 0) >= 0 ? "text-[#2F6042]" : "text-[#8A362C]"}`}>{marginDisplay}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm font-semibold text-gray-700">Net Monthly Profit</span>
            <span className={`text-lg font-extrabold ${(totalProfit ?? 0) >= 0 ? "text-[#2F6042]" : "text-[#8A362C]"}`}>
              {profitDisplay}
            </span>
          </div>
          <div className="mt-3 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${marginPct >= 30 ? "bg-[#3E7A54]" : marginPct >= 15 ? "bg-[#B78A2F]" : "bg-[#AE4A3E]"}`} 
              style={{ width: `${barWidth}%` }} 
            />
          </div>
          <p className="text-[10px] text-gray-400 text-center">
            Margin benchmark: healthy &gt; 30% · monitoring &gt; 15% · critical &lt; 15%
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PnLSummaryCard;
