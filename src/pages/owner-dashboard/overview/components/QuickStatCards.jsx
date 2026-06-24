import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Receipt } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const QuickStatCards = ({ quickbooksStatus, procareData }) => (
  <motion.div variants={itemVariants} className="flex flex-col gap-4">
    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center text-[9px] font-bold text-green-700">QB</div>
            QuickBooks Sync
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-xs text-gray-500">Bank Balance</span>
          <span className="text-base font-bold text-gray-900">${quickbooksStatus.bankBalance.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-xs text-gray-500">Pending Transactions</span>
          <span className="text-amber-600 font-medium text-xs">{quickbooksStatus.pendingTransactions} to review</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Last Sync</span>
          <span className="text-xs text-gray-400">{quickbooksStatus.lastSync}</span>
        </div>
        <Button variant="outline" className="w-full mt-1 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 h-8">
          Sync Now
        </Button>
      </CardContent>
    </Card>

    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center text-[9px] font-bold text-blue-600">P</div>
          Procare Today
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-gray-50 rounded-lg"><p className="text-base font-bold text-gray-900">{procareData.parentMessages}</p><p className="text-[10px] text-gray-400">Messages</p></div>
          <div className="p-2 bg-gray-50 rounded-lg"><p className="text-base font-bold text-gray-900">{procareData.medicationGiven}</p><p className="text-[10px] text-gray-400">Medications</p></div>
          <div className="p-2 bg-amber-50 rounded-lg"><p className="text-base font-bold text-amber-600">{procareData.illnesses}</p><p className="text-[10px] text-gray-400">Illnesses</p></div>
          <div className="p-2 bg-emerald-50 rounded-lg"><p className="text-base font-bold text-emerald-600">{procareData.incidents}</p><p className="text-[10px] text-gray-400">Incidents</p></div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default QuickStatCards;
