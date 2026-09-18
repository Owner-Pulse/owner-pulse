import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { itemVariants } from "./variants";

const DirectorWorkflowBanner = ({ expiredDirectorItems, expiringDirectorItems, stats }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm overflow-hidden border-l-4 border-l-[#1E3A5F]">
      <CardHeader className="pb-3 bg-[#1E3A5F]/[0.03]">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <span className="flex items-center gap-2 text-[#1E3A5F]">
            <RefreshCw size={16} /> Daily Compliance Monitoring Workflow
          </span>
          <span className="text-xs text-gray-500 font-normal">Step-by-Step Action Guide</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Box 1: Expired Items Alert */}
          <div
            className={`p-3 rounded-xl border flex flex-col justify-between ${
              expiredDirectorItems.length > 0
                ? "bg-[#AE4A3E]/[0.08] border-[#AE4A3E]/30 text-[#8A362C]"
                : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1">
                  🔴 1. Expired Items ({expiredDirectorItems.length})
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#AE4A3E]/10">URGENT</span>
              </div>
              <p className="text-xs mt-1">
                {expiredDirectorItems.length > 0
                  ? `Immediate renewal required: ${expiredDirectorItems.map((i) => i.item).join(", ")}`
                  : "No expired items pending."}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[11px] font-semibold">
              <span>Action: Call owner &amp; start renewal</span>
              <ArrowRight size={12} />
            </div>
          </div>

          {/* Box 2: Expiring <60 Days Alert */}
          <div
            className={`p-3 rounded-xl border flex flex-col justify-between ${
              expiringDirectorItems.length > 0
                ? "bg-[#B78A2F]/[0.10] border-[#B78A2F]/30 text-[#8F6A1F]"
                : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1">
                  ⏱️ 2. Expiring &lt;60 Days ({expiringDirectorItems.length})
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#B78A2F]/10">PREPARE</span>
              </div>
              <p className="text-xs mt-1">
                {expiringDirectorItems.length > 0
                  ? `Upcoming deadlines: ${expiringDirectorItems.map((i) => i.item).slice(0, 2).join(", ")}`
                  : "No items expiring within 60 days."}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[11px] font-semibold">
              <span>Action: Contact vendor &amp; schedule</span>
              <ArrowRight size={12} />
            </div>
          </div>

          {/* Box 3: All Compliant */}
          <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1">
                  ✅ 3. All Current Items ({stats.compliant})
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  COMPLIANT
                </span>
              </div>
              <p className="text-xs mt-1">
                All other regulatory &amp; operational requirements monitored with green status.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200 flex items-center justify-between text-[11px] font-semibold">
              <span>Action: Routine monthly check</span>
              <CheckCircle2 size={14} className="text-emerald-600" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default DirectorWorkflowBanner;
