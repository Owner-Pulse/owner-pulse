import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import ClassroomsHeader from "./components/ClassroomsHeader";
import ClassroomKpis from "./components/ClassroomKpis";
import PnLSummaryCard from "./components/PnLSummaryCard";
import ProfitChart from "./components/ProfitChart";
import TierFilter from "./components/TierFilter";
import ClassroomDetailCard from "./components/ClassroomDetailCard";
import AddClassroomModal from "./components/AddClassroomModal";
import Pagination from "./components/Pagination";
import { ClassroomCardSkeleton, PnLChartSkeleton } from "./components/Skeleton";
import { useGetClassroom } from "@/hooks";

// ─── Motion Variants ──────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

// ─── Page ─────────────────────────────────────────────────────────
const EMPTY_CLASSROOM_FORM = {
  name: "",
  program: "",
  tier: "preschool",
  capacity: "",
  teacher: "",
  tuitionPerSeat: "",
  monthlyCost: "",
};

const ClassroomsPage = () => {
  const [activeFilter, setActiveFilter] = useState("All Classrooms");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [classroomForm, setClassroomForm] = useState(EMPTY_CLASSROOM_FORM);
  const PER_PAGE = 10;

  const { data, isLoading, isFetching } = useGetClassroom({
    filter: activeFilter,
    per_page: PER_PAGE,
    page: currentPage,
  });

  const pnl = data?.classroom_pnl;
  const metrics = pnl?.metrics;
  const pnlSummary = pnl?.pnl_summary;
  const filters = pnl?.filters ?? ["All Classrooms"];
  const classroomsList = pnl?.classrooms_list?.data ?? [];
  const pagination = pnl?.classrooms_list?.classrooms_list_pagination;
  const apiChartData = pnl?.monthly_profit_by_classroom_chart ?? [];

  // Local classroom IDs used as a reference set to filter the API chart data
  const localClassroomIds = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

  // Filter API chart entries to only those matching the local classroom IDs,
  // then normalise the shape to { name, profit } that ProfitChart expects.
  const profitChartData = apiChartData
    .filter((item) => localClassroomIds.has(item.classroom_id))
    .map((item) => ({
      id: item.classroom_id,
      name: item.classroom_name,
      profit: item.profit,
      marginPercentage: item.margin_percentage,
      enrolledStudents: item.enrolled_students,
    }));

  const handleFilterChange = (f) => {
    setActiveFilter(f);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormChange = (key, value) => {
    setClassroomForm((prev) => ({ ...prev, [key]: value }));
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setClassroomForm(EMPTY_CLASSROOM_FORM);
  };

  // TODO: wire onSave to a create-classroom API call when the backend endpoint is available.
  const handleSaveClassroom = () => {
    closeAddModal();
  };

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      <ClassroomsHeader isLoading={isLoading} metrics={metrics} onAddClick={() => setIsAddModalOpen(true)} />

      <ClassroomKpis isLoading={isLoading} metrics={metrics} />

      {/* P&L + Profit Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <PnLChartSkeleton />
        ) : (
          <>
            <PnLSummaryCard
              totalRevenue={pnlSummary?.monthly_tuition_revenue ?? 0}
              totalCost={pnlSummary?.monthly_operating_costs ?? 0}
              totalProfit={pnlSummary?.net_monthly_profit ?? 0}
              overallMargin={pnlSummary?.gross_margin_percentage ?? 0}
            />
            <ProfitChart data={profitChartData} />
          </>
        )}
      </div>

      {/* Tier Filter */}
      {!isLoading && (
        <TierFilter
          activeFilter={activeFilter}
          filters={filters}
          onFilterChange={handleFilterChange}
          count={pagination?.total ?? classroomsList.length}
        />
      )}

      {/* Classroom Cards — use isFetching so only cards reload on page change */}
      <div className="space-y-3">
        {isFetching ? (
          Array.from({ length: PER_PAGE }).map((_, i) => <ClassroomCardSkeleton key={i} />)
        ) : classroomsList.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No classrooms match this filter.</p>
          </div>
        ) : (
          classroomsList.map((classroom) => (
            <ClassroomDetailCard key={classroom.id} classroom={classroom} />
          ))
        )}
      </div>

      {/* Pagination — always show when data exists, disable buttons while fetching */}
      <Pagination
        currentPage={currentPage}
        lastPage={pagination?.last_page}
        from={pagination?.from}
        to={pagination?.to}
        total={pagination?.total}
        isFetching={isFetching}
        onPageChange={handlePageChange}
      />

      {/* Add Classroom Modal */}
      <AddClassroomModal
        isOpen={isAddModalOpen}
        form={classroomForm}
        onFormChange={handleFormChange}
        onSave={handleSaveClassroom}
        onClose={closeAddModal}
      />
    </motion.div>
  );
};

export default ClassroomsPage;
