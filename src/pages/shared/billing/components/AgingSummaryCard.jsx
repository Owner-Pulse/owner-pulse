import React from "react";
import { DollarSign, Send, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AGING_BUCKETS = [
  { key: "1-7", label: "1–7 days" },
  { key: "8-14", label: "8–14 days" },
  { key: "15-30", label: "15–30 days" },
  { key: "31-60", label: "31–60 days" },
  { key: "60+", label: "60+ days" },
];

const BUCKET_COLORS = {
  "1-7": "#16A34A",
  "8-14": "#D97706",
  "15-30": "#F97316",
  "31-60": "#DC2626",
  "60+": "#7F1D1D",
};

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();

const AgingSummaryCard = ({ isOwner, totalPastDue, pastDueCount, agingData }) => (
  <Card className="bg-white border-none shadow-sm h-full">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <DollarSign size={16} className="text-amber-500" />
        {isOwner ? "Aging Summary" : "Quick Actions"}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {isOwner ? (
        <>
          <p className="text-xs text-gray-500">
            <strong className="text-gray-700">{fmtMoney(totalPastDue)}</strong> total past due across{" "}
            <strong className="text-gray-700">{pastDueCount}</strong> families.
          </p>
          <div className="space-y-2">
            {AGING_BUCKETS.filter((b) => agingData.find((a) => a.name === b.label)?.amount > 0).map((bucket) => (
              <div key={bucket.key} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BUCKET_COLORS[bucket.key] }} />
                  <span className="text-xs text-gray-600">{bucket.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-900">
                    {fmtMoney(agingData.find((a) => a.name === bucket.label)?.amount || 0)}
                  </span>
                  <span className="text-[9px] text-gray-400 ml-1">
                    ({agingData.find((a) => a.name === bucket.label)?.count || 0} fams)
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Family names available for Director follow-up. Owner sees aggregate only.
          </p>
        </>
      ) : (
        <>
          <p className="text-xs text-gray-500">
            <strong className="text-gray-700">{fmtMoney(totalPastDue)}</strong> total outstanding.
            Contact families in older buckets first.
          </p>
          <div className="space-y-2">
            <Button variant="outline" className="w-full h-9 text-xs justify-start"
              onClick={() => window.alert("Send bulk reminder to all late families")}>
              <Send size={14} className="mr-2 text-blue-500" /> Send Bulk Reminders
            </Button>
            <Button variant="outline" className="w-full h-9 text-xs justify-start">
              <Phone size={14} className="mr-2 text-green-500" /> Call List (Oldest First)
            </Button>
            <Button variant="outline" className="w-full h-9 text-xs justify-start">
              <Mail size={14} className="mr-2 text-purple-500" /> Email All Late Accounts
            </Button>
          </div>
        </>
      )}
    </CardContent>
  </Card>
);

export default AgingSummaryCard;
