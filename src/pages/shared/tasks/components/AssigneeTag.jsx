import React from "react";
import { Users } from "lucide-react";

const AssigneeTag = ({ assignee }) => {
  const isOwner = assignee === "owner";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isOwner ? "bg-[#1E3A5F]/10 text-[#1E3A5F]" : "bg-[#B78A2F]/10 text-[#8F6A1F]"}`}>
      <Users size={10} />
      {isOwner ? "Owner" : "Director"}
    </span>
  );
};

export default AssigneeTag;
