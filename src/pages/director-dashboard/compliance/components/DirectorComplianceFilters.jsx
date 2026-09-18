import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { itemVariants } from "./variants";

const DirectorComplianceFilters = ({
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  totalItems,
  ownerCount,
  directorCount,
  completedCount,
}) => (
  <motion.div variants={itemVariants}>
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Role Filter Tabs */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg gap-1">
          {[
            { key: "all", label: `All (${totalItems})` },
            { key: "owner", label: `Owner (${ownerCount})` },
            { key: "director", label: `Director (${directorCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCategoryFilter(tab.key)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === tab.key
                  ? "bg-[#1E3A5F] text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="completed">✅ Completed ({completedCount})</option>
          <option value="expired">🔴 Expired</option>
          <option value="expiring">🟠 Expiring Soon</option>
          <option value="compliant">🟢 Compliant</option>
        </select>
      </div>

      <div className="w-full md:w-64">
        <Input
          type="text"
          placeholder="Search items or authority..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
    </div>
  </motion.div>
);

export default DirectorComplianceFilters;
