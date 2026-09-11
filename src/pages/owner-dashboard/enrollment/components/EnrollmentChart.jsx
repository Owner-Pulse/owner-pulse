import React from "react";
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

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const hasCapacity = (data.capacity ?? 0) > 0;
  return (
    <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-xs space-y-1">
      <p className="font-bold text-gray-900">{data.name}</p>
      <p className="text-[#1E3A5F] font-extrabold">Enrolled: {data.enrolled} students</p>
      {hasCapacity && <p className="text-gray-500">Capacity: {data.capacity} students</p>}
      {hasCapacity && (
        <p className="text-gray-500">Fill Rate: {Math.round((data.enrolled / data.capacity) * 100)}%</p>
      )}
    </div>
  );
};

const EnrollmentChart = ({ programs }) => {
  const hasAnyCapacity = programs.some((p) => (p.capacity ?? 0) > 0);

  return (
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle>Enrollment by Program</CardTitle>
        <CardDescription>
          Source: Procare Classrooms & Roster · {hasAnyCapacity ? "Current enrollment vs capacity across all programs" : "Current enrollment across all programs"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] md:h-[280px] w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={programs} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} dy={6} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              {hasAnyCapacity && (
                <Bar dataKey="capacity" fill="#E5E8F0" radius={[4, 4, 0, 0]} barSize={18} name="Capacity" />
              )}
              <Bar dataKey="enrolled" radius={[4, 4, 0, 0]} barSize={18} name="Enrolled">
                {programs.map((entry, index) => {
                  const hasCap = (entry.capacity ?? 0) > 0;
                  const isOver = hasCap && entry.enrolled >= entry.capacity;
                  return (
                    <Cell key={`cell-${index}`} fill={isOver ? "#B78A2F" : "#1E3A5F"} />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnrollmentChart;
