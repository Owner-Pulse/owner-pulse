import React from "react";
import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const CoverageCard = () => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <UserCheck size={16} className="text-amber-500" />
          Today's Coverage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
            <p className="text-lg font-extrabold text-amber-700">2</p>
            <p className="text-[9px] text-amber-600 font-medium">Staff Out</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <p className="text-lg font-extrabold text-emerald-700">2</p>
            <p className="text-[9px] text-emerald-600 font-medium">Subs In</p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-center">
            <p className="text-lg font-extrabold text-red-700">0</p>
            <p className="text-[9px] text-red-600 font-medium">Uncovered</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-[9px] font-bold text-amber-700">MC</div>
              <span className="text-xs text-gray-700">Ms. Cohen</span>
            </div>
            <span className="text-[10px] text-gray-400">Personal day</span>
            <span className="text-[10px] font-medium text-emerald-600">→ Ms. Hart</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-[9px] font-bold text-amber-700">MP</div>
              <span className="text-xs text-gray-700">Ms. Patel</span>
            </div>
            <span className="text-[10px] text-gray-400">Sick day</span>
            <span className="text-[10px] font-medium text-emerald-600">→ Ms. Hart</span>
          </div>
        </div>
        <p className="text-[9px] text-gray-400 italic">From ProCare when integrated · manual fallback for now</p>
      </CardContent>
    </Card>
  </motion.div>
);

export default CoverageCard;
