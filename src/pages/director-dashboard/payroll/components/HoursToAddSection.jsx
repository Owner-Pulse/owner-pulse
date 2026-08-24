import React from "react";
import { motion } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "./SectionHeader";
import EmptyRow from "./EmptyRow";
import StaffSelect from "./StaffSelect";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const HoursToAddSection = ({ rows, onAdd, onUpdate, onRemove }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm overflow-visible">
        <CardContent className="p-5 overflow-visible">
          <SectionHeader
            number={5}
            title="Hours to Add (ADP)"
            description="Extra time: after-care, tutoring, events, etc."
            onAdd={onAdd}
            addLabel="Add Hours"
          />
          <div className="space-y-2 overflow-visible">
            {rows.length === 0 && <EmptyRow />}
            {rows.map((row, i) => (
              <div
                key={row.id}
                className="grid gap-2 items-center relative z-20"
                style={{ gridTemplateColumns: "1fr 80px 130px 28px" }}
              >
                <StaffSelect value={row.staffId} onChange={(v) => onUpdate(i, "staffId", v)} />
                <input
                  type="number"
                  value={row.hours}
                  onChange={(e) => onUpdate(i, "hours", e.target.value)}
                  placeholder="0"
                  step={0.25}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
                <div className="relative">
                  <select
                    value={row.type}
                    onChange={(e) => onUpdate(i, "type", e.target.value)}
                    className="w-full h-10 pl-3 pr-7 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] appearance-none bg-white text-gray-800"
                  >
                    <option value="After-care">After-care</option>
                    <option value="Tutoring">Tutoring</option>
                    <option value="Event">Event</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                <button
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

export default HoursToAddSection;
