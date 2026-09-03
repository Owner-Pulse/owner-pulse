import React from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const EnrollmentCard = ({ data, onNavigate }) => {
  const preschool = data?.preschool || { enrolled: 102, capacity: 0, fill_rate: 0, rooms_count: 2 };
  const k8 = data?.k8 || { enrolled: 515, capacity: 0, fill_rate: 0, rooms_count: 8 };
  const summary = data?.summary || { total_enrolled: 617, total_capacity: 0, fill_rate: 0 };

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users size={16} className="text-[#1E3A5F]" />
              Enrollment Breakdown
            </CardTitle>
            <span className="text-xs text-[#1E3A5F] cursor-pointer hover:underline font-semibold" onClick={() => onNavigate("/director/students")}>View details</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#1E3A5F]/[0.05] border border-[#1E3A5F]/15">
              <p className="text-[10px] font-semibold text-[#1E3A5F] uppercase">Preschool</p>
              <p className="text-2xl font-extrabold text-[#1E3A5F]">{preschool.enrolled}</p>
              <p className="text-[10px] text-[#1E3A5F]/60">
                {preschool.capacity > 0 ? `enrolled · cap: ${preschool.capacity}` : `enrolled across ${preschool.rooms_count || 2} rooms`}
              </p>
              <div className="mt-1 h-1.5 bg-[#1E3A5F]/10 rounded-full">
                <div className="h-full bg-[#1E3A5F] rounded-full" style={{ width: `${Math.min(100, preschool.fill_rate || 100)}%` }} />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#2A4C7E]/[0.07] border border-[#2A4C7E]/20">
              <p className="text-[10px] font-semibold text-[#2A4C7E] uppercase">K–8</p>
              <p className="text-2xl font-extrabold text-[#2A4C7E]">{k8.enrolled}</p>
              <p className="text-[10px] text-[#2A4C7E]/60">
                {k8.capacity > 0 ? `enrolled · cap: ${k8.capacity}` : `enrolled across ${k8.rooms_count || 8} rooms`}
              </p>
              <div className="mt-1 h-1.5 bg-[#2A4C7E]/10 rounded-full">
                <div className="h-full bg-[#2A4C7E] rounded-full" style={{ width: `${Math.min(100, k8.fill_rate || 100)}%` }} />
              </div>
            </div>
          </div>
          <div className="mt-2 p-2 rounded-lg bg-[#3E7A54]/10 text-center">
            <p className="text-xs font-semibold text-[#2F6042]">
              {summary.total_capacity > 0
                ? `${summary.total_enrolled}/${summary.total_capacity} enrolled (${summary.fill_rate}% capacity)`
                : `${summary.total_enrolled} Total Enrolled Students across ${ (preschool.rooms_count || 0) + (k8.rooms_count || 0) || 10 } classrooms`}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnrollmentCard;
