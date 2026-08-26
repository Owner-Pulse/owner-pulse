import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, Loader2, User } from "lucide-react";

export const getStaffName = (staff) => {
  if (!staff) return "";
  if (staff["Full Name"]) return staff["Full Name"];
  const first = staff["First Name"] || staff.first_name || "";
  const last = staff["Last Name"] || staff.last_name || "";
  if (first || last) return `${first} ${last}`.trim();
  return staff.staff_name || staff.name || `Staff #${staff["Employee ID"] || staff.id}`;
};

export const getStaffId = (staff) => {
  if (!staff) return "";
  return staff["Employee ID"] || staff.id || staff.employee_id || "";
};

export const getStaffRole = (staff) => {
  if (!staff) return "";
  return staff["Category Description"] || staff["Primary Work Area"] || staff.role || "";
};

const SearchableStaffSelect = ({
  staffs = [],
  selectedStaffId,
  onSelectStaff,
  disabled = false,
  isLoading = false,
  placeholder = "Select or search staff...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter staff by ID, Name, or Role
  const filteredStaffs = useMemo(() => {
    if (!searchQuery.trim()) return staffs;
    const q = searchQuery.toLowerCase().trim();
    return staffs.filter((s) => {
      const name = getStaffName(s).toLowerCase();
      const id = String(getStaffId(s)).toLowerCase();
      const role = getStaffRole(s).toLowerCase();
      return name.includes(q) || id.includes(q) || role.includes(q);
    });
  }, [staffs, searchQuery]);

  const selectedStaff = useMemo(() => {
    return staffs.find((s) => String(getStaffId(s)) === String(selectedStaffId));
  }, [staffs, selectedStaffId]);

  return (
    <div className={`relative w-full ${isOpen ? "z-50" : "z-10"}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm flex items-center justify-between bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 disabled:bg-gray-50 disabled:cursor-not-allowed font-medium text-gray-800"
      >
        <span className={selectedStaff ? "text-gray-900 font-semibold flex items-center gap-2 truncate" : "text-gray-400 truncate"}>
          {isLoading ? (
            "Loading staff list..."
          ) : selectedStaff ? (
            <>
              <User size={14} className="text-[#1E3A5F] shrink-0" />
              <span className="truncate">
                {getStaffName(selectedStaff)}
                {getStaffRole(selectedStaff) ? ` (${getStaffRole(selectedStaff)})` : ""}
              </span>
            </>
          ) : (
            placeholder
          )}
        </span>
        {isLoading ? (
          <Loader2 size={16} className="animate-spin text-gray-400 shrink-0" />
        ) : (
          <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && !isLoading && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-2 space-y-2 max-h-60 overflow-hidden flex flex-col">
          {/* Search Input inside Dropdown */}
          <div className="relative shrink-0">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type staff name, ID, or role..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 text-gray-800"
            />
          </div>

          {/* Staff List */}
          <div className="overflow-y-auto space-y-0.5 flex-1 pr-1 max-h-44">
            {filteredStaffs.length > 0 ? (
              filteredStaffs.map((s) => {
                const sId = getStaffId(s);
                const sName = getStaffName(s);
                const sRole = getStaffRole(s);
                const isSelected = String(sId) === String(selectedStaffId);

                return (
                  <button
                    key={sId || sName}
                    type="button"
                    onClick={() => {
                      onSelectStaff(sId);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between text-left transition-colors ${
                      isSelected ? "bg-[#1E3A5F]/10 text-[#1E3A5F] font-bold" : "hover:bg-gray-50 text-gray-700 font-medium"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="truncate">{sName}</span>
                      {sRole && <span className="text-[10px] text-gray-400 font-normal truncate">{sRole}</span>}
                    </div>
                    {isSelected && <Check size={14} className="text-[#1E3A5F] shrink-0 ml-1" />}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-gray-400">No staff found matching "{searchQuery}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableStaffSelect;
