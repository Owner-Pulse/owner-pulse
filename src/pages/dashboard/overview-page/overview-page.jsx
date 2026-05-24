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
  ArrowDownRight
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
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// --- Dummy Data ---
const revenueData = [
  { name: 'Jan', revenue: 145000, expenses: 95000 },
  { name: 'Feb', revenue: 152000, expenses: 98000 },
  { name: 'Mar', revenue: 158000, expenses: 94000 },
  { name: 'Apr', revenue: 165000, expenses: 102000 },
  { name: 'May', revenue: 172000, expenses: 99000 },
  { name: 'Jun', revenue: 184200, expenses: 105000 },
];

const enrollmentData = [
  { name: 'PreK3', students: 34, capacity: 40 },
  { name: 'PreK4', students: 42, capacity: 45 },
  { name: 'Kinder', students: 38, capacity: 40 },
  { name: '1st Grade', students: 35, capacity: 35 },
  { name: '2nd Grade', students: 30, capacity: 35 },
];

const upcomingEvents = [
  { id: 1, title: 'Fire Drill Inspection', date: 'Today, 2:00 PM', type: 'compliance' },
  { id: 2, title: 'Staff Meeting', date: 'Tomorrow, 3:30 PM', type: 'internal' },
  { id: 3, title: 'Parent-Teacher Conferences', date: 'May 28th', type: 'event' },
];

const OverviewPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Here's what's happening at your school today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white">Download Report</Button>
          <Button className="bg-[#0A0F1E] hover:bg-black text-white">Generate Payroll</Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Total Enrollment</p>
                  <p className="text-3xl font-bold text-gray-900">245</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Users size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="flex items-center text-emerald-600 font-medium">
                  <ArrowUpRight size={16} className="mr-1" />
                  +12%
                </span>
                <span className="text-gray-400 ml-2">from last year</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">$184.2k</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <DollarSign size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="flex items-center text-emerald-600 font-medium">
                  <ArrowUpRight size={16} className="mr-1" />
                  +8.4%
                </span>
                <span className="text-gray-400 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Staff Attendance</p>
                  <p className="text-3xl font-bold text-gray-900">32<span className="text-lg text-gray-400 font-medium">/34</span></p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <GraduationCap size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="flex items-center text-amber-600 font-medium">
                  <AlertCircle size={16} className="mr-1" />
                  2 Subs needed
                </span>
                <span className="text-gray-400 ml-2">today</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-[#0A0F1E] border-none shadow-lg text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/70">Open Tasks</p>
                  <p className="text-3xl font-bold text-white">12</p>
                </div>
                <div className="p-3 bg-white/10 text-white rounded-xl">
                  <ClipboardList size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="flex items-center text-red-400 font-medium">
                  3 High Priority
                </span>
                <span className="text-white/50 ml-2">requires action</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Financial Performance</CardTitle>
                  <CardDescription>Revenue vs Expenses over the last 6 months</CardDescription>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <span className="text-gray-600">Expenses</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F87171" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#2563EB" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#F87171" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorExpenses)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enrollment Chart & Activity */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle>Enrollment Capacity</CardTitle>
              <CardDescription>Current students vs capacity by program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{fill: '#F3F4F6'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="students" radius={[0, 4, 4, 0]} barSize={12}>
                      {enrollmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.students >= entry.capacity ? '#F59E0B' : '#0F172A'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                Upcoming & Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className={`mt-0.5 w-2 h-2 rounded-full ${
                      event.type === 'compliance' ? 'bg-red-500' : 
                      event.type === 'internal' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                View all tasks
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default OverviewPage;