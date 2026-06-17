import React from "react";
import { UserCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const fmtDateSub = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const SubstitutesCard = ({ substitutes, subStats }) => (
  <Card className="bg-white border-none shadow-sm">
    <CardHeader>
      <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
        <UserCheck size={16} className="text-purple-500" /> Substitutes
      </CardTitle>
      <CardDescription>
        {subStats.total} substitutes this month · {subStats.uniqueSubs} unique subs · {subStats.thisWeek} this week
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-purple-50">
          <p className="text-[10px] font-semibold text-gray-400 uppercase">Total</p>
          <p className="text-xl font-bold text-gray-900">{subStats.total}</p>
        </div>
        <div className="p-3 rounded-xl bg-blue-50">
          <p className="text-[10px] font-semibold text-gray-400 uppercase">This Week</p>
          <p className="text-xl font-bold text-blue-600">{subStats.thisWeek}</p>
        </div>
        <div className="p-3 rounded-xl bg-gray-50">
          <p className="text-[10px] font-semibold text-gray-400 uppercase">Unique Subs</p>
          <p className="text-xl font-bold text-gray-900">{subStats.uniqueSubs}</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50">
          <p className="text-[10px] font-semibold text-gray-400 uppercase">Coverage Rate</p>
          <p className="text-xl font-bold text-emerald-600">{subStats.thisWeek > 0 ? `${Math.round((subStats.thisWeek / subStats.total) * 100)}%` : "0%"}</p>
        </div>
      </div>
      <div className="space-y-2">
        {substitutes.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
                {entry.subName.split(" ").slice(-1)[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  {entry.subName} <ArrowRight size={12} className="text-gray-400" /> {entry.coveringFor}
                </p>
                <p className="text-xs text-gray-400">{fmtDateSub(entry.date)} · Recorded by {entry.calledBy}</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">{entry.subName.split(" ")[0]} covered</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default SubstitutesCard;
