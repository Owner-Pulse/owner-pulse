import React from "react";

const RoleBadge = ({ role }) => {
  if (role === "owner") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
        Owner
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
      Director
    </span>
  );
};

export default RoleBadge;
