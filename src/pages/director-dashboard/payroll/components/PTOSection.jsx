import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "./SectionHeader";
import EmptyRow from "./EmptyRow";
import StaffSelect from "./StaffSelect";
import MultiDatePicker from "@/components/ui/MultiDatePicker";

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
            description="Select multiple non-consecutive dates per staff member — system auto-counts PTO days."
            onAdd={onAdd}
            addLabel="Add PTO"
          />
          <div className="space-y-3 overflow-visible">
            {rows.length === 0 && <EmptyRow />}
            {rows.map((row, i) => {
              const datesList = row.dates || (row.startDate ? [row.startDate] : []);
              const daysCount = datesList.length;

              return (
                <div
                  key={row.id}
                  className="grid gap-3 items-start relative z-20 p-3 rounded-xl border border-gray-100 bg-gray-50/50"
                  style={{ gridTemplateColumns: "1fr 1.6fr 100px 28px" }}
                >
                  <StaffSelect
                    value={row.staffId}
                    onChange={(v) => onUpdate(i, "staffId", v)}
                    placeholder="Select staff for PTO..."
                  />

                  <MultiDatePicker
                    dates={datesList}
                    onChange={(newDates) => onUpdate(i, "dates", newDates)}
                    label=""
                    placeholder="Add PTO date..."
                    compact={true}
                  />

                  <div className="px-2 h-9 flex flex-col items-center justify-center rounded-xl text-xs font-bold bg-[#B78A2F]/10 text-[#8F6A1F]">
                    <span>{daysCount > 0 ? `${daysCount} Day${daysCount > 1 ? "s" : ""}` : "0 Days"}</span>
                    {daysCount > 0 && <span className="text-[10px] font-normal opacity-80">{daysCount * 8} hrs</span>}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(i)}
                    className="p-1.5 hover:bg-[#AE4A3E]/10 rounded-lg text-gray-400 hover:text-[#AE4A3E] transition-colors mt-0.5"
                    title="Remove PTO entry"
                  >
                    <X size={16} />
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
