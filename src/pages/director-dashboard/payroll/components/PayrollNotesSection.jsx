import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "./SectionHeader";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const PayrollNotesSection = ({ notes, onChange }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-5">
          <SectionHeader number={7} title="Payroll Notes"
            description="Notes for the Owner to review before approval." />
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Preschool Notes</label>
              <textarea value={notes.preschool} onChange={(e) => onChange({ ...notes, preschool: e.target.value })}
                placeholder="Anything the Owner should know about preschool staff…"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] resize-none" rows={2} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Elementary Notes</label>
              <textarea value={notes.elementary} onChange={(e) => onChange({ ...notes, elementary: e.target.value })}
                placeholder="Anything the Owner should know about elementary staff…"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] resize-none" rows={2} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PayrollNotesSection;
