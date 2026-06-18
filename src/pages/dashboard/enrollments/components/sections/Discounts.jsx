import React from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const Discounts = ({ discounts, discountTotal, itemVariants, fmtMoney, fmtMoneyShort }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award size={18} className="text-cyan-500" />
            Discounts & Waived Tuition
          </CardTitle>
          <CardDescription>
            {discounts.reduce((a, d) => a + d.count, 0)} students
            receiving tuition breaks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-gray-50 text-center">
              <p className="text-2xl font-extrabold text-cyan-600">
                {discounts.reduce((a, d) => a + d.count, 0)}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                Students
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 text-center">
              <p className="text-2xl font-extrabold text-amber-600">
                {fmtMoneyShort(discountTotal)}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                Per Month
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 text-center">
              <p className="text-2xl font-extrabold text-amber-600">
                {fmtMoneyShort(discountTotal * 10)}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                Annualized
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {discounts.map((d) => (
              <div
                key={d.type}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {d.type}
                  </p>
                  <p className="text-xs text-gray-500">{d.count} students</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {fmtMoney(d.monthlyValue)}/mo
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-800">
              <span className="font-bold">Annual revenue impact:</span>{" "}
              {fmtMoney(discountTotal * 10)} given away in discounts across
              a 10-month school year.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Discounts;
