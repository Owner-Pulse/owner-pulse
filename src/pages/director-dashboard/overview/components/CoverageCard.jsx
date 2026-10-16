import React from "react";
import { motion } from "framer-motion";
import { UserCheck, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const CoverageCard = ({ coverage }) => {
  const noData = !coverage || (!coverage.counts && !Array.isArray(coverage.staff_list));
  const counts = coverage?.counts || { staff_out: 0, subs_in: 0, uncovered: 0 };
  const staffList = coverage?.staff_list || [];

  return (
    <motion.div variants={itemVariants}>
      <Card className="relative bg-white border-none shadow-sm h-full flex flex-col justify-between">
        <CardAccent group={noData ? "none" : "staff"} />
        <div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <UserCheck size={16} className={noData ? STATUS.none.text : ACCENTS.staff.text} />
                Today's Staffing &amp; Coverage
              </CardTitle>
              <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Info size={11} className="text-[#1E3A5F]" />
                Source: Shift Log &amp; Staff Module
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-2.5 rounded-xl border text-center ${noData ? STATUS.none.badge : counts.staff_out > 0 ? STATUS.watch.badge : STATUS.good.badge}`}>
                <p className={`text-lg font-extrabold ${noData ? STATUS.none.text : counts.staff_out > 0 ? STATUS.watch.text : STATUS.good.text}`}>{noData ? "—" : counts.staff_out}</p>
                <p className={`text-[9px] font-semibold ${noData ? STATUS.none.text : counts.staff_out > 0 ? STATUS.watch.text : STATUS.good.text}`}>Staff Out</p>
              </div>
              <div className={`p-2.5 rounded-xl border text-center ${noData ? STATUS.none.badge : ACCENTS.staff.icon}`}>
                <p className={`text-lg font-extrabold ${noData ? STATUS.none.text : ACCENTS.staff.text}`}>{noData ? "—" : counts.subs_in}</p>
                <p className={`text-[9px] font-semibold ${noData ? STATUS.none.text : ACCENTS.staff.text}`}>Subs In</p>
              </div>
              <div className={`p-2.5 rounded-xl border text-center ${noData ? STATUS.none.badge : counts.uncovered > 0 ? STATUS.problem.badge : STATUS.good.badge}`}>
                <p className={`text-lg font-extrabold ${noData ? STATUS.none.text : counts.uncovered > 0 ? STATUS.problem.text : STATUS.good.text}`}>{noData ? "—" : counts.uncovered}</p>
                <p className={`text-[9px] font-semibold ${noData ? STATUS.none.text : counts.uncovered > 0 ? STATUS.problem.text : STATUS.good.text}`}>Uncovered</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {staffList.length > 0 ? (
                staffList.map((stf, idx) => {
                  const isCovered = stf.status === "covered" || !!stf.assigned_sub;
                  return (
                    <div key={stf.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${ACCENTS.staff.icon}`}>
                          {stf.initials || stf.name?.slice(0, 2).toUpperCase() || "ST"}
                        </div>
                        <span className="text-xs text-gray-700 font-medium capitalize">{stf.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 capitalize">{stf.reason}</span>
                      <span className={`text-[10px] font-bold ${!isCovered ? STATUS.problem.text : STATUS.good.text}`}>
                        {isCovered ? `Sub: ${stf.assigned_sub}` : "Uncovered"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className={`text-xs italic text-center py-2 ${noData ? STATUS.none.text : STATUS.good.text}`}>
                  {noData ? "No coverage data" : "All staff present today."}
                </p>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

export default CoverageCard;
