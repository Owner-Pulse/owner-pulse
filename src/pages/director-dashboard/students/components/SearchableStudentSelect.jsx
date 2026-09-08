import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, Loader2 } from "lucide-react";

export const getStudentName = (s) => {
  if (!s) return "";
  if (s["Full Name"]) return s["Full Name"];
  const first = s["First Name"] || s.first_name || "";
  const last = s["Last Name"] || s.last_name || "";
  if (first || last) return `${first} ${last}`.trim();
  return s.student_name || s.name || `Student #${s["Child ID"] || s.id}`;
};

export const getStudentId = (s) => {
  if (!s) return "";
  return s["Child ID"] || s.child_id || s.procare_child_id || s.id || "";
};

const SearchableStudentSelect = ({
  students = [],
  selectedStudentId,
  onSelectStudent,
  disabled = false,
  isLoading = false,
  placeholder = "Select student...",
  triggerClassName,
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

  // Filter students by ID or Name
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter((s) => {
      const name = getStudentName(s).toLowerCase();
      const id = String(getStudentId(s)).toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [students, searchQuery]);

  const selectedStudent = useMemo(() => {
    return students.find((s) => String(getStudentId(s)) === String(selectedStudentId));
  }, [students, selectedStudentId]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          triggerClassName ||
          "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm flex items-center justify-between bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 disabled:bg-gray-50 disabled:cursor-not-allowed font-medium text-gray-800"
        }
      >
        <span className={selectedStudent ? "text-gray-900 font-semibold" : "text-gray-400"}>
          {disabled
            ? "Select classroom first..."
            : isLoading
            ? "Loading students..."
            : selectedStudent
            ? `${getStudentName(selectedStudent)} (ID: ${getStudentId(selectedStudent)})`
            : placeholder}
        </span>
        {isLoading ? (
          <Loader2 size={16} className="animate-spin text-gray-400 shrink-0" />
        ) : (
          <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && !isLoading && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-2 space-y-2 max-h-60 overflow-hidden flex flex-col">
          {/* Search Input inside Dropdown */}
          <div className="relative shrink-0">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student by name or ID..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 text-gray-800"
            />
          </div>

          {/* Student List */}
          <div className="overflow-y-auto space-y-0.5 flex-1 pr-1">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s) => {
                const sId = getStudentId(s);
                const sName = getStudentName(s);
                const isSelected = String(sId) === String(selectedStudentId);

                return (
                  <button
                    key={sId || sName}
                    type="button"
                    onClick={() => {
                      onSelectStudent(s);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-[#1E3A5F]/10 text-[#1E3A5F] font-bold"
                        : "hover:bg-gray-50 text-gray-700 font-medium"
                    }`}
                  >
                    <div>
                      <span className="block font-semibold">{sName}</span>
                      {sId && <span className="text-[10px] text-gray-400">Child ID: {sId}</span>}
                    </div>
                    {isSelected && <Check size={14} className="text-[#1E3A5F]" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-gray-400 font-medium">
                {searchQuery ? `No student matching "${searchQuery}"` : "No students found"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableStudentSelect;
