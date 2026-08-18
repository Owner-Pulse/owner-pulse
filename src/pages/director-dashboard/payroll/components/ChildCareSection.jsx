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

const ChildCareSection = ({ rows, onAdd, onUpdate, onRemove }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-5">
          <SectionHeader number={1} title="Child Care Deductions"
            description="Tuition-style deductions taken from staff paychecks."
            onAdd={onAdd} addLabel="Add Deduction" />
          <div className="space-y-2">
            {rows.length === 0 && <EmptyRow />}
            {rows.map((row, i) => (
              <div key={row.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 100px 28px" }}>
                <StaffSelect value={row.staffId} onChange={(v) => onUpdate(i, "staffId", v)} />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                  <input type="number" value={row.amount} onChange={(e) => onUpdate(i, "amount", e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]" />
                </div>
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

export default ChildCareSection;
