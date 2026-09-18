import React from "react";
import { ShieldAlert, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const DirectorComplianceHeader = ({ stats, onPulseClick, onAddClick }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
          Director Compliance Dashboard
        </h1>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-[#1E3A5F]/[0.05] border-[#1E3A5F]/15">
          <span className="bg-gradient-to-r from-[#1E3A5F] via-[#5B7FA6] to-[#9DB8D9] bg-clip-text text-transparent">
            {stats.complianceScore}% Compliant
          </span>
        </span>
      </div>
      <p className="text-xs md:text-sm text-gray-500 mt-1">
        Daily Monitoring Workflow &amp; Regulatory Readiness · {stats.compliant}/{stats.total} active · {stats.completed} completed
      </p>
    </div>

    <div className="flex items-center gap-2 shrink-0 flex-wrap">
      <Button
        onClick={onPulseClick}
        variant="outline"
        className="bg-white text-xs md:text-sm px-3 border-gray-200 cursor-pointer"
      >
        <ShieldAlert size={14} className="mr-1.5 text-[#AE4A3E]" /> Pulse Impact
      </Button>
      <Button
        onClick={onAddClick}
        className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm px-3 cursor-pointer"
      >
        <Plus size={14} className="mr-1.5" /> Add Compliance Item
      </Button>
    </div>
  </div>
);

export default DirectorComplianceHeader;
