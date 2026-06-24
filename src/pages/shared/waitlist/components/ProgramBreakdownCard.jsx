import React from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ProgramBadge from "./ProgramBadge";
import SourceTag from "./SourceTag";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ProgramBreakdownCard = ({ byProgram, bySource }) => {
  const maxCount = byProgram.length ? Math.max(...byProgram.map((x) => x.count)) : 0;

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Building2 size={16} /> Waitlist by Program
          </CardTitle>
          <CardDescription>Average wait time and demand per program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {byProgram.map((p) => (
              <div key={p.program} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <ProgramBadge program={p.program} />
                  <span className="text-xs text-gray-400">{p.count} {p.count === 1 ? "family" : "families"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Avg {p.avgWait}d waiting</span>
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${maxCount ? Math.min(100, (p.count / maxCount) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {byProgram.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No families on the waitlist yet.</p>
            )}
          </div>

          {/* Source breakdown */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">By Source</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(bySource).map(([source, count]) => (
                <span key={source} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-full text-xs font-medium text-gray-700">
                  <SourceTag source={source} /> {count}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProgramBreakdownCard;
