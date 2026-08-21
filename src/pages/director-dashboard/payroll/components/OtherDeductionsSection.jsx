import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "./SectionHeader";
import EmptyRow from "./EmptyRow";

const OTHER_DEDUCTIONS = [
  { id: 1, staffName: "Ms. Crane", type: "Loan", originalAmount: 4000, balance: 3530 },
  { id: 2, staffName: "Mr. Levine", type: "Advance", originalAmount: 800, balance: 480 },
];

const balanceColor = (n) => n <= 0 ? "text-[#AE4A3E]" : n <= 2 ? "text-[#B78A2F]" : "text-[#3E7A54]";
const balanceBg = (n) => n <= 0 ? "bg-[#AE4A3E]/10" : n <= 2 ? "bg-[#B78A2F]/10" : "bg-[#3E7A54]/10";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const OtherDeductionsSection = ({ rows, onAdd, onUpdate, onRemove }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-5">
          <SectionHeader number={2} title="Other Deductions"
            description="Loans, advances. Remaining balance auto-tracks across pay periods."
            onAdd={onAdd} addLabel="Add Deduction" />
          <div className="space-y-2">
            {rows.length === 0 && <EmptyRow />}
            {rows.map((row, i) => {
              const loan = OTHER_DEDUCTIONS.find((l) => l.id === Number(row.loanId));
              const newBal = loan ? loan.balance - (Number(row.amount) || 0) : 0;
              return (
                <div key={row.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 80px 120px 28px" }}>
                  <select value={row.loanId} onChange={(e) => onUpdate(i, "loanId", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] appearance-none bg-white">
                    <option value="">Pick loan…</option>
                    {OTHER_DEDUCTIONS.map((l) => (
                      <option key={l.id} value={l.id}>{l.staffName} · {l.type}</option>
                    ))}
                  </select>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                    <input type="number" value={row.amount} onChange={(e) => onUpdate(i, "amount", e.target.value)}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]" />
                  </div>
                  <div className={`px-2 py-2 rounded-xl text-[10px] text-center font-bold ${loan ? balanceBg(newBal) : "bg-gray-50"} ${loan ? balanceColor(newBal) : "text-gray-400"}`}>
                    {loan ? `$${newBal.toLocaleString()} left` : "—"}
                  </div>
                  <button onClick={() => onRemove(i)} className="p-1.5 hover:bg-[#AE4A3E]/10 rounded-lg text-gray-400 hover:text-[#AE4A3E] transition-colors">
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

export default OtherDeductionsSection;
