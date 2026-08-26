import React from "react";
import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const CoverageCard = ({ coverage }) => {
  const counts = coverage?.counts || { staff_out: 1, subs_in: 0, uncovered: 1 };
  const staffList = coverage?.staff_list || [];

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserCheck size={16} className="text-[#1E3A5F]" />
            Today's Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-[#B78A2F]/10 border border-[#B78A2F]/20 text-center">
              <p className="text-lg font-extrabold text-[#8F6A1F]">{counts.staff_out}</p>
              <p className="text-[9px] text-[#8F6A1F] font-medium">Staff Out</p>
            </div>
            <div className="p-3 rounded-xl bg-[#3E7A54]/10 border border-[#3E7A54]/20 text-center">
              <p className="text-lg font-extrabold text-[#2F6042]">{counts.subs_in}</p>
              <p className="text-[9px] text-[#2F6042] font-medium">Subs In</p>
            </div>
            <div className="p-3 rounded-xl bg-[#AE4A3E]/10 border border-[#AE4A3E]/20 text-center">
              <p className="text-lg font-extrabold text-[#8A362C]">{counts.uncovered}</p>
              <p className="text-[9px] text-[#8A362C] font-medium">Uncovered</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {staffList.length > 0 ? (
              staffList.map((stf, idx) => (
                <div key={stf.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center text-[9px] font-bold text-[#1E3A5F]">
                      {stf.initials || stf.name?.slice(0, 2).toUpperCase() || "ST"}
                    </div>
                    <span className="text-xs text-gray-700 font-medium capitalize">{stf.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 capitalize">{stf.reason}</span>
                  <span className={`text-[10px] font-medium ${stf.status === "uncovered" ? "text-[#8A362C]" : "text-[#2F6042]"}`}>
                    → {stf.assigned_sub}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-2">All staff present today.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CoverageCard;
