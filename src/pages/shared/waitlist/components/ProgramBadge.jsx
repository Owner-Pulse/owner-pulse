import React from "react";

const PRESCHOOL_PROGRAMS = ["Age 1", "Age 2", "PreK3", "PreK4", "VPK", "Summer"];

const ProgramBadge = ({ program }) => {
  const isPreschool = PRESCHOOL_PROGRAMS.includes(program);
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${isPreschool ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
      {program}
    </span>
  );
};

export default ProgramBadge;
