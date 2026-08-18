import React from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import InsightCard from "./InsightCard";
import { itemVariants } from "../cashflow.utils";

const AiInsightsCard = ({ title, subtitle, insights = [] }) => (
  <motion.div variants={itemVariants} className="lg:col-span-2">
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb size={18} className="text-[#1E3A5F]" />
          {title || "AI-Generated Observations"}
        </CardTitle>
        <CardDescription>{subtitle || `Auto-detected · ${insights.length} insights`}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {insights.map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}
      </CardContent>
    </Card>
  </motion.div>
);

export default AiInsightsCard;
