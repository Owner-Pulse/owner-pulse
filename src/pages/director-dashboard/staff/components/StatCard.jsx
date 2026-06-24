import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const StatCard = ({ label, value, valueColor = "text-gray-900" }) => (
  <Card className="bg-white border-none shadow-sm">
    <CardContent className="p-4">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </CardContent>
  </Card>
);

export default StatCard;
