import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "./SectionHeader";
import EmptyRow from "./EmptyRow";
import StaffSelect from "./StaffSelect";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const HolidayExceptionsSection = ({ rows = [], onAdd, onUpdate, onRemove }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm overflow-visible">
        <CardContent className="p-5 overflow-visible">
          <SectionHeader
            number={6}
            title="Holiday Exceptions"
            description="Staff who worked during a holiday and should be paid."
            onAdd={onAdd}
            addLabel="Add Holiday Exception"
          />
          <div className="space-y-2 overflow-visible">
            {rows.length === 0 && <EmptyRow text="No holiday exceptions logged for this pay period." />}
            {rows.map((row, i) => (
              <div
                key={row.id}
                className="grid gap-2 items-center relative z-20"
                style={{ gridTemplateColumns: "1fr 1.2fr 130px 28px" }}
              >
                <StaffSelect
                  value={row.staffId}
                  onChange={(v) => onUpdate(i, "staffId", v)}
                  placeholder="Select staff who worked..."
                />
                <input
                  type="text"
                  value={row.holidayName || ""}
                  onChange={(e) => onUpdate(i, "holidayName", e.target.value)}
                  placeholder="Holiday name (e.g. Memorial Day)..."
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
                <input
                  type="date"
                  value={row.date || ""}
                  onChange={(e) => onUpdate(i, "date", e.target.value)}
                  className="w-full h-10 px-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="p-1.5 hover:bg-[#AE4A3E]/10 rounded-lg text-gray-400 hover:text-[#AE4A3E] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HolidayExceptionsSection;
