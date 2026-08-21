import React from "react";

const RoleBadge = ({ role }) => {
  if (role === "owner") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#1E3A5F] text-white border border-[#1E3A5F]">
        Owner
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#1E3A5F]/[0.06] text-[#1E3A5F] border border-[#1E3A5F]/25">
      Director
    </span>
  );
};

export default RoleBadge;
