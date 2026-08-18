import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const EnrollmentChart = ({ data, totalEnrolled, totalWaitlist, openSeats }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users size={15} className="text-[#1E3A5F]" />
          Enrollment by Grade
        </CardTitle>
        <CardDescription className="text-[10px]">Students vs Capacity with Waitlist demand</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} dy={5} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: "11px" }} />
              <Bar dataKey="capacity" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={16} name="Capacity" />
              <Bar dataKey="students" radius={[4, 4, 0, 0]} barSize={16} name="Enrolled">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.students >= entry.capacity ? "#B78A2F" : "#1E3A5F"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3 pt-2 border-t border-gray-100">
          <div className="text-center p-2 bg-[#1E3A5F]/5 rounded-lg">
            <p className="text-lg font-bold text-[#1E3A5F]">{totalEnrolled}</p>
            <p className="text-[10px] text-gray-500">Total</p>
          </div>
          <div className="text-center p-2 bg-[#B78A2F]/10 rounded-lg">
            <p className="text-lg font-bold text-[#8F6A1F]">{totalWaitlist}</p>
            <p className="text-[10px] text-gray-500">Waitlist</p>
          </div>
          <div className="text-center p-2 bg-[#3E7A54]/10 rounded-lg">
            <p className="text-lg font-bold text-[#2F6042]">{openSeats}</p>
            <p className="text-[10px] text-gray-500">Open</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default EnrollmentChart;
