import React from "react";
import { Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const fmtMoney = (n) => "$" + Math.round(n ?? 0).toLocaleString();
const fmtMoneyShort = (n) => {
  const abs = Math.abs(n ?? 0);
  return abs >= 1_000_000
    ? "$" + (abs / 1_000_000).toFixed(1) + "M"
    : abs >= 1000
    ? "$" + (abs / 1000).toFixed(1) + "K"
    : "$" + Math.round(abs);
};

const DiscountsCard = ({ discountsObj = {}, categories = [] }) => {
  const totalStudents = discountsObj.students_count || discountsObj.count || categories.reduce((a, d) => a + d.count, 0);
  const monthlyAmount = discountsObj.monthly_amount || categories.reduce((a, d) => a + d.monthlyValue, 0);
  const formattedMonthly = discountsObj.formatted_monthly_amount || fmtMoneyShort(monthlyAmount);
  
  const annualizedAmount = discountsObj.annualized_amount || (monthlyAmount * 10);
  const formattedAnnualized = discountsObj.formatted_annualized_amount || fmtMoneyShort(annualizedAmount);

  const annualImpact = discountsObj.annual_revenue_impact || {};
  const impactMsg = annualImpact.message || 
    `Annual revenue impact: ${annualImpact.formatted_impact || fmtMoney(annualizedAmount)} given away in discounts across a ${annualImpact.school_months || 10}-month school year.`;

  return (
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award size={18} className="text-[#1E3A5F]" />
          Discounts & Waived Tuition
        </CardTitle>
        <CardDescription>
          {discountsObj.subtitle || `${totalStudents} students receiving tuition breaks`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-gray-50 text-center">
            <p className="text-2xl font-extrabold text-[#1E3A5F]">{totalStudents}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Students</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 text-center">
            <p className="text-2xl font-extrabold text-[#8F6A1F]">{formattedMonthly}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Per Month</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 text-center">
            <p className="text-2xl font-extrabold text-[#8F6A1F]">{formattedAnnualized}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Annualized</p>
          </div>
        </div>

        <div className="space-y-2">
          {categories.map((d) => (
            <div key={d.type} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-900">{d.type}</p>
                <p className="text-xs text-gray-500">{d.count} students</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{d.formattedAmount || `${fmtMoney(d.monthlyValue)}/mo`}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-[#B78A2F]/10 border border-[#B78A2F]/25">
          <p className="text-xs text-[#8F6A1F]">
            {impactMsg}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscountsCard;
