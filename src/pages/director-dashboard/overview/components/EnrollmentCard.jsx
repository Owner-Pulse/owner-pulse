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
            <Users size={16} className="text-blue-500" />
            Enrollment
          </CardTitle>
          <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => onNavigate("/director/enrollment")}>View details</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-[10px] font-semibold text-blue-600 uppercase">Preschool</p>
            <p className="text-2xl font-extrabold text-blue-700">59</p>
            <p className="text-[10px] text-blue-500">enrolled · cap: 66</p>
            <div className="mt-1 h-1.5 bg-blue-200 rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "89%" }} />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
            <p className="text-[10px] font-semibold text-purple-600 uppercase">K–8</p>
            <p className="text-2xl font-extrabold text-purple-700">163</p>
            <p className="text-[10px] text-purple-500">enrolled · cap: 226</p>
            <div className="mt-1 h-1.5 bg-purple-200 rounded-full">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: "72%" }} />
            </div>
          </div>
        </div>
        <div className="mt-2 p-2 rounded-lg bg-emerald-50 text-center">
          <p className="text-xs font-semibold text-emerald-700">222/292 enrolled · 70 open spots</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default EnrollmentCard;
