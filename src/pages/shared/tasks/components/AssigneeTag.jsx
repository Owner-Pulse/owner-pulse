import React from "react";
import { Users } from "lucide-react";

const AssigneeTag = ({ assignee }) => {
  const isOwner = assignee === "owner";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isOwner ? "bg-purple-50 text-purple-700" : "bg-amber-50 text-amber-700"}`}>
      <Users size={10} />
      {isOwner ? "Owner" : "Director"}
    </span>
  );
};

export default AssigneeTag;
