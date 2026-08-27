import React from "react";
import { School } from "lucide-react";
import { Button } from "@/components/ui/button";
import Skeleton from "./Skeleton";
import { fmtMoneyShort } from "./format";

const ClassroomsHeader = ({ isLoading, metrics, summaryHeading, onAddClick }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
    <div className="min-w-0">
      <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
        Classrooms <span className="text-sm md:text-base font-normal text-gray-500 hidden sm:inline">— P&L + Performance</span>
      </h1>
      <p className="text-xs md:text-sm text-gray-500 mt-1">
        {isLoading ? (
          <Skeleton className="h-3.5 w-48 inline-block" />
        ) : summaryHeading ? (
          summaryHeading
        ) : (
          <>
            {metrics?.total_classrooms ?? 0} classrooms ·{" "}
            {metrics?.total_students ?? 0} students ·{" "}
            {fmtMoneyShort(metrics?.net_monthly_profit ?? 0)}/mo
          </>
        )}
      </p>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <Button onClick={onAddClick} className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm px-2.5 md:px-3">
        <School size={14} className="mr-1.5" /> Add Classroom
      </Button>
    </div>
  </div>
);

export default ClassroomsHeader;
