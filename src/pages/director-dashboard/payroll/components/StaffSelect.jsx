import React from "react";

const TEACHER_LIST = [
  { id: 1, name: "Ms. Alvarez" }, { id: 2, name: "Ms. Soto" }, { id: 3, name: "Ms. Patel" },
  { id: 4, name: "Ms. Rivera" }, { id: 5, name: "Ms. Brooks" }, { id: 6, name: "Mr. Nguyen" },
  { id: 7, name: "Ms. Cohen" }, { id: 8, name: "Ms. Diaz" }, { id: 9, name: "Mr. Park" },
  { id: 10, name: "Mr. O'Brien" }, { id: 11, name: "Ms. Hassan" },
];

const StaffSelect = ({ value, onChange, exclude = [] }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] appearance-none bg-white"
  >
    <option value="">Pick staff…</option>
    {TEACHER_LIST.filter((s) => !exclude.includes(s.id)).map((s) => (
      <option key={s.id} value={s.id}>{s.name}</option>
    ))}
  </select>
);

export default StaffSelect;
