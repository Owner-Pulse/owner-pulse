import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "./SectionHeader";
import EmptyRow from "./EmptyRow";
import StaffSelect from "./StaffSelect";

const STAFF = [
  { id: 1, name: "Ms. Alvarez", role: "Teacher", ptoAllowance: 10, ptoUsed: 3 },
  { id: 2, name: "Ms. Soto", role: "Teacher", ptoAllowance: 10, ptoUsed: 2 },
  { id: 3, name: "Ms. Patel", role: "Teacher", ptoAllowance: 10, ptoUsed: 5 },
  { id: 4, name: "Ms. Rivera", role: "Teacher", ptoAllowance: 10, ptoUsed: 1 },
  { id: 5, name: "Ms. Brooks", role: "Teacher", ptoAllowance: 10, ptoUsed: 4 },
  { id: 6, name: "Mr. Nguyen", role: "Teacher", ptoAllowance: 10, ptoUsed: 6 },
  { id: 7, name: "Ms. Cohen", role: "Teacher", ptoAllowance: 10, ptoUsed: 7 },
  { id: 8, name: "Ms. Diaz", role: "Teacher", ptoAllowance: 10, ptoUsed: 0 },
  { id: 9, name: "Mr. Park", role: "Teacher", ptoAllowance: 10, ptoUsed: 3 },
  { id: 10, name: "Mr. O'Brien", role: "Teacher", ptoAllowance: 10, ptoUsed: 2 },
  { id: 11, name: "Ms. Hassan", role: "Teacher", ptoAllowance: 10, ptoUsed: 8 },
];

const ptoBalance = (staffId) => { const s = STAFF.find((x) => x.id === Number(staffId)); return s ? s.ptoAllowance - s.ptoUsed : null; };
const daysBetween = (start, end) => { if (!start) return 0; if (!end || end === start) return 1; return Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1); };
const balanceColor = (n) => n <= 0 ? "text-[#AE4A3E]" : n <= 2 ? "text-[#B78A2F]" : "text-[#3E7A54]";
const balanceBg = (n) => n <= 0 ? "bg-[#AE4A3E]/10" : n <= 2 ? "bg-[#B78A2F]/10" : "bg-[#3E7A54]/10";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const PTOSection = ({ rows, onAdd, onUpdate, onRemove }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-5">
          <SectionHeader number={3} title="PTO This Period"
            description="Single day or date range — system auto-counts and deducts from balance."
            onAdd={onAdd} addLabel="Add PTO" />
          <div className="space-y-2">
            {rows.length === 0 && <EmptyRow />}
            {rows.map((row, i) => {
              const balance = row.staffId ? ptoBalance(Number(row.staffId)) : null;
              const days = daysBetween(row.startDate, row.endDate);
              const afterBalance = balance !== null ? balance - days : null;
              return (
                <div key={row.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 1.2fr 110px 28px" }}>
                  <StaffSelect value={row.staffId} onChange={(v) => onUpdate(i, "staffId", v)} />
                  <div className="flex gap-1 items-center">
                    <input type="date" value={row.startDate} onChange={(e) => onUpdate(i, "startDate", e.target.value)}
                      className="flex-1 min-w-0 px-2 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]" />
                    <span className="text-xs text-gray-400">→</span>
                    <input type="date" value={row.endDate} onChange={(e) => onUpdate(i, "endDate", e.target.value)}
                      className="flex-1 min-w-0 px-2 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]" />
                  </div>
                  <div className={`px-2 py-2 rounded-xl text-[10px] text-center font-bold ${
                    afterBalance !== null ? balanceBg(afterBalance) : "bg-gray-50"
                  } ${afterBalance !== null ? balanceColor(afterBalance) : "text-gray-400"}`}>
                    {afterBalance !== null ? `${afterBalance} left` : "—"}
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

export default PTOSection;
