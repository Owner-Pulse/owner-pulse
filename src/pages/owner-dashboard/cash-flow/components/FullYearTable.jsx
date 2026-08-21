import React from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { itemVariants, fmtMoneyShort } from "../cashflow.utils";

const FullYearTable = ({ data, years, currentYear }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 size={16} className="text-[#1E3A5F]" />
          Full Year Comparison
        </CardTitle>
        <CardDescription>All expense categories · 5-year trend</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2.5 font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                {years.map((y) => (
                  <th key={y} className={`text-right pb-2.5 font-semibold uppercase tracking-wider ${y === currentYear ? "text-[#1E3A5F]" : "text-gray-400"}`}>
                    {y}{y === currentYear ? " · YTD" : ""}
                  </th>
                ))}
                <th className="text-right pb-2.5 font-semibold text-gray-400 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody>
              {data.map((cat) => {
                const values = years.map((y) => cat.values?.[y] || 0);
                // Use API-provided trend if available, otherwise compute
                const trendStr = cat.trend || (() => {
                  const first = values[0];
                  const last = values[values.length - 1];
                  const totalGrowth = first > 0 ? ((last - first) / first) * 100 : 0;
                  const isUp = totalGrowth > 2;
                  const isDown = totalGrowth < -2;
                  return `${isUp ? "↑" : isDown ? "↓" : "→"} ${Math.abs(totalGrowth).toFixed(0)}%`;
                })();
                const isUp = trendStr.startsWith("↑");
                const isDown = trendStr.startsWith("↓");
                return (
                  <tr key={cat.category} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 font-medium text-gray-700 max-w-45 truncate">{cat.category}</td>
                    {values.map((v, i) => (
                      <td key={i} className={`py-2.5 text-right font-medium ${years[i] === currentYear ? "text-gray-900" : "text-gray-500"}`}>
                        {fmtMoneyShort(v)}
                      </td>
                    ))}
                    <td className={`py-2.5 text-right font-semibold ${isUp ? "text-[#8A362C]" : isDown ? "text-[#2F6042]" : "text-gray-400"}`}>
                      {trendStr}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default FullYearTable;

