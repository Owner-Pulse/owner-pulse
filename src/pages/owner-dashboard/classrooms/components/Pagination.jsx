import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// Windowed page numbers: first, …, current±2, …, last
const getPageWindow = (current, total) => {
  const pages = [];
  const addPage = (p) => {
    if (!pages.includes(p) && p >= 1 && p <= total) pages.push(p);
  };
  addPage(1);
  for (let d = -2; d <= 2; d++) addPage(current + d);
  addPage(total);
  return pages.sort((a, b) => a - b);
};

const Pagination = ({ currentPage, lastPage, from, to, total, isFetching, onPageChange }) => {
  if (!lastPage || lastPage <= 1) return null;

  const pages = getPageWindow(currentPage, lastPage);

  return (
    <motion.div variants={itemVariants} className="flex items-center justify-between pt-2">
      <p className="text-xs text-gray-500">
        Showing {from}–{to} of {total} classrooms
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isFetching}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, idx) => (
          <React.Fragment key={p}>
            {idx > 0 && p - pages[idx - 1] > 1 && (
              <span className="px-1 text-xs text-gray-400">…</span>
            )}
            <button
              onClick={() => onPageChange(p)}
              className={`min-w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                p === currentPage
                  ? "bg-[#1E3A5F] text-white shadow-sm"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage || isFetching}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default Pagination;
