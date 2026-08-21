import React from "react";

const PRESCHOOL_PROGRAMS = ["Age 1", "Age 2", "PreK3", "PreK4", "VPK", "Summer"];

const ProgramBadge = ({ program }) => {
  const isPreschool = PRESCHOOL_PROGRAMS.includes(program);
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${isPreschool ? "bg-[#1E3A5F]/10 text-[#1E3A5F]" : "bg-[#2A4C7E]/10 text-[#2A4C7E]"}`}>
      {program}
    </span>
  );
};

export default ProgramBadge;
