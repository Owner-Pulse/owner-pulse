import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();

const ProfitChart = ({ data = [] }) => (
  <motion.div variants={itemVariants} className="lg:col-span-2">
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader className="pb-2">
        <div>
          <CardTitle className="text-base">Monthly Profit by Classroom</CardTitle>
          <CardDescription>Sorted by profitability</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-40 md:h-50 flex flex-col items-center justify-center text-gray-300 gap-2">
            <BarChart3 size={32} />
            <p className="text-xs text-gray-400">Chart data coming soon</p>
          </div>
        ) : (
          <div className="h-40 md:h-50 w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} dy={4} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontSize: 12 }}
                  formatter={(value) => [fmtMoney(value), ""]}
                />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]} barSize={22} name="Monthly Profit">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? "#3E7A54" : "#AE4A3E"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default ProfitChart;

