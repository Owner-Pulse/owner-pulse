import React from "react";
import { motion } from "framer-motion";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const EnrollmentByProgram = ({ programs, itemVariants }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle>Enrollment by Program</CardTitle>
          <CardDescription>
            Current enrollment vs capacity across all programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] md:h-[280px] w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={programs}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 10 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="capacity"
                  fill="#E5E8F0"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                  name="Capacity"
                />
                <Bar
                  dataKey="enrolled"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                  name="Enrolled"
                >
                  {programs.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.enrolled >= entry.capacity
                          ? "#F59E0B"
                          : "#2563EB"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnrollmentByProgram;
