import React from "react";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const LATE_FAMILIES = [
  { name: "Garcia, R.", amount: 850, days: 38 },
  { name: "Singh, L.", amount: 450, days: 30 },
  { name: "Kim, D.", amount: 3100, days: 57 },
  { name: "Owens, M.", amount: 650, days: 21 },
];

const BillingCard = ({ onNavigate }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign size={16} className="text-red-500" />
            Billing / Late Payments
          </CardTitle>
          <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => onNavigate("/director/billing")}>View all</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="p-3 rounded-lg bg-red-50 border border-red-100">
          <p className="text-sm font-extrabold text-red-700">$3,400</p>
          <p className="text-[10px] text-red-500">past due across 7 families</p>
        </div>
        {LATE_FAMILIES.map((fam, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-900 truncate">{fam.name}</p>
              <p className="text-[9px] text-gray-400">{fam.amount} · {fam.days}d late</p>
            </div>
            <span className="text-[10px] font-semibold text-red-500 shrink-0 ml-1">${fam.amount.toLocaleString()}</span>
          </div>
        ))}
        <span className="text-[9px] text-blue-600 cursor-pointer hover:underline block text-center" onClick={() => onNavigate("/director/billing")}>
          Drill into late payments →
        </span>
      </CardContent>
    </Card>
  </motion.div>
);

export default BillingCard;
