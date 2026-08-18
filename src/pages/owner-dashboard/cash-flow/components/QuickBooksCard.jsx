import React from "react";
import { motion } from "framer-motion";
import { Building2, CheckCircle2, AlertTriangle, RefreshCw, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { itemVariants, fmtMoney, fmtMoneyShort } from "../cashflow.utils";

const QuickBooksCard = ({ status }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building2 size={16} className="text-blue-500" />
            QuickBooks
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
            status.connected ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.connected ? "bg-emerald-500" : "bg-red-500"}`} />
            {status.connected ? "Connected" : "Disconnected"}
          </span>
        </CardTitle>
        <CardDescription>{status.bankAccount}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">Bank Balance</span>
          <span className="text-xl font-bold text-gray-900">{fmtMoney(status.bankBalance)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-50">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Receivables</span>
            <p className="text-lg font-bold text-blue-600 mt-1">{fmtMoneyShort(status.receivable)}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Payables</span>
            <p className="text-lg font-bold text-amber-600 mt-1">{fmtMoneyShort(status.payable)}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Credit Balance</span>
            <p className="text-lg font-bold text-purple-600 mt-1">{fmtMoneyShort(status.creditBalance)}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pending</span>
            <p className="text-lg font-bold text-amber-600 mt-1">{status.pendingTransactions}</p>
          </div>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">Reconciled</span>
          <span className={`inline-flex items-center gap-1 text-sm font-semibold ${status.reconciled ? "text-emerald-600" : "text-red-500"}`}>
            {status.reconciled ? <><CheckCircle2 size={14} /> Yes</> : <><AlertTriangle size={14} /> No</>}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Last Sync</span>
          <span className="text-xs text-gray-400">{status.lastSync}</span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50">
            <RefreshCw size={14} className="mr-1.5" /> Sync
          </Button>
          <Button variant="outline" className="flex-1">
            <BarChart3 size={14} className="mr-1.5" /> Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default QuickBooksCard;
