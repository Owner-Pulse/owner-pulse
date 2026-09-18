import React from "react";
import { Building2, UserCheck } from "lucide-react";
import DirectorComplianceCard from "./DirectorComplianceCard";

const DirectorComplianceColumn = ({
  title,
  items,
  emptyMessage,
  headerIcon,
  headerBadgeClass,
  cardProps,
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
      <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
        {headerIcon}
        {title}
      </h2>
      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${headerBadgeClass}`}>
        {items.length} items
      </span>
    </div>

    {items.length > 0 ? (
      items.map((item) => (
        <DirectorComplianceCard key={item.id} item={item} {...cardProps} />
      ))
    ) : (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
        {emptyMessage}
      </div>
    )}
  </div>
);

export const OwnerColumn = (props) => (
  <DirectorComplianceColumn
    title="Owner Responsibilities"
    emptyMessage="No owner compliance items to display."
    headerIcon={<Building2 size={16} className="text-[#1E3A5F]" />}
    headerBadgeClass="text-[#1E3A5F] bg-[#1E3A5F]/10"
    {...props}
  />
);

export const DirectorColumn = (props) => (
  <DirectorComplianceColumn
    title="Director Responsibilities"
    emptyMessage="No director compliance items match the selected filter."
    headerIcon={<UserCheck size={16} className="text-[#1E3A5F]" />}
    headerBadgeClass="text-[#8F6A1F] bg-[#B78A2F]/10"
    {...props}
  />
);

export default DirectorComplianceColumn;
