import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  ClipboardList, 
  GraduationCap, 
  TrendingUp, 
  AlertCircle,
  Building2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Award,
  PiggyBank,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Receipt,
  FileText
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// --- Enhanced Data Models ---
const revenueData = [
  { name: 'Jan', revenue: 145000, expenses: 95000, tuition: 125000, scholarships: 20000 },
  { name: 'Feb', revenue: 152000, expenses: 98000, tuition: 130000, scholarships: 22000 },
  { name: 'Mar', revenue: 158000, expenses: 94000, tuition: 135000, scholarships: 23000 },
  { name: 'Apr', revenue: 165000, expenses: 102000, tuition: 140000, scholarships: 25000 },
  { name: 'May', revenue: 172000, expenses: 99000, tuition: 145000, scholarships: 27000 },
  { name: 'Jun', revenue: 184200, expenses: 105000, tuition: 155000, scholarships: 29200 },
];

const enrollmentData = [
  { name: 'PreK3', students: 34, capacity: 40, waitlist: 12 },
  { name: 'PreK4', students: 42, capacity: 45, waitlist: 8 },
  { name: 'Kinder', students: 38, capacity: 40, waitlist: 15 },
  { name: '1st Grade', students: 35, capacity: 35, waitlist: 5 },
  { name: '2nd Grade', students: 30, capacity: 35, waitlist: 7 },
];

// Compliance data
const complianceItems = [
  { id: 1, name: 'Fire Inspection', status: 'compliant', expires: '2026-11-04', daysLeft: 162, authority: 'County Fire' },
  { id: 2, name: 'Health Dept. Inspection', status: 'compliant', expires: '2026-08-22', daysLeft: 88, authority: 'FL DOH' },
  { id: 3, name: 'Background Checks', status: 'expiring', expires: '2026-06-15', daysLeft: 20, authority: 'FL DCF' },
  { id: 4, name: 'CPR / First Aid', status: 'expired', expires: '2026-04-12', daysLeft: -29, authority: 'Red Cross' },
  { id: 5, name: 'General Liability', status: 'expiring', expires: '2026-07-01', daysLeft: 36, authority: 'Travelers' },
  { id: 6, name: 'VPK Provider Cert.', status: 'compliant', expires: '2027-01-30', daysLeft: 249, authority: 'ELC' },
];

// Scholarship data
const scholarshipData = [
  { program: 'FES-EO', students: 38, awarded: 342000, pending: 12 },
  { program: 'FES-UA', students: 14, awarded: 168000, pending: 4 },
  { program: 'FTC', students: 22, awarded: 198000, pending: 8 },
  { program: 'VPK', students: 27, awarded: 67500, pending: 3 },
];

// Step Up approvals (critical for cash flow)
const stepUpApprovals = [
  { parent: 'R. Garcia', student: 'M. Garcia', amount: 2850, daysPending: 18, status: 'pending' },
  { parent: 'L. Singh', student: 'A. Singh', amount: 2850, daysPending: 12, status: 'pending' },
  { parent: 'D. Kim', student: 'J. Kim', amount: 3100, daysPending: 22, status: 'redflag' },
  { parent: 'M. Owens', student: 'T. Owens', amount: 2900, daysPending: 8, status: 'pending' },
];

// Budget tracking
const budgetData = {
  total: 1850000,
  spent: 1240000,
  categories: [
    { name: 'Payroll & Benefits', spent: 920000, budget: 1200000, percent: 77 },
    { name: 'Facilities & Rent', spent: 142000, budget: 180000, percent: 79 },
    { name: 'Curriculum & Books', spent: 58000, budget: 75000, percent: 77 },
    { name: 'Insurance', spent: 38000, budget: 45000, percent: 84 },
    { name: 'Director Discretionary', spent: 7200, budget: 9000, percent: 80 },
  ]
};

