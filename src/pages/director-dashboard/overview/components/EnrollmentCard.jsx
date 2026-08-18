import React from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const EnrollmentCard = ({ onNavigate }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users size={16} className="text-[#1E3A5F]" />
            Enrollment
          </CardTitle>
          <span className="text-xs text-[#1E3A5F] cursor-pointer hover:underline" onClick={() => onNavigate("/director/enrollment")}>View details</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#1E3A5F]/[0.05] border border-[#1E3A5F]/15">
            <p className="text-[10px] font-semibold text-[#1E3A5F] uppercase">Preschool</p>
            <p className="text-2xl font-extrabold text-[#1E3A5F]">59</p>
            <p className="text-[10px] text-[#1E3A5F]/60">enrolled · cap: 66</p>
            <div className="mt-1 h-1.5 bg-[#1E3A5F]/10 rounded-full">
              <div className="h-full bg-[#1E3A5F] rounded-full" style={{ width: "89%" }} />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#2A4C7E]/[0.07] border border-[#2A4C7E]/20">
            <p className="text-[10px] font-semibold text-[#2A4C7E] uppercase">K–8</p>
            <p className="text-2xl font-extrabold text-[#2A4C7E]">163</p>
            <p className="text-[10px] text-[#2A4C7E]/60">enrolled · cap: 226</p>
            <div className="mt-1 h-1.5 bg-[#2A4C7E]/10 rounded-full">
              <div className="h-full bg-[#2A4C7E] rounded-full" style={{ width: "72%" }} />
            </div>
          </div>
        </div>
        <div className="mt-2 p-2 rounded-lg bg-[#3E7A54]/10 text-center">
          <p className="text-xs font-semibold text-[#2F6042]">222/292 enrolled · 70 open spots</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default EnrollmentCard;
