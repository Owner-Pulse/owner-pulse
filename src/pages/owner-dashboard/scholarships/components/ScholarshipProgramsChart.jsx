import React, { useMemo } from "react";
import { Award } from "lucide-react";
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

const fmtMoney = (v) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0 });

const COLORS = ["#1E3A5F", "#2A4C7E", "#4A6B96", "#5B7FA6", "#3E7A54", "#B78A2F"];

const ScholarshipProgramsChart = ({ programs = [] }) => {
  const normalizedPrograms = useMemo(() => {
    return (programs || []).map((p, idx) => ({
      id: p.id || p.program || p.name || idx,
      program: p.program || p.name || p.code || "Program",
      students: p.students_count ?? p.students ?? 0,
      awarded: p.awarded_amount ?? p.awarded ?? 0,
      formatted_amount: p.formatted_amount,
      color: p.color || COLORS[idx % COLORS.length],
    }));
  }, [programs]);

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Award size={16} className="text-[#1E3A5F]" /> Scholarship Programs
        </CardTitle>
        <CardDescription>Award amounts by program type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={normalizedPrograms} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="program" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} tickFormatter={(v) => "$" + (v >= 1000 ? (v / 1000).toFixed(0) + "K" : v)} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                formatter={(value) => [fmtMoney(value), "Awarded"]}
              />
              <Bar dataKey="awarded" radius={[6, 6, 0, 0]}>
                {normalizedPrograms.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Program breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {normalizedPrograms.map((p) => (
            <div key={p.id} className="p-3 bg-gray-50 rounded-xl text-center">
              <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: p.color }} />
              <p className="text-sm font-bold text-gray-900">{p.program}</p>
              <p className="text-xs text-gray-500">{p.students} students</p>
              <p className="text-xs font-semibold text-gray-700">{p.formatted_amount || fmtMoney(p.awarded)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScholarshipProgramsChart;
