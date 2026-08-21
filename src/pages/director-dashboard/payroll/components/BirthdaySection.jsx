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

const BirthdaySection = ({ rows, onAdd, onUpdate, onRemove }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-5">
          <SectionHeader number={4} title="Birthday / Extra Day Off"
            description="Staff celebrating their birthday during this pay period."
            onAdd={onAdd} addLabel="Add Birthday" />
          <div className="space-y-2">
            {rows.length === 0 && <EmptyRow />}
            {rows.map((row, i) => (
              <div key={row.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 1fr 28px" }}>
                <StaffSelect value={row.staffId} onChange={(v) => onUpdate(i, "staffId", v)} />
                <input type="date" value={row.date} onChange={(e) => onUpdate(i, "date", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]" />
                <button onClick={() => onRemove(i)} className="p-1.5 hover:bg-[#AE4A3E]/10 rounded-lg text-gray-400 hover:text-[#AE4A3E] transition-colors">
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

export default BirthdaySection;
