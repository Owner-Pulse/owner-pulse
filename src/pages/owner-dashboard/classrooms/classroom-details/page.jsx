import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  FileText,
  AlertTriangle,
  UserCheck,
  Search,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetClassroom } from "@/hooks/classroom/classroom.hook";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const MOCK_ROSTERS = {
  default: [
    { id: 101, childId: "2941", personId: "19280", name: "Zain Abdelhade", dob: "2021-06-27", age: "5yo", gender: "Male", status: "Active", parent: "Zed Abdelhade", contact: "(813) 555-0199", billingType: "Private Pay" },
    { id: 102, childId: "2942", personId: "19281", name: "Ny Troutma", dob: "2022-03-10", age: "4yo", gender: "Female", status: "Active", parent: "Brit Davis", contact: "(813) 555-0144", billingType: "ELC Subsidized" },
    { id: 103, childId: "2943", personId: "19281", name: "Zy Troutma", dob: "2022-03-10", age: "4yo", gender: "Female", status: "Active", parent: "Brit Davis", contact: "(813) 555-0144", billingType: "ELC Subsidized" },
    { id: 104, childId: "2944", personId: "19282", name: "Sarah Connor", dob: "2021-09-12", age: "5yo", gender: "Female", status: "Active", parent: "John Connor", contact: "(813) 555-0210", billingType: "VPK Vouchers" },
    { id: 105, childId: "2945", personId: "19283", name: "Caleb Antoine", dob: "2022-03-23", age: "4yo", gender: "Male", status: "Active", parent: "Cal Antoine", contact: "(813) 555-0182", billingType: "Private Pay" },
    { id: 106, childId: "2946", personId: "19284", name: "Liam Miller", dob: "2021-11-05", age: "5yo", gender: "Male", status: "Active", parent: "Mollie Miller", contact: "(813) 555-0105", billingType: "VPK Vouchers" },
    { id: 107, childId: "2947", personId: "19285", name: "Chloe Lee", dob: "2022-01-14", age: "4yo", gender: "Female", status: "Active", parent: "Seon Lee", contact: "(813) 555-0311", billingType: "Private Pay" }
  ]
};

const COLORS = ["#1E3A5F", "#10B981", "#F59E0B"];

const OwnerClassroomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("financials");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch classrooms list to find matching detail row
  const { data, isLoading } = useGetClassroom({ per_page: 100 });
  const classroomsList = data?.classroom_pnl?.classrooms_list?.data ?? [];

  // Match classroom by id or procare_classroom_id
  const classroom = classroomsList.find(c => c.id === Number(id) || c.procare_classroom_id === Number(id)) || {
    id: Number(id) || 9,
    name: "VPK B (Mrs.Johnson)",
    category_group: "Preschool",
    teacher: "Lead Teacher (Emp #1)",
    net_monthly_profit: 110200,
    profit_change: 5510,
    enrollment: {
      current: 124,
      capacity: 125,
      fill_rate_percentage: 99,
      empty_seats: 1,
      is_low_enrollment: false,
      change: 104
    },
    revenue: {
      total: 117800,
      per_seat: 950
    },
    cost: {
      total: 7600,
      per_seat: 61.29
    },
    margin: {
      percentage: 94,
      status: "Healthy"
    },
    nwea_map: {
      score: 196,
      benchmark: 201
    },
    incidents: {
      count: 0
    }
  };

  const economics = classroom?.classroom_economics;
  const financialPerformance = economics?.financial_performance;
  const apiRoster = financialPerformance?.class_roster || [];

  // Extract financial card values from classroom_economics or top level classroom object
  const netMonthlyProfit = economics?.net_monthly_profit?.amount ?? classroom.net_monthly_profit ?? 0;
  const profitFormatted = economics?.net_monthly_profit?.formatted_amount || `$${Math.round(netMonthlyProfit).toLocaleString()}`;
  const profitChangeText = economics?.net_monthly_profit?.change_percentage || "+5.2%";

  const grossRevenue = economics?.gross_revenue?.amount ?? classroom.revenue?.total ?? 0;
  const grossRevenueFormatted = economics?.gross_revenue?.formatted_amount || `$${Math.round(grossRevenue).toLocaleString()}`;
  const seatsBilledText = economics?.gross_revenue?.formatted_seats_billed || `${classroom.enrollment?.current ?? 0} Seats billed`;

  const operatingCosts = economics?.operating_costs?.amount ?? classroom.cost?.total ?? 0;
  const operatingCostsFormatted = economics?.operating_costs?.formatted_amount || `$${Math.round(operatingCosts).toLocaleString()}`;
  const costPerSeatFormatted = economics?.operating_costs?.formatted_cost_per_seat || `$${Math.round(classroom.cost?.per_seat ?? 0)}/seat`;

  const grossMarginPct = economics?.gross_margin?.percentage ?? classroom.margin?.percentage ?? 0;
  const grossMarginStatus = economics?.gross_margin?.status ?? classroom.margin?.status ?? "Healthy";

  // Seat yields
  const seatYields = economics?.classroom_seat_yields;
  const revPerSeatFormatted = seatYields?.revenue_per_seat?.formatted_amount || `$${Math.round(classroom.revenue?.per_seat ?? 950)}/mo`;
  const costPerSeatYieldFormatted = seatYields?.cost_per_seat?.formatted_amount || `$${Math.round(classroom.cost?.per_seat ?? 61)}/mo`;
  const netMarginPerSeatFormatted = seatYields?.net_margin_per_seat?.formatted_amount || `$${Math.round((classroom.revenue?.per_seat ?? 950) - (classroom.cost?.per_seat ?? 61))}/mo`;

  // Revenue mix by program category
  const revenueBreakdown = economics?.revenue_mix_by_program?.breakdown;
  const pieData = revenueBreakdown
    ? [
        { name: revenueBreakdown.private_pay?.label || "Private Pay", value: Math.round(revenueBreakdown.private_pay?.amount || 0) },
        { name: revenueBreakdown.elc_subsidized?.label || "ELC Subsidized", value: Math.round(revenueBreakdown.elc_subsidized?.amount || 0) },
        { name: revenueBreakdown.vpk_vouchers?.label || "VPK Vouchers", value: Math.round(revenueBreakdown.vpk_vouchers?.amount || 0) }
      ]
    : [
        { name: "Private Pay", value: Math.round(grossRevenue * 0.45) },
        { name: "ELC Subsidized", value: Math.round(grossRevenue * 0.35) },
        { name: "VPK Vouchers", value: Math.round(grossRevenue * 0.20) }
      ];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  };

  // Build full roster array from API or mock fallback
  const displayRoster = apiRoster.length > 0
    ? apiRoster.map((s) => {
        let ageStr = "—";
        if (s.date_of_birth) {
          const dobDate = new Date(s.date_of_birth);
          if (!isNaN(dobDate)) {
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
          gender: s.gender || "—",
          status: s.enrollment_status || "Enrolled",
          parent: s.parent || "—",
          contact: s.contact || "—",
          billingType: s.billingType || s.billing_type || "Private Pay"
        };
      })
    : MOCK_ROSTERS.default;

  const totalRosterCount = financialPerformance?.class_roster_count ?? classroom.enrollment?.current ?? displayRoster.length;

  // Filter students based on search query (name or childId)
  const filteredRoster = displayRoster.filter(student => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      student.name.toLowerCase().includes(query) ||
      (student.childId && student.childId.toLowerCase().includes(query)) ||
      (student.id && student.id.toString().includes(query))
    );
  });

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
          <span className="text-xs font-semibold text-blue-650 uppercase tracking-wider">Classroom Economics</span>
          <h2 className="text-2xl font-bold text-gray-900">{classroom.name} {classroom.teacher ? `(${classroom.teacher})` : ""}</h2>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-gray-400 block font-semibold">Net Monthly Profit</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-xl font-extrabold text-[#2F6042]">{profitFormatted}</span>
              <span className="text-[10px] font-bold bg-[#3E7A54]/10 text-[#2F6042] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingUp size={10} /> {profitChangeText}
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
                <CardTitle className="text-sm">{economics?.revenue_mix_by_program?.title || "Revenue Mix by Program Category"}</CardTitle>
                <CardDescription>{economics?.revenue_mix_by_program?.subtitle || "Private collections vs Early Learning Coalition voucher shares"}</CardDescription>
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

            {/* Sub-Pace / Seat Margin */}
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
                  placeholder="Search by name or Child ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <p className="text-xs font-medium">Loading classroom student roster...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Student Name</th>
                        <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">DOB / Age</th>
                        <th className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Primary Parent Contact</th>
                        <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Program Flag</th>
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
                              <span className="text-[10px] text-gray-400 block font-medium">
                                Child ID: {student.childId || student.id}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center text-gray-500 font-medium">
                              {student.dob !== "N/A" ? student.dob : ""} {student.age !== "—" ? `(${student.age})` : (student.dob === "N/A" ? "N/A" : "")}
                            </td>
                            <td className="py-3 px-2">
                              <span className="font-semibold text-gray-800 block">{student.parent}</span>
                              <span className="text-[10px] text-gray-400">{student.contact}</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                student.billingType.includes("ELC") 
                                  ? "bg-amber-100 text-amber-700" 
                                  : student.billingType.includes("VPK") 
                                    ? "bg-purple-100 text-purple-700" 
                                    : "bg-blue-100 text-blue-700"
                              }`}>
                                {student.billingType}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                student.status === "Active" || student.status === "Enrolled"
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
                          <td colSpan="5" className="py-8 text-center text-xs text-gray-400">
                            No student matching "{searchQuery}" was found.
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

