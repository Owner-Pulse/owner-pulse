import React, { useState, useEffect } from "react";
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
import ConfirmationModal from "@/components/ui/ConfirmationModal";
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
  procareClassroomId: "",
};

const ClassroomsPage = () => {
  const [activeFilter, setActiveFilter] = useState("All Classrooms");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [classroomForm, setClassroomForm] = useState(EMPTY_CLASSROOM_FORM);
  const [editingClassroom, setEditingClassroom] = useState(null);

  // Local state for classrooms so edit/delete changes update instantly in the UI
  const [localClassrooms, setLocalClassrooms] = useState([]);
  
  // Confirmation Modal state for deletion
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

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

  // Sync query data into local state
  useEffect(() => {
    if (classroomsList && classroomsList.length > 0) {
      setLocalClassrooms(classroomsList);
    }
  }, [classroomsList]);

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
    setEditingClassroom(null);
    setClassroomForm(EMPTY_CLASSROOM_FORM);
  };

  const handleEditClassroom = (classroom) => {
    setEditingClassroom(classroom);
    setClassroomForm({
      name: classroom.name || "",
      program: classroom.program || classroom.category_group || "",
      tier: (classroom.category_group || "").toLowerCase() === "preschool" ? "preschool" : "k8",
      capacity: classroom.enrollment?.capacity || "",
      teacher: classroom.teacher || "",
      tuitionPerSeat: classroom.revenue?.per_seat || "",
      monthlyCost: classroom.cost?.total || "",
      procareClassroomId: classroom.procare_classroom_id || classroom.id || "",
    });
    setIsAddModalOpen(true);
  };

  const triggerDeleteClassroom = (id) => {
    setPendingDeleteId(id);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteClassroom = () => {
    setLocalClassrooms((prev) => prev.filter((c) => c.id !== pendingDeleteId));
    setIsConfirmDeleteOpen(false);
    setPendingDeleteId(null);
  };

  const handleSaveClassroom = () => {
    if (editingClassroom) {
      setLocalClassrooms((prev) =>
        prev.map((c) =>
          c.id === editingClassroom.id
            ? {
                ...c,
                name: classroomForm.name,
                category_group: classroomForm.tier === "preschool" ? "Preschool" : "K-8",
                teacher: classroomForm.teacher,
                enrollment: {
                  ...c.enrollment,
                  capacity: Number(classroomForm.capacity) || c.enrollment?.capacity || 20,
                },
                revenue: {
                  ...c.revenue,
                  per_seat: Number(classroomForm.tuitionPerSeat) || c.revenue?.per_seat || 950,
                  total: (Number(classroomForm.tuitionPerSeat) || 950) * (c.enrollment?.current || 10),
                },
                cost: {
                  ...c.cost,
                  total: Number(classroomForm.monthlyCost) || c.cost?.total || 8000,
                  per_seat: (Number(classroomForm.monthlyCost) || 8000) / (c.enrollment?.capacity || 20),
                },
                procare_classroom_id: classroomForm.procareClassroomId,
              }
            : c
        )
      );
    } else {
      const newClassroom = {
        id: Math.floor(Math.random() * 1000) + 100,
        procare_classroom_id: classroomForm.procareClassroomId,
        name: classroomForm.name,
        category_group: classroomForm.tier === "preschool" ? "Preschool" : "K-8",
        teacher: classroomForm.teacher,
        net_monthly_profit: (Number(classroomForm.tuitionPerSeat) || 950) * 10 - (Number(classroomForm.monthlyCost) || 8000),
        profit_change: 0,
        enrollment: {
          current: 0,
          capacity: Number(classroomForm.capacity) || 20,
          fill_rate_percentage: 0,
          empty_seats: Number(classroomForm.capacity) || 20,
          is_low_enrollment: true,
          change: 0,
        },
        revenue: {
          total: 0,
          per_seat: Number(classroomForm.tuitionPerSeat) || 950,
        },
        cost: {
          total: Number(classroomForm.monthlyCost) || 8000,
          per_seat: (Number(classroomForm.monthlyCost) || 8000) / (Number(classroomForm.capacity) || 20),
        },
        margin: {
          percentage: 0,
          status: "Critical",
        },
        nwea_map: {
          score: 0,
          benchmark: 200,
        },
        incidents: {
          count: 0,
        },
      };
      setLocalClassrooms((prev) => [newClassroom, ...prev]);
    }
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
          count={pagination?.total ?? localClassrooms.length}
        />
      )}

      {/* Classroom Cards */}
      <div className="space-y-3">
        {isFetching ? (
          Array.from({ length: PER_PAGE }).map((_, i) => <ClassroomCardSkeleton key={i} />)
        ) : localClassrooms.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No classrooms match this filter.</p>
          </div>
        ) : (
          localClassrooms.map((classroom) => (
            <ClassroomDetailCard 
              key={classroom.id} 
              classroom={classroom} 
              onEdit={handleEditClassroom}
              onDelete={triggerDeleteClassroom}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        lastPage={pagination?.last_page}
        from={pagination?.from}
        to={pagination?.to}
        total={pagination?.total}
        isFetching={isFetching}
        onPageChange={handlePageChange}
      />

      {/* Add / Edit Classroom Modal */}
      <AddClassroomModal
        isOpen={isAddModalOpen}
        form={classroomForm}
        onFormChange={handleFormChange}
        onSave={handleSaveClassroom}
        onClose={closeAddModal}
        isEdit={!!editingClassroom}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={confirmDeleteClassroom}
        title="Delete Classroom"
        message="Are you sure you want to delete this classroom? This will purge all financial records, capacity stats, and allocations for this classroom immediately."
        confirmText="Delete Classroom"
        cancelText="Keep Classroom"
        type="danger"
      />
    </motion.div>
  );
};

export default ClassroomsPage;
