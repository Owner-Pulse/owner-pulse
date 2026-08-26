import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "./SectionHeader";
import EmptyRow from "./EmptyRow";
import StaffSelect from "./StaffSelect";

const daysBetween = (start, end) => {
  if (!start) return 0;
  if (!end || end === start) return 1;
  return Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const PTOSection = ({ rows, onAdd, onUpdate, onRemove }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm overflow-visible">
        <CardContent className="p-5 overflow-visible">
          <SectionHeader
            number={3}
            title="PTO This Period"
            description="Single day or date range — system auto-counts and deducts PTO days."
            onAdd={onAdd}
            addLabel="Add PTO"
          />
          <div className="space-y-2 overflow-visible">
            {rows.length === 0 && <EmptyRow />}
            {rows.map((row, i) => {
              const days = daysBetween(row.startDate, row.endDate);
              return (
                <div
                  key={row.id}
                  className="grid gap-2 items-center relative z-20"
                  style={{ gridTemplateColumns: "1fr 1.2fr 90px 28px" }}
                >
                  <StaffSelect
                    value={row.staffId}
                    onChange={(v) => onUpdate(i, "staffId", v)}
                    placeholder="Select staff for PTO..."
                  />
                  <div className="flex gap-1 items-center">
                    <input
                      type="date"
                      value={row.startDate}
                      onChange={(e) => onUpdate(i, "startDate", e.target.value)}
                      className="flex-1 min-w-0 h-10 px-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                    />
                    <span className="text-xs text-gray-400">→</span>
                    <input
                      type="date"
                      value={row.endDate}
                      onChange={(e) => onUpdate(i, "endDate", e.target.value)}
                      className="flex-1 min-w-0 h-10 px-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                    />
                  </div>
                  <div className="px-2 h-10 flex items-center justify-center rounded-xl text-xs font-bold bg-[#B78A2F]/10 text-[#8F6A1F]">
                    {days > 0 ? `${days} Day${days > 1 ? "s" : ""}` : "0 Days"}
                  </div>
                  <button
                    onClick={() => onRemove(i)}
                    className="p-1.5 hover:bg-[#AE4A3E]/10 rounded-lg text-gray-400 hover:text-[#AE4A3E] transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PTOSection;
