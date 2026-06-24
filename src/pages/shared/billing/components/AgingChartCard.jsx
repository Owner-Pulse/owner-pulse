import React from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();

const AGING_BUCKETS = [
  { key: "1-7", label: "1–7 days", min: 1, max: 7 },
  { key: "8-14", label: "8–14 days", min: 8, max: 14 },
  { key: "15-30", label: "15–30 days", min: 15, max: 30 },
  { key: "31-60", label: "31–60 days", min: 31, max: 60 },
  { key: "60+", label: "60+ days", min: 61, max: Infinity },
];

const BUCKET_COLORS = {
  "1-7": "#16A34A",
  "8-14": "#D97706",
  "15-30": "#F97316",
  "31-60": "#DC2626",
  "60+": "#7F1D1D",
};

const AgingChartCard = ({ agingData }) => (
  <Card className="bg-white border-none shadow-sm h-full">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <BarChart3 size={16} className="text-blue-500" />
        Aging Buckets
      </CardTitle>
      <CardDescription className="text-[10px]">
        Past due amounts by aging bucket. Items past Thursday grace only.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={agingData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} dy={5} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "none", fontSize: "11px" }}
              formatter={(value) => [fmtMoney(value), "Amount"]}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={36} name="amount">
              {agingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={BUCKET_COLORS[AGING_BUCKETS[index]?.key] || "#D1D5DB"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-gray-100">
        {AGING_BUCKETS.map((bucket) => (
          <div key={bucket.key} className="flex items-center gap-1.5 text-[10px]">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BUCKET_COLORS[bucket.key] }} />
            <span className="text-gray-500">{bucket.label}</span>
            <span className="font-semibold text-gray-700">
              {agingData.find((a) => a.name === bucket.label)?.count || 0}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default AgingChartCard;
