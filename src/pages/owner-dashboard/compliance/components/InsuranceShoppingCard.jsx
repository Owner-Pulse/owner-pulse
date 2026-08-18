import React from "react";
import { RefreshCw, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const TODAY = new Date("2026-05-11");
const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - TODAY) / 86400000);

const InsuranceShoppingCard = () => {
  const shopDays = daysUntil("2026-09-19");
  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw size={16} className="text-[#1E3A5F]" />
          Insurance Shopping
        </CardTitle>
        <CardDescription>
          Consolidated single insurance item. Shop rates ~60 days before renewal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-xl bg-[#1E3A5F]/[0.04] border border-[#1E3A5F]/15">
          <div className="flex items-start gap-3">
            <RefreshCw size={20} className="text-[#1E3A5F] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#1E3A5F]">Insurance renewal: November 18, 2026</p>
              <p className="text-xs text-[#1E3A5F]/75 mt-1">
                All policies consolidated into one item. 60-day shop reminder:{" "}
                <span className="font-bold">September 19, 2026</span>.{" "}
                {shopDays > 0
                  ? `${shopDays} days until shopping window opens.`
                  : `Shopping window is open now.`}
              </p>
              <p className="text-xs text-[#1E3A5F]/70 mt-1 flex items-start gap-1">
                <Lightbulb size={12} className="flex-shrink-0 mt-0.5" />
                Insurance rates have been rising 8-12% YoY in this market.
                Starting the shopping process 60 days before renewal gives you leverage.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsuranceShoppingCard;