// At-risk students
const atRiskStudents = [
  { name: 'J. Martinez', grade: '5th', reason: 'financial', daysActive: 7, status: 'intervening' },
  { name: 'A. Choi', grade: '7th', reason: 'transferring', daysActive: 5, status: 'intervening' },
  { name: 'M. Webb', grade: '8th', reason: 'moving', daysActive: 23, status: 'lost' },
];

// Procare integration data (childcare management)
const procareData = {
  dailyCheckIns: 42,
  dailyCheckOuts: 38,
  absentToday: 4,
  illnesses: 2,
  medicationGiven: 1,
  incidents: 0,
  parentMessages: 8,
};

// QuickBooks sync status
const quickbooksStatus = {
  lastSync: '2026-05-11 02:34 AM',
  pendingTransactions: 3,
  reconciled: true,
  bankBalance: 487200,
};

const OverviewPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const complianceStats = {
    compliant: complianceItems.filter(c => c.status === 'compliant').length,
    expiring: complianceItems.filter(c => c.status === 'expiring').length,
    expired: complianceItems.filter(c => c.status === 'expired').length,
  };

  const totalScholarshipValue = scholarshipData.reduce((sum, s) => sum + s.awarded, 0);
  const totalScholarshipStudents = scholarshipData.reduce((sum, s) => sum + s.students, 0);
  const stepUpRedFlags = stepUpApprovals.filter(s => s.daysPending >= 20).length;
  const budgetPercent = Math.round((budgetData.spent / budgetData.total) * 100);

  return (
    <motion.div 
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header with Procare & QuickBooks integration badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-gray-500">Integrated with:</span>
            <div className="flex items-center gap-2">
              <img src="/procare-logo.png" alt="Procare" className="h-5" />
              <span className="text-xs font-medium text-gray-600">Procare</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/quickbooks-logo.png" alt="QuickBooks" className="h-5" />
              <span className="text-xs font-medium text-gray-600">QuickBooks</span>
            </div>
            {quickbooksStatus.reconciled && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                <CheckCircle2 size={12} /> Synced {quickbooksStatus.lastSync}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white">
            <FileText size={16} className="mr-2" /> Export to QuickBooks
          </Button>
          <Button className="bg-[#0A0F1E] hover:bg-black text-white">
            <Receipt size={16} className="mr-2" /> Run Payroll
          </Button>
        </div>
      </div>

      {/* KPI Metrics - Expanded to 6 cards for critical owner info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Enrollment</p>
                  <p className="text-2xl font-bold text-gray-900">245</p>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Users size={18} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="flex items-center text-emerald-600 font-medium">
                  <ArrowUpRight size={12} className="mr-1" />+12%
                </span>
                <span className="text-gray-400 ml-2">vs last yr</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Revenue (MTD)</p>
                  <p className="text-2xl font-bold text-gray-900">$184.2k</p>
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="flex items-center text-emerald-600 font-medium">
                  <ArrowUpRight size={12} className="mr-1" />+8.4%
                </span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Budget Used</p>
                  <p className="text-2xl font-bold text-gray-900">{budgetPercent}%</p>
                </div>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <PiggyBank size={18} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-500">{budgetData.spent.toLocaleString()} / {budgetData.total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Compliance</p>
                  <p className="text-2xl font-bold text-red-600">{complianceStats.expiring + complianceStats.expired}</p>
                </div>
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-red-600 font-medium">{complianceStats.expired} expired</span>
                <span className="text-gray-400 ml-2">· {complianceStats.expiring} expiring</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Scholarships</p>
                  <p className="text-2xl font-bold text-gray-900">${(totalScholarshipValue / 1000).toFixed(0)}k</p>
                </div>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Award size={18} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-500">{totalScholarshipStudents} students</span>
                {stepUpRedFlags > 0 && (
                  <span className="ml-2 text-red-600 font-medium">{stepUpRedFlags} stuck approvals</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-[#0A0F1E] border-none shadow-lg text-white">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-white/70">Procare Check-ins</p>
                  <p className="text-2xl font-bold text-white">{procareData.dailyCheckIns}</p>
                </div>
                <div className="p-2 bg-white/10 text-white rounded-lg">
                  <Users size={18} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-white/50">{procareData.absentToday} absent</span>
                {procareData.illnesses > 0 && (
                  <span className="ml-2 text-amber-400">{procareData.illnesses} illnesses</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Financial Performance - Enhanced with scholarship breakdown */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Financial Performance</CardTitle>
                  <CardDescription>Revenue vs Expenses with Scholarship impact</CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                    <span className="text-gray-600">Tuition</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span className="text-gray-600">Scholarships</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <span className="text-gray-600">Expenses</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTuition" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Area type="monotone" dataKey="tuition" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTuition)" />
                    <Area type="monotone" dataKey="scholarships" stroke="#10B981" strokeWidth={2.5} fillOpacity={0} strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="expenses" stroke="#F87171" strokeWidth={2.5} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* QuickBooks Integration Panel */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>QuickBooks Sync</span>
                <img src="/quickbooks-logo.png" alt="QuickBooks" className="h-6" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Bank Balance</span>
                <span className="text-xl font-bold text-gray-900">${quickbooksStatus.bankBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Pending Transactions</span>
                <span className="text-amber-600 font-medium">{quickbooksStatus.pendingTransactions} to review</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Last Sync</span>
                <span className="text-xs text-gray-400">{quickbooksStatus.lastSync}</span>
              </div>
              <Button variant="outline" className="w-full mt-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                Sync with QuickBooks
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Second Row - Compliance, Scholarships, Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Compliance Overview */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-red-500" />
                Compliance & Insurance
              </CardTitle>
              <CardDescription>Expiring items need attention within 60 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complianceItems.filter(c => c.status !== 'compliant').slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.authority}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium ${item.status === 'expired' ? 'text-red-600' : 'text-amber-600'}`}>
                        {item.status === 'expired' ? 'Expired' : `${item.daysLeft} days left`}
                      </span>
                      {item.status === 'expiring' && item.name === 'General Liability' && (
                        <p className="text-[10px] text-amber-500 mt-0.5">Shop rates by May 2</p>
                      )}
                    </div>
                  </div>
                ))}
                {complianceStats.compliant > 0 && (
                  <div className="flex items-center gap-2 pt-2 text-xs text-green-600">
                    <CheckCircle2 size={14} />
                    <span>{complianceStats.compliant} items compliant</span>
                  </div>
                )}
                <Button variant="ghost" className="w-full mt-2 text-sm text-blue-600">
                  View all compliance →
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Scholarships & Step Up */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award size={18} className="text-purple-500" />
                Scholarships & Step Up
              </CardTitle>
              <CardDescription>${(totalScholarshipValue / 1000).toFixed(0)}K awarded YTD</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Step Up Red Flags */}
                {stepUpRedFlags > 0 && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} className="text-red-500" />
                      <span className="text-xs font-bold text-red-600 uppercase">Payment Approvals Stuck</span>
                    </div>
                    {stepUpApprovals.filter(s => s.daysPending >= 20).map((s, idx) => (
                      <div key={idx} className="flex justify-between text-xs mb-1">
                        <span>{s.parent} · {s.student}</span>
                        <span className="text-red-600 font-bold">{s.daysPending}d</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Scholarship breakdown */}
                {scholarshipData.map((s) => (
                  <div key={s.program} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.program}</p>
                      <p className="text-xs text-gray-500">{s.students} students</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">${(s.awarded / 1000).toFixed(0)}K</p>
                      {s.pending > 0 && (
                        <p className="text-xs text-amber-600">{s.pending} pending</p>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full mt-2 text-sm text-blue-600">
                  Manage scholarships →
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Consumption */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank size={18} className="text-amber-500" />
                Budget Consumption
              </CardTitle>
              <CardDescription>{budgetPercent}% used · ${(budgetData.total - budgetData.spent).toLocaleString()} remaining</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${budgetPercent}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                {budgetData.categories.slice(0, 3).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cat.percent}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{cat.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-sm text-blue-600">
                View budget details →
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Third Row - Enrollment Capacity & At-Risk Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Capacity with Waitlist */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle>Enrollment Capacity</CardTitle>
              <CardDescription>Current students vs capacity with waitlist demand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 11 }} width={70} />
                    <Tooltip 
                      cursor={{fill: '#F3F4F6'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="capacity" fill="#E5E7EB" radius={[0, 4, 4, 0]} barSize={16} name="Capacity" />
                    <Bar dataKey="students" radius={[0, 4, 4, 0]} barSize={16} name="Enrolled">
                      {enrollmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.students >= entry.capacity ? '#F59E0B' : '#0F172A'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around mt-4 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">245</p>
                  <p className="text-xs text-gray-500">Total Enrolled</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{enrollmentData.reduce((sum, e) => sum + e.waitlist, 0)}</p>
                  <p className="text-xs text-gray-500">On Waitlist</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">47</p>
                  <p className="text-xs text-gray-500">Open Seats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* At-Risk Students & Procare Activity */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>At-Risk Students</span>
                <span className="text-xs text-red-500 font-normal">+{atRiskStudents.length} flagged</span>
              </CardTitle>
              <CardDescription>Families signaling they may leave</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {atRiskStudents.map((student) => (
                  <div key={student.name} className="flex items-center justify-between p-2 rounded-lg bg-red-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{student.name} · {student.grade}</p>
                      <p className="text-xs text-gray-600">{student.reason}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium ${student.daysActive > 14 ? 'text-red-600' : 'text-amber-600'}`}>
                        {student.daysActive}d
                      </span>
                      {student.daysActive > 14 && (
                        <p className="text-[10px] text-red-500">stale case</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Procare Daily Activity Summary */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <img src="/procare-logo.png" alt="Procare" className="h-4" />
                    <span className="text-xs font-medium text-gray-500">Today's Activity</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{procareData.parentMessages}</p>
                      <p className="text-[10px] text-gray-400">Messages</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{procareData.medicationGiven}</p>
                      <p className="text-[10px] text-gray-400">Medications</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-600">{procareData.illnesses}</p>
                      <p className="text-[10px] text-gray-400">Illnesses</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{procareData.incidents}</p>
                      <p className="text-[10px] text-gray-400">Incidents</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="ghost" className="w-full mt-2 text-sm text-blue-600">
                  View enrollment dashboard →
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Events & Tasks - Enhanced */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-500" />
              Upcoming Events & Critical Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">This Week</p>
                <div className="p-2 rounded-lg bg-amber-50">
                  <p className="text-sm font-medium">General Liability Insurance</p>
                  <p className="text-xs text-amber-600">Shop rates by May 2 (60 days before renewal)</p>
                </div>
                <div className="p-2 rounded-lg bg-red-50">
                  <p className="text-sm font-medium">CPR Certification Expired</p>
                  <p className="text-xs text-red-600">Renew by May 20 · 4 staff affected</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Next Week</p>
                <div className="p-2 rounded-lg bg-blue-50">
                  <p className="text-sm font-medium">Step Up Q4 Attestation</p>
                  <p className="text-xs text-blue-600">Due May 28 · Director needs signature</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium">HVAC Replacement Decision</p>
                  <p className="text-xs text-gray-600">3 quotes · PO needed for $8,200</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payroll</p>
                <div className="p-2 rounded-lg bg-[#0A0F1E] text-white">
                  <p className="text-sm font-medium">Next Payroll: May 15</p>
                  <p className="text-xs text-white/70">7 days away · Director has not submitted yet</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50">
                  <p className="text-sm font-medium">End of Year Ceremony</p>
                  <p className="text-xs text-emerald-600">June 5 · 100+ attendees expected</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  );
};

export default OverviewPage;