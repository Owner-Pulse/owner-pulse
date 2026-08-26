import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Loader2,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetClassroom, useGetSingleClassroom } from "@/hooks/classroom/classroom.hook";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const COLORS = ["#1E3A5F", "#10B981", "#F59E0B"];

const OwnerClassroomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("financials");
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch single classroom detail from /procare/dashboard/classroom-economics/{id}
  const { data: singleData, isLoading: isSingleLoading } = useGetSingleClassroom(id);

  // 2. Fetch list data as fallback context
  const { data: listData, isLoading: isListLoading } = useGetClassroom({ per_page: 100 });
  const classroomsList = listData?.classroom_pnl?.classrooms_list?.data ?? [];

  // Match classroom from list if needed
  const matchedClassroom = classroomsList.find(c => c.id === Number(id) || c.procare_classroom_id === Number(id)) || {};

  // Consolidated economics data (prefer single endpoint data, fallback to list item)
  const singleEconomics = singleData || matchedClassroom?.classroom_economics || {};
  const classroomName = singleEconomics.classroom_name || matchedClassroom.name || matchedClassroom.classroom_name || `Classroom #${id}`;
  const teacherName = singleEconomics.teacher_name || matchedClassroom.teacher || "";

  // Financial Cards
  const netProfitObj = singleEconomics.net_monthly_profit;
  const netMonthlyProfit = netProfitObj?.amount ?? matchedClassroom.net_monthly_profit ?? 0;
  const profitFormatted = netProfitObj?.formatted_amount || matchedClassroom.formatted_net_monthly_profit || `$${Math.round(netMonthlyProfit).toLocaleString()}`;
  const profitChangeText = netProfitObj?.change_percentage || (matchedClassroom.profit_change ? `+${matchedClassroom.profit_change}` : "+0%");
  const isProfit = netProfitObj?.is_profit ?? (netMonthlyProfit >= 0);

  const grossRevObj = singleEconomics.gross_revenue;
  const grossRevenue = grossRevObj?.amount ?? matchedClassroom.revenue?.total ?? 0;
  const grossRevenueFormatted = grossRevObj?.formatted_amount || matchedClassroom.revenue?.formatted_total || `$${Math.round(grossRevenue).toLocaleString()}`;
  const seatsBilledText = grossRevObj?.formatted_seats_billed || `${matchedClassroom.enrollment?.current ?? 0} Seats billed`;

  const opCostObj = singleEconomics.operating_costs;
  const operatingCosts = opCostObj?.amount ?? matchedClassroom.cost?.total ?? 0;
  const operatingCostsFormatted = opCostObj?.formatted_amount || matchedClassroom.cost?.formatted_total || `$${Math.round(operatingCosts).toLocaleString()}`;
  const costPerSeatFormatted = opCostObj?.formatted_cost_per_seat || matchedClassroom.cost?.formatted_per_seat || `$${Math.round(matchedClassroom.cost?.per_seat ?? 0)}/seat`;

  const marginObj = singleEconomics.gross_margin;
  const grossMarginPct = marginObj?.percentage ?? matchedClassroom.margin?.percentage ?? 0;
  const grossMarginStatus = marginObj?.status ?? matchedClassroom.margin?.status ?? "Healthy";

  // Seat yields
  const seatYields = singleEconomics.classroom_seat_yields || matchedClassroom.classroom_economics?.classroom_seat_yields;
  const revPerSeatFormatted = seatYields?.revenue_per_seat?.formatted_amount || matchedClassroom.revenue?.formatted_per_seat || `$${Math.round(matchedClassroom.revenue?.per_seat ?? 0)}/mo`;
  const costPerSeatYieldFormatted = seatYields?.cost_per_seat?.formatted_amount || matchedClassroom.cost?.formatted_per_seat || `$${Math.round(matchedClassroom.cost?.per_seat ?? 0)}/mo`;
  const netMarginPerSeatFormatted = seatYields?.net_margin_per_seat?.formatted_amount || `$${Math.round((matchedClassroom.revenue?.per_seat ?? 0) - (matchedClassroom.cost?.per_seat ?? 0))}/mo`;

  // Revenue mix breakdown
  const revenueBreakdown = singleEconomics.revenue_mix_by_program?.breakdown || matchedClassroom.classroom_economics?.revenue_mix_by_program?.breakdown;
  const pieData = revenueBreakdown
    ? [
        { name: revenueBreakdown.private_pay?.label || "Private Pay", value: Math.round(revenueBreakdown.private_pay?.amount || 0) },
        { name: revenueBreakdown.elc_subsidized?.label || "ELC Subsidized", value: Math.round(revenueBreakdown.elc_subsidized?.amount || 0) },
        { name: revenueBreakdown.vpk_vouchers?.label || "VPK Vouchers", value: Math.round(revenueBreakdown.vpk_vouchers?.amount || 0) }
      ]
    : [
        { name: "Private Pay", value: Math.round(grossRevenue * 0.5) },
        { name: "ELC Subsidized", value: Math.round(grossRevenue * 0.3) },
        { name: "VPK Vouchers", value: Math.round(grossRevenue * 0.2) }
      ];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  };

  // Student Roster from API
  const financialPerformance = singleEconomics.financial_performance || matchedClassroom.classroom_economics?.financial_performance;
  const apiRoster = financialPerformance?.class_roster || [];
  const totalRosterCount = financialPerformance?.class_roster_count ?? apiRoster.length;

  const displayRoster = apiRoster.map((s) => {
    let ageStr = "—";
    if (s.date_of_birth) {
      const dobDate = new Date(s.date_of_birth);
      if (!isNaN(dobDate.getTime())) {
        const ageYears = Math.floor((new Date() - dobDate) / (365.25 * 24 * 60 * 60 * 1000));
        ageStr = `${ageYears}yo`;
      }
    }
    return {
      id: s.id || s.procare_child_id,
      childId: s.procare_child_id?.toString() || s.id?.toString(),
      personId: s.procare_child_id || s.id,
      name: s.full_name || s.name || "Student Profile",
      dob: s.date_of_birth || "N/A",
      age: ageStr,
      status: s.enrollment_status || "Enrolled",
      parent: s.parent || "—",
      contact: s.contact || "—",
      billingType: s.billingType || s.billing_type || "Private Pay"
    };
  });

  // Filter students by query
  const filteredRoster = displayRoster.filter(student => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      student.name.toLowerCase().includes(query) ||
      (student.childId && student.childId.toLowerCase().includes(query)) ||
      (student.id && student.id.toString().includes(query)) ||
      (student.status && student.status.toLowerCase().includes(query))
    );
  });

  const isLoading = isSingleLoading && isListLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F]" />
        <p className="text-sm font-medium text-gray-500">Loading classroom economics & student roster...</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-12"
    >
      {/* Header & Back Action */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/owner/classrooms")}
          className="hover:bg-slate-100 p-2 rounded-xl shrink-0"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </Button>
        <div>
          <span className="text-xs font-semibold text-[#1E3A5F] uppercase tracking-wider">Classroom Economics</span>
          <h2 className="text-2xl font-bold text-gray-900">{classroomName} {teacherName ? `(${teacherName})` : ""}</h2>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-gray-400 block font-semibold">Net Monthly Profit</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className={`text-xl font-extrabold ${isProfit ? "text-[#2F6042]" : "text-[#8A362C]"}`}>{profitFormatted}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${isProfit ? "bg-[#3E7A54]/10 text-[#2F6042]" : "bg-[#AE4A3E]/10 text-[#8A362C]"}`}>
                {isProfit ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {profitChangeText}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-gray-400 block font-semibold">Gross Revenue</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-xl font-extrabold text-gray-900">{grossRevenueFormatted}</span>
              <span className="text-xs text-gray-450">{seatsBilledText}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-gray-400 block font-semibold">Operating Costs</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-xl font-extrabold text-[#8A362C]">{operatingCostsFormatted}</span>
              <span className="text-xs text-gray-450">{costPerSeatFormatted}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-gray-400 block font-semibold">Gross Margin</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-xl font-extrabold text-blue-600">{grossMarginPct}%</span>
              <span className="text-xs text-gray-500 font-semibold">{grossMarginStatus}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("financials")}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative ${
            activeTab === "financials" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Financial Performance
        </button>
        <button
          onClick={() => setActiveTab("roster")}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative ${
            activeTab === "roster" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Class Roster ({totalRosterCount})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {activeTab === "financials" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Funding breakdown pie chart */}
            <Card className="bg-white border-none shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">{singleEconomics?.revenue_mix_by_program?.title || "Revenue Mix by Program Category"}</CardTitle>
                <CardDescription>{singleEconomics?.revenue_mix_by_program?.subtitle || "Private collections vs Early Learning Coalition voucher shares"}</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex flex-col md:flex-row items-center justify-around">
                <div className="w-full h-full max-w-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4 max-w-xs w-full">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                        <span className="text-xs font-semibold text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Seat Margin */}
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm">{seatYields?.title || "Classroom Seat Yields"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Revenue Per Seat</span>
                  <span className="text-lg font-bold text-gray-800">{revPerSeatFormatted}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Cost Per Seat</span>
                  <span className="text-lg font-bold text-gray-800">{costPerSeatYieldFormatted}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-600 block font-semibold uppercase">Net Margin Per Seat</span>
                  <span className="text-lg font-bold text-emerald-700">{netMarginPerSeatFormatted}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "roster" && (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-50">
              <div>
                <CardTitle className="text-sm">Student Demographics & Profiles ({totalRosterCount})</CardTitle>
                <CardDescription>View all registered children in this classroom</CardDescription>
              </div>

              {/* Roster Search Bar */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, Child ID, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isSingleLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1E3A5F]" />
                  <p className="text-xs font-medium">Fetching class roster students...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Student Name</th>
                        <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Procare Child ID</th>
                        <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">DOB / Age</th>
                        <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredRoster.length > 0 ? (
                        filteredRoster.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-2">
                              <span className="font-semibold text-gray-900 block">
                                {student.name}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center text-gray-600 font-mono text-xs">
                              {student.childId || student.id}
                            </td>
                            <td className="py-3 px-2 text-center text-gray-500 font-medium">
                              {student.dob !== "N/A" ? student.dob : "N/A"} {student.age !== "—" ? `(${student.age})` : ""}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                student.status === "Enrolled" || student.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-amber-50 text-amber-700 border border-amber-100"
                              }`}>
                                {student.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-xs text-gray-400">
                            {apiRoster.length === 0 ? "No students currently assigned to this classroom roster." : `No student matching "${searchQuery}" was found.`}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default OwnerClassroomDetailPage;
