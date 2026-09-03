import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, CheckCircle2, UserCheck, Sparkles, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WaitlistFunnelCard = ({ stats }) => {
  const {
    total,
    inquiryCount,
    touredCount,
    appliedCount,
    offeredCount,
    enrolledCount,
    lostCount,
    inquiryToTourRate,
    tourToAppliedRate,
    appliedToOfferRate,
    offerToEnrollRate,
    overallConversionRate,
    projectedMonthlyRevenue,
  } = stats;

  const stages = [
    { label: "1. Inquiry", count: inquiryCount, color: "bg-[#1E3A5F]", textColor: "text-[#1E3A5F]", rate: `${inquiryToTourRate}% tour rate` },
    { label: "2. Toured", count: touredCount, color: "bg-[#5B7FA6]", textColor: "text-[#5B7FA6]", rate: `${tourToAppliedRate}% apply rate` },
    { label: "3. Applied", count: appliedCount + offeredCount, color: "bg-[#B78A2F]", textColor: "text-[#8F6A1F]", rate: `${appliedToOfferRate}% conversion rate` },
    { label: "4. Enrolled", count: enrolledCount, color: "bg-emerald-600", textColor: "text-emerald-700", rate: "Final Conversion" },
  ];

  return (
    <Card className="bg-white border-none shadow-sm overflow-hidden">
      <CardHeader className="pb-3 bg-[#1E3A5F]/[0.03]">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <span className="flex items-center gap-2 text-[#1E3A5F]">
            <TrendingUp size={18} /> Lead-to-Enrollment Conversion Funnel
          </span>
          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            {overallConversionRate}% Overall Conversion
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {/* Funnel Stage Visual Bars */}
        <div className="space-y-3">
          {stages.map((stg, i) => {
            const pct = total > 0 ? Math.max(8, Math.round((stg.count / total) * 100)) : 10;
            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-800">{stg.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-900">{stg.count} families</span>
                    <span className="text-[10px] text-gray-400">({stg.rate})</span>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${stg.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Drop-off / Lost summary & Revenue Forecast */}
        <div className="pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Lost Leads</p>
              <p className="font-extrabold text-sm text-[#8A362C]">{lostCount} families</p>
            </div>
            <span className="text-[11px] text-gray-500">
              {total > 0 ? Math.round((lostCount / total) * 100) : 0}% loss rate
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#1E3A5F]/[0.05] border border-[#1E3A5F]/15 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#1E3A5F] uppercase tracking-wider font-semibold">Pipeline Revenue Forecast</p>
              <p className="font-extrabold text-sm text-[#1E3A5F]">
                ${projectedMonthlyRevenue.toLocaleString()}/mo
              </p>
            </div>
            <span className="text-[10px] text-[#1E3A5F]/80">From Applied + Offered</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaitlistFunnelCard;
