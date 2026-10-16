import React from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS, statusFromPct } from "@/lib/theme-tokens";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const EnrollmentCard = ({ data, onNavigate }) => {
  const preschool = data?.preschool || { enrolled: 0, capacity: 0, fill_rate: 0, rooms_count: 0 };
  const k8 = data?.k8 || { enrolled: 0, capacity: 0, fill_rate: 0, rooms_count: 0 };
  const summary = data?.summary || (data ? {
    total_enrolled: preschool.enrolled + k8.enrolled,
    total_capacity: preschool.capacity + k8.capacity,
    fill_rate: null,
  } : null);
  const noData = !data?.preschool && !data?.k8 && !data?.summary;
  const preschoolPct = preschool.capacity > 0 ? (preschool.fill_rate ?? (preschool.enrolled / preschool.capacity) * 100) : null;
  const k8Pct = k8.capacity > 0 ? (k8.fill_rate ?? (k8.enrolled / k8.capacity) * 100) : null;
  const preschoolStatus = statusFromPct(preschoolPct, { good: 85, watch: 70 });
  const k8Status = statusFromPct(k8Pct, { good: 85, watch: 70 });

  return (
    <motion.div variants={itemVariants}>
      <Card className="relative bg-white border-none shadow-sm h-full">
        <CardAccent group={noData ? "none" : "students"} />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users size={16} className={noData ? STATUS.none.text : ACCENTS.students.text} />
              Enrollment Breakdown
            </CardTitle>
            <span className={`text-xs cursor-pointer hover:underline font-semibold ${ACCENTS.students.text}`} onClick={() => onNavigate("/director/students")}>View details</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border ${noData ? STATUS.none.badge : `${ACCENTS.students.soft} ${ACCENTS.students.border}`}`}>
              <p className={`text-[10px] font-semibold uppercase ${noData ? STATUS.none.text : ACCENTS.students.text}`}>Preschool</p>
              <p className={`text-2xl font-extrabold ${noData ? STATUS.none.text : ACCENTS.students.text}`}>{noData ? "—" : preschool.enrolled}</p>
              <p className={`text-[10px] ${noData ? STATUS.none.text : "text-gray-600"}`}>
                {noData ? "No data" : preschool.capacity > 0 ? `enrolled · cap: ${preschool.capacity}` : "Enrollment capacity unavailable"}
              </p>
              <div className={`mt-1 h-1.5 rounded-full ${noData || preschoolStatus === "none" ? STATUS.none.soft : ACCENTS.students.soft}`}>
                <div className={`h-full rounded-full ${noData || preschoolStatus === "none" ? STATUS.none.dot : STATUS[preschoolStatus].dot}`} style={{ width: `${Math.min(100, preschoolPct || 0)}%` }} />
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${noData ? STATUS.none.badge : `${ACCENTS.students.soft} ${ACCENTS.students.border}`}`}>
              <p className={`text-[10px] font-semibold uppercase ${noData ? STATUS.none.text : ACCENTS.students.text}`}>K–8</p>
              <p className={`text-2xl font-extrabold ${noData ? STATUS.none.text : ACCENTS.students.text}`}>{noData ? "—" : k8.enrolled}</p>
              <p className={`text-[10px] ${noData ? STATUS.none.text : "text-gray-600"}`}>
                {noData ? "No data" : k8.capacity > 0 ? `enrolled · cap: ${k8.capacity}` : "Enrollment capacity unavailable"}
              </p>
              <div className={`mt-1 h-1.5 rounded-full ${noData || k8Status === "none" ? STATUS.none.soft : ACCENTS.students.soft}`}>
                <div className={`h-full rounded-full ${noData || k8Status === "none" ? STATUS.none.dot : STATUS[k8Status].dot}`} style={{ width: `${Math.min(100, k8Pct || 0)}%` }} />
              </div>
            </div>
          </div>
          <div className={`mt-2 p-2 rounded-lg text-center ${noData ? STATUS.none.soft : ACCENTS.students.soft}`}>
            <p className={`text-xs font-semibold ${noData ? STATUS.none.text : ACCENTS.students.text}`}>
              {noData
                ? "No enrollment data"
                : summary.total_capacity > 0
                ? `${summary.total_enrolled}/${summary.total_capacity} enrolled (${summary.fill_rate ?? Math.round((summary.total_enrolled / summary.total_capacity) * 100)}% capacity)`
                : `${summary.total_enrolled} Total Enrolled Students`}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnrollmentCard;
