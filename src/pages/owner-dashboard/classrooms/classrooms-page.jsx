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
import {
  useGetClassroom,
  useAddClassroom,
  useUpdateClassroom,
  useDeleteClassroom,
} from "@/hooks/classroom/classroom.hook";
import toast from "react-hot-toast";

// ─── Motion Variants ──────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

// ─── Page ─────────────────────────────────────────────────────────
const EMPTY_CLASSROOM_FORM = {
  name: "",
  program: "",
  tier: "Tier 1",
  capacity: "",
  teacherId: "",
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

  // Local state for classrooms fallback
  const [localClassrooms, setLocalClassrooms] = useState([]);

  // Confirmation Modal state for deletion
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const PER_PAGE = 50;

  const { data, isLoading, isFetching } = useGetClassroom({
    filter: activeFilter,
    per_page: PER_PAGE,
    page: currentPage,
  });

  const { addClassroom, isPending: isAdding } = useAddClassroom();
  const { updateClassroom, isPending: isUpdating } = useUpdateClassroom();
  const { deleteClassroom, isPending: isDeleting } = useDeleteClassroom();

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

  // Normalize apiChartData shape to { name, profit } that ProfitChart expects.
  const profitChartData = apiChartData.map((item) => ({
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
      name: classroom.name || classroom.classroom_name || "",
      program: classroom.program || classroom.category_group || "",
      tier: classroom.tier || (classroom.category_group === "Preschool" ? "Tier 1" : "Tier 2"),
      capacity: classroom.enrollment?.capacity || classroom.capacity || "",
      teacherId: classroom.teacher_id || "",
      tuitionPerSeat: classroom.revenue?.per_seat || classroom.tuition_per_seat || "",
      monthlyCost: classroom.cost?.total || classroom.monthly_operating_cost || "",
      procareClassroomId: classroom.procare_classroom_id || classroom.id || "",
    });
    setIsAddModalOpen(true);
  };

  const triggerDeleteClassroom = (id) => {
    setPendingDeleteId(id);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteClassroom = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteClassroom(pendingDeleteId);
      toast.success("Classroom deleted!");
      setIsConfirmDeleteOpen(false);
      setPendingDeleteId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete classroom");
    }
  };

  const handleSaveClassroom = async () => {
    const payload = {
      classroom_name: classroomForm.name,
      procare_classroom_id: Number(classroomForm.procareClassroomId),
      program: classroomForm.program || "Preschool",
      tier: classroomForm.tier || "Tier 1",
      capacity: Number(classroomForm.capacity),
      teacher_id: classroomForm.teacherId ? Number(classroomForm.teacherId) : null,
      tuition_per_seat: Number(classroomForm.tuitionPerSeat),
      monthly_operating_cost: Number(classroomForm.monthlyCost),
    };

    try {
      if (editingClassroom) {
        await updateClassroom({ data: payload, id: editingClassroom.id });
        toast.success("Classroom updated!");
      } else {
        await addClassroom(payload);
        toast.success("Classroom created!");
      }
      closeAddModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save classroom");
    }
  };


  const displayedClassrooms = classroomsList.length > 0 ? classroomsList : localClassrooms;

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      <ClassroomsHeader 
        isLoading={isLoading} 
        metrics={metrics} 
        summaryHeading={pnl?.summary_heading} 
        onAddClick={() => setIsAddModalOpen(true)} 
      />

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
              formattedRevenue={pnlSummary?.formatted_monthly_tuition_revenue}
              formattedCost={pnlSummary?.formatted_monthly_operating_costs}
              formattedMargin={pnlSummary?.formatted_gross_margin}
              formattedProfit={pnlSummary?.formatted_net_monthly_profit}
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
          count={pagination?.total ?? displayedClassrooms.length}
        />
      )}

      {/* Classroom Cards */}
      <div className="space-y-3">
        {isFetching ? (
          Array.from({ length: PER_PAGE }).map((_, i) => <ClassroomCardSkeleton key={i} />)
        ) : displayedClassrooms.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No classrooms match this filter.</p>
          </div>
        ) : (
          displayedClassrooms.map((classroom) => (
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
        isLoading={isAdding || isUpdating}
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
        isLoading={isDeleting}
      />
    </motion.div>
  );
};

export default ClassroomsPage;
