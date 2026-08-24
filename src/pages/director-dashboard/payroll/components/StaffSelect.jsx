import React from "react";
import SearchableStaffSelect from "@/pages/owner-dashboard/classrooms/components/SearchableStaffSelect";
import { useGetAllStaffs } from "@/hooks/classroom/classroom.hook";

const StaffSelect = ({ value, onChange, placeholder = "Pick staff...", disabled = false }) => {
  const { staffs, isLoading } = useGetAllStaffs();

  return (
    <SearchableStaffSelect
      staffs={staffs}
      selectedStaffId={value}
      onSelectStaff={(staffId) => onChange(staffId)}
      disabled={disabled}
      isLoading={isLoading}
      placeholder={placeholder}
    />
  );
};

export default StaffSelect;
