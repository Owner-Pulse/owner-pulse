import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2.5 rounded-xl shadow-md border border-gray-100 text-xs space-y-1">
        <p className="font-bold text-gray-900">{label}</p>
        <p className={`${ACCENTS.students.text} font-semibold`}>
          Enrolled: {data.students} / {data.capacity} ({data.fill_rate}% fill rate)
        </p>
        <p className={`${STATUS.good.text}`}>Available: {data.available} spots</p>
        <p className={`${STATUS.watch.text}`}>Waitlist: {data.waitlist} leads</p>
      </div>
    );
  }
  return null;
};

const EnrollmentChart = ({ data, totalEnrolled, totalWaitlist, openSeats, noData = false }) => (
  <motion.div variants={itemVariants}>
    <Card className="relative bg-white border-none shadow-sm h-full">
      <CardAccent group={noData ? "none" : "students"} />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users size={15} className={noData ? STATUS.none.text : ACCENTS.students.text} />
          Enrollment by Program
        </CardTitle>
        <CardDescription className="text-[10px]">Source: Procare Classrooms & Roster · Students vs Capacity with Waitlist demand</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[160px] w-full">
          {noData ? (
            <div className={`h-full flex items-center justify-center text-xs italic ${STATUS.none.text}`}>No enrollment data</div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} dy={5} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="capacity" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={16} name="Capacity" />
              <Bar dataKey="students" radius={[4, 4, 0, 0]} barSize={16} name="Enrolled">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.capacity > 0 && entry.students >= entry.capacity ? STATUS.watch.hex : entry.capacity > 0 ? ACCENTS.students.hex : STATUS.none.hex} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3 pt-2 border-t border-gray-100">
          <div className={`text-center p-2 rounded-lg ${noData ? STATUS.none.soft : ACCENTS.students.soft}`}>
            <p className={`text-lg font-bold ${noData ? STATUS.none.text : ACCENTS.students.text}`}>{noData ? "—" : totalEnrolled}</p>
            <p className="text-[10px] text-gray-600">{noData ? "No data" : "Total"}</p>
          </div>
          <div className={`text-center p-2 rounded-lg ${noData ? STATUS.none.soft : STATUS.watch.soft}`}>
            <p className={`text-lg font-bold ${noData ? STATUS.none.text : STATUS.watch.text}`}>{noData ? "—" : totalWaitlist}</p>
            <p className="text-[10px] text-gray-600">{noData ? "No data" : "Waitlist"}</p>
          </div>
          <div className={`text-center p-2 rounded-lg ${noData ? STATUS.none.soft : STATUS.good.soft}`}>
            <p className={`text-lg font-bold ${noData ? STATUS.none.text : STATUS.good.text}`}>{noData ? "—" : openSeats}</p>
            <p className="text-[10px] text-gray-600">{noData ? "No data" : "Open"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default EnrollmentChart;
