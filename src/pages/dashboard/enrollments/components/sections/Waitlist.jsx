import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const StatusPill = ({ status, children }) => {
  const colors = {
    intervening: "bg-amber-50 text-amber-700 border-amber-200",
    retained: "bg-green-50 text-green-700 border-green-200",
    lost: "bg-red-50 text-red-700 border-red-200",
    compliant: "bg-green-50 text-green-700 border-green-200",
    inquiry: "bg-gray-50 text-gray-600 border-gray-200",
    applied: "bg-blue-50 text-blue-700 border-blue-200",
    toured: "bg-purple-50 text-purple-700 border-purple-200",
    offered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    financial: "bg-amber-50 text-amber-700 border-amber-200",
    transferring: "bg-orange-50 text-orange-700 border-orange-200",
    other: "bg-gray-50 text-gray-600 border-gray-200",
    moving: "bg-red-50 text-red-700 border-red-200",
    referral: "bg-blue-50 text-blue-700 border-blue-200",
    website: "bg-cyan-50 text-cyan-700 border-cyan-200",
    walk_in: "bg-emerald-50 text-emerald-700 border-emerald-200",
    event: "bg-purple-50 text-purple-700 border-purple-200",
  };
  const c = colors[status] || "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${c}`}
    >
      {children}
    </span>
  );
};

const Waitlist = ({ waitlistEntries, itemVariants }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={18} className="text-purple-500" />
            Waitlist
          </CardTitle>
          <CardDescription>
            {waitlistEntries.length} families waiting for spots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Child
                  </th>
                  <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Parent
                  </th>
                  <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {waitlistEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2.5 font-medium text-gray-900">
                      {entry.child}
                    </td>
                    <td className="py-2.5 text-gray-600">
                      {entry.program}
                    </td>
                    <td className="py-2.5 text-gray-500 hidden md:table-cell">
                      {entry.parent}
                    </td>
                    <td className="py-2.5">
                      <StatusPill status={entry.status}>
                        {entry.status}
                      </StatusPill>
                    </td>
                    <td className="py-2.5 hidden md:table-cell">
                      <StatusPill status={entry.source}>
                        {entry.source}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">
                {waitlistEntries.filter((e) => e.status === "inquiry")
                  .length + waitlistEntries.filter((e) => e.status === "applied").length}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                Active
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">
                {waitlistEntries.filter((e) => e.status === "toured")
                  .length + waitlistEntries.filter((e) => e.status === "offered").length}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                Toured
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {waitlistEntries.filter((e) => e.status === "offered")
                  .length}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                Offered
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full mt-3 text-sm text-blue-600"
          >
            View full waitlist →
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Waitlist;
