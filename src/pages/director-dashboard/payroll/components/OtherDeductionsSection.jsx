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

const OtherDeductionsSection = ({ rows, onAdd, onUpdate, onRemove }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm overflow-visible">
        <CardContent className="p-5 overflow-visible">
          <SectionHeader
            number={2}
            title="Other Deductions"
            description="Loans, advances, or other paycheck deductions for staff."
            onAdd={onAdd}
            addLabel="Add Deduction"
          />
          <div className="space-y-2 overflow-visible">
            {rows.length === 0 && <EmptyRow />}
            {rows.map((row, i) => (
              <div
                key={row.id}
                className="grid gap-2 items-center relative z-20"
                style={{ gridTemplateColumns: "1fr 1fr 120px 28px" }}
              >
                <StaffSelect
                  value={row.staffId}
                  onChange={(v) => onUpdate(i, "staffId", v)}
                  placeholder="Select staff for deduction..."
                />
                <input
                  type="text"
                  value={row.description || ""}
                  onChange={(e) => onUpdate(i, "description", e.target.value)}
                  placeholder="Itemized reason (e.g. Uniform, Loan, Advance)..."
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => onUpdate(i, "amount", e.target.value)}
                    placeholder="0.00"
                    className="w-full h-10 pl-7 pr-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
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

export default OtherDeductionsSection;
