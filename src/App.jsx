import React, { useState, useMemo } from 'react';
import {
  Home, Baby, Building2, ShieldCheck, ClipboardList, Wrench, DollarSign,
  GraduationCap, Users, ListTodo, Plus, Check, AlertTriangle, ChevronRight,
  Calendar, Phone, Mail, X, Clock, TrendingUp, CheckCircle2, AlertCircle,
  Star, FileText, UserPlus, HeartPulse, LogOut, Sparkles, Edit3, ChevronDown,
  Receipt, BookOpen, Coffee, Trash2
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar
} from 'recharts';

// ─── Design tokens ────────────────────────────────────────────────
const C = {
  bg: '#F5F7FB',
  card: '#FFFFFF',
  ink: '#0F1729',
  ink2: '#3A4254',
  ink3: '#6B7385',
  ink4: '#94A0B5',
  line: '#E5E8F0',
  navy: '#0F1729',
  navyDeep: '#0A0F1E',
  blue: '#2563EB',
  blueSoft: '#DBEAFE',
  orange: '#F97316',
  orangeSoft: '#FFEDD5',
  green: '#16A34A',
  greenSoft: '#DCFCE7',
  red: '#DC2626',
  redSoft: '#FEE2E2',
  amber: '#D97706',
  amberSoft: '#FEF3C7',
  purple: '#7C3AED',
  purpleSoft: '#EDE9FE',
};

// ─── Expense auto-categorization (keyword matching) ───────────────
const CATEGORIES = {
  'Classroom Supplies': ['pencil', 'crayon', 'paper', 'glue', 'scissor', 'book', 'art', 'craft', 'workbook', 'textbook', 'marker', 'whiteboard', 'eraser', 'folder', 'notebook'],
  'Events & Food': ['pizza', 'cake', 'food', 'snack', 'lunch', 'breakfast', 'cater', 'celebration', 'party', 'event', 'birthday', 'graduation', 'carnival', 'meal', 'donut', 'coffee', 'drink', 'juice'],
  'Cleaning & Sanitation': ['cleaning', 'wipe', 'soap', 'sanitizer', 'disinfectant', 'towel', 'tissue', 'detergent', 'bleach', 'spray'],
  'Tech & Software': ['software', 'subscription', 'license', 'computer', 'laptop', 'tablet', 'headphone', 'cable', 'charger', 'app', 'printer', 'ink', 'toner'],
  'Professional Dev.': ['training', 'course', 'conference', 'workshop', 'certification', 'webinar', 'seminar'],
  'Faculty Appreciation': ['teacher', 'staff appreciation', 'thank you', 'gift card', 'flowers', 'plaque'],
  'Office Supplies': ['stapler', 'envelope', 'stamp', 'binder', 'tape', 'pen'],
};

const categorize = (description) => {
  const desc = (description || '').toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(k => desc.includes(k))) return cat;
  }
  return 'Uncategorized';
};

const CATEGORY_COLORS = {
  'Classroom Supplies': C.blue,
  'Events & Food': C.orange,
  'Cleaning & Sanitation': C.green,
  'Tech & Software': C.purple,
  'Professional Dev.': C.amber,
  'Faculty Appreciation': '#EC4899',
  'Office Supplies': '#0EA5E9',
  'Uncategorized': C.ink4,
};

// ─── Sample data ──────────────────────────────────────────────────
const PRESCHOOL_PROGRAMS = ['Age 1', 'Age 2', 'PreK3', 'PreK4', 'VPK', 'Summer'];
const K8_PROGRAMS = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const ALL_PROGRAMS = [...PRESCHOOL_PROGRAMS, ...K8_PROGRAMS];

// Per-classroom: monthly revenue/cost/profit + performance metrics + last year comparison
// K-8 metrics: incidents (YTD count) + NWEA MAP class avg (RIT score)
// Preschool metrics: withdrawals (YTD count of kids who left)
// lastYear: snapshot of same metrics from prior school year for YoY delta
const initialClassrooms = [
  { id: 1,  name: 'Age 1 — Bumblebees', program: 'Age 1', tier: 'preschool', capacity: 8,  enrolled: 6,  teacher: 'Ms. Alvarez', tuitionPerSeat: 1100, monthlyCost: 6800,  withdrawals: 3, nweaMap: null, lastYear: { enrolled: 7,  monthlyProfit: -350,  withdrawals: 2, nweaMap: null } },
  { id: 2,  name: 'Age 2 — Ladybugs',   program: 'Age 2', tier: 'preschool', capacity: 10, enrolled: 9,  teacher: 'Ms. Soto',    tuitionPerSeat: 1050, monthlyCost: 7200,  withdrawals: 1, nweaMap: null, lastYear: { enrolled: 8,  monthlyProfit: 1200,  withdrawals: 2, nweaMap: null } },
  { id: 3,  name: 'PreK3 — Sunflower',  program: 'PreK3', tier: 'preschool', capacity: 12, enrolled: 11, teacher: 'Ms. Patel',   tuitionPerSeat: 1000, monthlyCost: 7400,  withdrawals: 0, nweaMap: null, lastYear: { enrolled: 10, monthlyProfit: 2600,  withdrawals: 0, nweaMap: null } },
  { id: 4,  name: 'PreK4 — Oak',        program: 'PreK4', tier: 'preschool', capacity: 16, enrolled: 16, teacher: 'Ms. Rivera',  tuitionPerSeat: 950,  monthlyCost: 8200,  withdrawals: 0, nweaMap: null, lastYear: { enrolled: 15, monthlyProfit: 6050,  withdrawals: 1, nweaMap: null } },
  { id: 5,  name: 'VPK — Maple',        program: 'VPK',   tier: 'preschool', capacity: 18, enrolled: 17, teacher: 'Ms. Brooks',  tuitionPerSeat: 425,  monthlyCost: 7600,  withdrawals: 1, nweaMap: null, lastYear: { enrolled: 18, monthlyProfit: 50,    withdrawals: 0, nweaMap: null } },
  { id: 6,  name: 'K — Sequoia',        program: 'K',     tier: 'k8',        capacity: 20, enrolled: 19, teacher: 'Mr. Nguyen',  tuitionPerSeat: 850,  monthlyCost: 9100,  incidents: 1, nweaMap: 152,  lastYear: { enrolled: 18, monthlyProfit: 6200,  incidents: 2, nweaMap: 148 } },
  { id: 7,  name: '1st — Cypress',      program: '1st',   tier: 'k8',        capacity: 20, enrolled: 18, teacher: 'Ms. Cohen',   tuitionPerSeat: 875,  monthlyCost: 9200,  incidents: 0, nweaMap: 168,  lastYear: { enrolled: 19, monthlyProfit: 7425,  incidents: 1, nweaMap: 165 } },
  { id: 8,  name: '2nd — Willow',       program: '2nd',   tier: 'k8',        capacity: 22, enrolled: 21, teacher: 'Ms. Diaz',    tuitionPerSeat: 900,  monthlyCost: 9400,  incidents: 2, nweaMap: 184,  lastYear: { enrolled: 20, monthlyProfit: 8600,  incidents: 1, nweaMap: 182 } },
  { id: 9,  name: '3rd — Birch',        program: '3rd',   tier: 'k8',        capacity: 22, enrolled: 20, teacher: 'Mr. Park',    tuitionPerSeat: 925,  monthlyCost: 9600,  incidents: 1, nweaMap: 195,  lastYear: { enrolled: 21, monthlyProfit: 9825,  incidents: 0, nweaMap: 192 } },
  { id: 10, name: '4th — Magnolia',     program: '4th',   tier: 'k8',        capacity: 24, enrolled: 22, teacher: "Mr. O'Brien", tuitionPerSeat: 950,  monthlyCost: 9800,  incidents: 0, nweaMap: 204,  lastYear: { enrolled: 20, monthlyProfit: 9200,  incidents: 1, nweaMap: 199 } },
  { id: 11, name: '5th — Cedar',        program: '5th',   tier: 'k8',        capacity: 24, enrolled: 19, teacher: 'Ms. Hassan',  tuitionPerSeat: 975,  monthlyCost: 10000, incidents: 5, nweaMap: 198,  lastYear: { enrolled: 22, monthlyProfit: 11450, incidents: 2, nweaMap: 207 } },
  { id: 12, name: '6th — Palm',         program: '6th',   tier: 'k8',        capacity: 24, enrolled: 17, teacher: 'Mr. Levine',  tuitionPerSeat: 1000, monthlyCost: 10200, incidents: 3, nweaMap: 209,  lastYear: { enrolled: 19, monthlyProfit: 8800,  incidents: 4, nweaMap: 208 } },
  { id: 13, name: '7th — Live Oak',     program: '7th',   tier: 'k8',        capacity: 24, enrolled: 14, teacher: 'Ms. Foster',  tuitionPerSeat: 1025, monthlyCost: 10400, incidents: 2, nweaMap: 215,  lastYear: { enrolled: 16, monthlyProfit: 6000,  incidents: 1, nweaMap: 213 } },
  { id: 14, name: '8th — Banyan',       program: '8th',   tier: 'k8',        capacity: 24, enrolled: 13, teacher: 'Mr. Tate',    tuitionPerSeat: 1050, monthlyCost: 10600, incidents: 4, nweaMap: 218,  lastYear: { enrolled: 18, monthlyProfit: 8300,  incidents: 2, nweaMap: 220 } },
];

// Compute classroom economics (helper)
const classroomEconomics = (c) => {
  const monthlyRevenue = c.tuitionPerSeat * c.enrolled;
  const monthlyProfit = monthlyRevenue - c.monthlyCost;
  const margin = monthlyRevenue > 0 ? Math.round((monthlyProfit / monthlyRevenue) * 100) : 0;
  return { monthlyRevenue, monthlyProfit, margin };
};

// YoY delta renderer — returns {arrow, color, text}
// goodWhenUp: true if higher numbers = better (profit, enrolled, nwea); false if lower = better (incidents, withdrawals)
const yoyDelta = (current, lastYear, goodWhenUp = true) => {
  if (current === null || current === undefined || lastYear === null || lastYear === undefined) return null;
  const delta = current - lastYear;
  if (delta === 0) return { arrow: '→', color: C.ink3, text: 'flat' };
  const isImprovement = goodWhenUp ? delta > 0 : delta < 0;
  return {
    arrow: delta > 0 ? '▲' : '▼',
    color: isImprovement ? C.green : C.red,
    text: `${delta > 0 ? '+' : ''}${delta}`,
  };
};

// NWEA MAP grade-level RIT benchmarks (median/expected scores)
const NWEA_BENCHMARK = { K: 159, '1st': 177, '2nd': 188, '3rd': 199, '4th': 208, '5th': 215, '6th': 220, '7th': 224, '8th': 228 };

const initialCompliance = [
  // Regulatory (existing)
  { id: 1, item: 'Fire Inspection',          authority: 'County Fire',  status: 'compliant', expires: '2026-11-04', category: 'regulatory' },
  { id: 2, item: 'Health Dept. Inspection',  authority: 'FL DOH',        status: 'compliant', expires: '2026-08-22', category: 'regulatory' },
  { id: 3, item: 'Background Checks (Staff)', authority: 'FL DCF',       status: 'expiring',  expires: '2026-06-15', category: 'regulatory' },
  { id: 4, item: 'VPK Provider Cert.',       authority: 'ELC',           status: 'compliant', expires: '2027-01-30', category: 'regulatory' },
  { id: 5, item: 'Step Up Audit',            authority: 'Step Up FL',    status: 'expiring',  expires: '2026-06-01', category: 'regulatory' },
  { id: 6, item: 'CPR / First Aid',          authority: 'Red Cross',     status: 'expired',   expires: '2026-04-12', category: 'regulatory' },
  { id: 7, item: 'Playground Audit',         authority: 'NPPS',          status: 'compliant', expires: '2026-09-10', category: 'regulatory' },
  // Insurance — shop rates ~60 days before renewal
  { id: 8, item: 'General Liability Insurance', authority: 'Travelers',  status: 'expiring',  expires: '2026-07-01', category: 'insurance', shopReminder: '2026-05-02' },
  { id: 9, item: 'Property Insurance',          authority: 'Hartford',    status: 'compliant', expires: '2026-12-15', category: 'insurance', shopReminder: '2026-10-16' },
  { id: 10, item: 'Workers Comp Insurance',     authority: 'AmTrust',     status: 'compliant', expires: '2026-10-01', category: 'insurance', shopReminder: '2026-08-02' },
  { id: 11, item: 'Auto / Vehicle Insurance',   authority: 'Progressive', status: 'compliant', expires: '2027-02-14', category: 'insurance', shopReminder: '2026-12-16' },
  // Contracts — major vendor agreements with renewal dates
  { id: 12, item: 'Building Lease',         authority: 'Lakeside Properties LLC', status: 'compliant', expires: '2028-08-01', category: 'contract' },
  { id: 13, item: 'Food Service Contract',  authority: 'Sunshine Catering',       status: 'expiring',  expires: '2026-07-31', category: 'contract' },
  { id: 14, item: 'Cleaning Service',       authority: 'BrightClean Co.',         status: 'compliant', expires: '2026-12-31', category: 'contract' },
  { id: 15, item: 'Accounting / CPA',       authority: 'Martinez & Co. CPA',      status: 'compliant', expires: '2027-04-01', category: 'contract' },
  { id: 16, item: 'IT / Internet',          authority: 'Spectrum Business',       status: 'compliant', expires: '2026-09-30', category: 'contract' },
];

const initialTasks = [
  { id: 1, title: 'Parent-teacher conference scheduling', assignee: 'director', priority: 'high', status: 'in_progress', due: '2026-05-14' },
  { id: 2, title: 'Renew faculty CPR certifications',     assignee: 'director', priority: 'high', status: 'open',        due: '2026-05-20' },
  { id: 3, title: 'Order Grade 5 yearbooks',              assignee: 'director', priority: 'medium', status: 'open',      due: '2026-05-25' },
  { id: 4, title: 'Submit Step Up reconciliation',        assignee: 'director', priority: 'high', status: 'open',        due: '2026-05-30' },
  { id: 5, title: 'Spring carnival vendor confirmation',  assignee: 'director', priority: 'low', status: 'in_progress',  due: '2026-06-02' },
  { id: 6, title: 'Final report card review',             assignee: 'director', priority: 'medium', status: 'open',      due: '2026-06-05' },
  { id: 7, title: 'HVAC vendor decision sign-off',        assignee: 'owner',    priority: 'high', status: 'open',        due: '2026-05-12' },
  { id: 8, title: 'Approve PO — Playground equipment',    assignee: 'owner',    priority: 'high', status: 'open',        due: '2026-05-14' },
  { id: 9, title: 'Review 5th grade teacher performance', assignee: 'owner',    priority: 'medium', status: 'in_progress', due: '2026-05-22' },
  { id: 10, title: 'Sign Step Up Q4 attestation',         assignee: 'owner',    priority: 'medium', status: 'open',      due: '2026-05-28' },
];

// At-Risk: students whose families have signaled they may leave (NOT a request — tracking only)
// lastUpdated = when status was last touched · stale alert if intervening > 7 days without movement
const initialAtRisk = [
  { id: 1, student: 'J. Martinez', grade: '5th', reason: 'financial',    detail: 'Lost job · asking about payment plan',      flagged: '2026-05-04', lastUpdated: '2026-05-04', status: 'intervening' },
  { id: 2, student: 'A. Choi',     grade: '7th', reason: 'transferring', detail: 'Touring private school in Tampa',           flagged: '2026-05-06', lastUpdated: '2026-05-06', status: 'intervening' },
  { id: 3, student: 'R. Hassan',   grade: '3rd', reason: 'financial',    detail: 'Asked about scholarship eligibility',       flagged: '2026-05-08', lastUpdated: '2026-05-08', status: 'intervening' },
  { id: 4, student: 'M. Webb',     grade: '8th', reason: 'transferring', detail: 'Moving district',                           flagged: '2026-04-18', lastUpdated: '2026-04-22', status: 'lost' },
  { id: 5, student: 'S. Patel',    grade: '6th', reason: 'other',        detail: 'Parent dissatisfied with math curriculum',  flagged: '2026-04-28', lastUpdated: '2026-04-28', status: 'intervening' },
  { id: 6, student: 'T. Brooks',   grade: '2nd', reason: 'transferring', detail: 'Considering homeschool',                    flagged: '2026-05-10', lastUpdated: '2026-05-10', status: 'intervening' },
  { id: 7, student: 'L. Khoury',   grade: '4th', reason: 'financial',    detail: 'Two-month tuition balance',                 flagged: '2026-05-02', lastUpdated: '2026-05-09', status: 'retained' },
];

// Discounts & Waived Tuition
const initialDiscounts = [
  { id: 1, student: 'E. Foster', grade: 'K',   type: 'staff_child', monthlyValue: 850 },
  { id: 2, student: 'N. Patel',  grade: '2nd', type: 'sibling',     monthlyValue: 225 },
  { id: 3, student: 'C. Patel',  grade: 'K',   type: 'sibling',     monthlyValue: 213 },
  { id: 4, student: 'D. Alvarez',grade: '3rd', type: 'staff_child', monthlyValue: 925 },
  { id: 5, student: 'M. Cohen',  grade: '1st', type: 'sibling',     monthlyValue: 219 },
  { id: 6, student: 'O. Diaz',   grade: '5th', type: 'staff_child', monthlyValue: 975 },
  { id: 7, student: 'I. Tate',   grade: '6th', type: 'staff_child', monthlyValue: 1000 },
  { id: 8, student: 'F. Rivera', grade: 'PreK4', type: 'staff_child', monthlyValue: 950 },
  { id: 9, student: 'P. Levine', grade: '7th', type: 'sibling',     monthlyValue: 256 },
  { id: 10, student: 'B. Hassan',grade: '5th', type: 'hardship',    monthlyValue: 500 },
  { id: 11, student: 'V. Soto',  grade: 'PreK3', type: 'staff_child', monthlyValue: 1000 },
  { id: 12, student: 'W. Park',  grade: '4th', type: 'sibling',     monthlyValue: 238 },
  { id: 13, student: 'K. Brooks',grade: 'VPK', type: 'staff_child', monthlyValue: 425 },
  { id: 14, student: 'Y. Nguyen',grade: 'K',   type: 'staff_child', monthlyValue: 850 },
];

// Step Up Scholarship payment approvals — parents must approve each payment in Step Up portal
// Director chases parents weekly. Owner wants fast turnaround. 20+ days = red flag.
const initialStepUpApprovals = [
  { id: 1,  parent: 'R. Garcia',  student: 'M. Garcia',  grade: '3rd', amount: 2850, sent: '2026-05-08', status: 'pending', lastContact: '2026-05-10' },
  { id: 2,  parent: 'L. Singh',   student: 'A. Singh',   grade: '1st', amount: 2850, sent: '2026-05-06', status: 'pending', lastContact: '2026-05-09' },
  { id: 3,  parent: 'D. Kim',     student: 'J. Kim',     grade: '5th', amount: 3100, sent: '2026-05-04', status: 'pending', lastContact: '2026-05-09' },
  { id: 4,  parent: 'M. Owens',   student: 'T. Owens',   grade: '2nd', amount: 2900, sent: '2026-04-28', status: 'pending', lastContact: '2026-05-08' },
  { id: 5,  parent: 'A. Reyes',   student: 'L. Reyes',   grade: '4th', amount: 3000, sent: '2026-04-22', status: 'pending', lastContact: '2026-05-07' },
  { id: 6,  parent: 'B. Watts',   student: 'C. Watts',   grade: '6th', amount: 3200, sent: '2026-04-18', status: 'pending', lastContact: '2026-05-06' },
  { id: 7,  parent: 'K. Fields',  student: 'D. Fields',  grade: 'K',   amount: 2700, sent: '2026-04-15', status: 'pending', lastContact: '2026-05-05' },
  { id: 8,  parent: 'P. Holman',  student: 'E. Holman',  grade: '7th', amount: 3250, sent: '2026-04-12', status: 'pending', lastContact: '2026-05-04' },
  // Recently approved (good signal for turnaround metric)
  { id: 9,  parent: 'J. Vega',    student: 'I. Vega',    grade: '3rd', amount: 2850, sent: '2026-05-01', status: 'approved', approvedOn: '2026-05-06' },
  { id: 10, parent: 'S. Marin',   student: 'O. Marin',   grade: '5th', amount: 3100, sent: '2026-04-28', status: 'approved', approvedOn: '2026-05-08' },
  { id: 11, parent: 'T. Quinn',   student: 'F. Quinn',   grade: '2nd', amount: 2900, sent: '2026-04-25', status: 'approved', approvedOn: '2026-05-02' },
  { id: 12, parent: 'N. Ford',    student: 'P. Ford',    grade: '1st', amount: 2850, sent: '2026-04-20', status: 'approved', approvedOn: '2026-04-29' },
];

// Payroll cadence — semi-monthly, 15th and last day of month
const NEXT_PAYROLL = '2026-05-15';

// ─── Enrollment targets (set annually for new school year) ────────
// Owner sets these once · dashboard shows progress as %
const ENROLLMENT_TARGETS = {
  total: 240,       // total student target
  preschool: 65,    // Age 1 + Age 2 + PreK3 + PreK4 + VPK
  k8: 175,          // K through 8th
};

// ─── Substitute Coverage ──────────────────────────────────────────
// Policy: NO sub called unless ≥2 teachers are out (saves payroll).
// Director logs sub calls. Owner sees if policy was followed without ops detail.
const initialSubstitutes = [
  // Today's record(s) — director logged a sub for Ms. Cohen since two teachers are out
  { id: 1, date: '2026-05-11', coveringFor: 'Ms. Cohen', subName: 'Ms. Hart', calledBy: 'Director' },
  // Historical (last 30 days) — for trend visibility
  { id: 2, date: '2026-05-05', coveringFor: 'Mr. Levine', subName: 'Mr. Owens', calledBy: 'Director' },
  { id: 3, date: '2026-04-28', coveringFor: 'Ms. Diaz',   subName: 'Ms. Hart',  calledBy: 'Director' },
];

const initialMaintenance = [
  { id: 1, location: 'K — Sequoia', issue: 'AC unit not cooling', priority: 'critical', status: 'open', logged: '2026-05-09', estCost: 1200 },
  { id: 2, location: 'Cafeteria', issue: 'Plumbing — sink backup', priority: 'high', status: 'in_progress', logged: '2026-05-07', estCost: 450 },
  { id: 3, location: 'Playground', issue: 'Swing chain replacement', priority: 'high', status: 'open', logged: '2026-05-10', estCost: 180 },
  { id: 4, location: '2nd — Willow', issue: 'Light fixture flickering', priority: 'low', status: 'open', logged: '2026-05-05', estCost: 75 },
  { id: 5, location: 'Front office', issue: 'Door lock sticky', priority: 'medium', status: 'done', logged: '2026-05-02', estCost: 110 },
];

const initialScholarships = [
  { id: 1, program: 'FES-EO', students: 38, awarded: 342000 },
  { id: 2, program: 'FES-UA', students: 14, awarded: 168000 },
  { id: 3, program: 'FTC', students: 22, awarded: 198000 },
  { id: 4, program: 'VPK', students: 27, awarded: 67500 },
];

const initialStaff = [
  { id: 1,  name: 'Ms. Alvarez', role: 'Teacher',     today: 'present', ptoAllowance: 10, ptoUsed: 3, birthdayUsedThisYear: false },
  { id: 2,  name: 'Ms. Soto',    role: 'Teacher',     today: 'present', ptoAllowance: 10, ptoUsed: 2, birthdayUsedThisYear: true },
  { id: 3,  name: 'Ms. Patel',   role: 'Teacher',     today: 'present', ptoAllowance: 10, ptoUsed: 5, birthdayUsedThisYear: false },
  { id: 4,  name: 'Ms. Rivera',  role: 'Teacher',     today: 'late',    ptoAllowance: 10, ptoUsed: 1, birthdayUsedThisYear: false },
  { id: 5,  name: 'Ms. Brooks',  role: 'Teacher',     today: 'present', ptoAllowance: 10, ptoUsed: 4, birthdayUsedThisYear: false },
  { id: 6,  name: 'Mr. Nguyen',  role: 'Teacher',     today: 'callout', ptoAllowance: 10, ptoUsed: 6, birthdayUsedThisYear: false },
  { id: 7,  name: 'Ms. Cohen',   role: 'Teacher',     today: 'present', ptoAllowance: 10, ptoUsed: 7, birthdayUsedThisYear: false },
  { id: 8,  name: 'Ms. Diaz',    role: 'Teacher',     today: 'present', ptoAllowance: 10, ptoUsed: 0, birthdayUsedThisYear: true },
  { id: 9,  name: 'Mr. Park',    role: 'Teacher',     today: 'present', ptoAllowance: 10, ptoUsed: 3, birthdayUsedThisYear: false },
  { id: 10, name: "Mr. O'Brien", role: 'Teacher',     today: 'present', ptoAllowance: 10, ptoUsed: 2, birthdayUsedThisYear: false },
  { id: 11, name: 'Ms. Hassan',  role: 'Teacher',     today: 'present', ptoAllowance: 10, ptoUsed: 8, birthdayUsedThisYear: false },
  { id: 12, name: 'Mr. Levine',  role: 'Teacher',     today: 'present', ptoAllowance: 10, ptoUsed: 1, birthdayUsedThisYear: false },
  { id: 13, name: 'Ms. Foster',  role: 'Teacher',     today: 'present', ptoAllowance: 10, ptoUsed: 5, birthdayUsedThisYear: false },
  { id: 14, name: 'Mr. Tate',    role: 'Teacher',     today: 'callout', ptoAllowance: 10, ptoUsed: 4, birthdayUsedThisYear: false },
  { id: 15, name: 'Ms. Crane',   role: 'Front Office',today: 'present', ptoAllowance: 12, ptoUsed: 2, birthdayUsedThisYear: false },
];

// ─── Payroll setup data ──────────────────────────────────────────
// Ongoing deductions (loans, advances). Balance auto-tracks per period.
const initialOtherDeductions = [
  { id: 1, staffName: 'Ms. Crane',  type: 'Loan',    originalAmount: 4000, balance: 3530 },
  { id: 2, staffName: 'Mr. Levine', type: 'Advance', originalAmount: 800,  balance: 480  },
];

// Holidays falling in the current pay period (auto-detected by date in real build).
const initialPeriodHolidays = [
  { id: 1, date: '2026-05-08', name: 'Mother\'s Day (no school)' },
];

// Recently submitted payroll periods — history (Owner sees past submissions).
const initialPayrollHistory = [
  {
    id: 1,
    periodEnding: '2026-04-30',
    submittedAt: '2026-04-30T16:42:00',
    submittedBy: 'Director',
    childCare: [{ name: 'Kat', amount: 130 }, { name: 'Maye', amount: 30 }],
    otherDeductions: [{ name: 'Ms. Crane', amount: 160, balanceAfter: 3530 }],
    pto: [
      { name: 'Eliz', startDate: '2026-04-10', endDate: '2026-04-10', days: 1, balanceAfter: 0 },
      { name: 'S ll', startDate: '2026-04-08', endDate: '2026-04-10', days: 3, balanceAfter: 5 },
    ],
    birthday: [{ name: 'Nam', date: '2026-04-30' }],
    hoursToAdd: [
      { name: 'Estra', hours: 0.5, type: 'After-care' },
      { name: 'Eliz',  hours: 4,   type: 'After-care' },
      { name: 'Sh',    hours: 3,   type: 'After-care' },
    ],
    holidayExceptions: [],
    notes: { preschool: '', elementary: '' },
  },
];

const initialWaitlist = [
  { id: 1, child: 'Emma R.', program: 'PreK4', parent: 'Sara R.', phone: '813-555-0142', email: 's.r@email.com', dateAdded: '2026-03-18', status: 'toured', source: 'referral' },
  { id: 2, child: 'Noah K.', program: 'K', parent: 'James K.', phone: '813-555-0188', email: 'j.k@email.com', dateAdded: '2026-04-02', status: 'applied', source: 'website' },
  { id: 3, child: 'Liam M.', program: '2nd', parent: 'Maria M.', phone: '813-555-0210', email: 'm.m@email.com', dateAdded: '2026-04-11', status: 'offered', source: 'walk_in' },
  { id: 4, child: 'Sophia D.', program: 'PreK3', parent: 'Anika D.', phone: '813-555-0301', email: 'a.d@email.com', dateAdded: '2026-04-19', status: 'inquiry', source: 'event' },
  { id: 5, child: 'Ethan C.', program: '5th', parent: 'Lin C.', phone: '813-555-0277', email: 'l.c@email.com', dateAdded: '2026-04-22', status: 'toured', source: 'referral' },
  { id: 6, child: 'Ava B.', program: 'K', parent: 'Daniel B.', phone: '813-555-0344', email: 'd.b@email.com', dateAdded: '2026-05-01', status: 'applied', source: 'website' },
  { id: 7, child: 'Mason W.', program: '1st', parent: 'Erin W.', phone: '813-555-0399', email: 'e.w@email.com', dateAdded: '2026-05-06', status: 'inquiry', source: 'website' },
  { id: 8, child: 'Zoe T.', program: 'Age 2', parent: 'Priya T.', phone: '813-555-0411', email: 'p.t@email.com', dateAdded: '2026-05-08', status: 'inquiry', source: 'referral' },
  { id: 9, child: 'Caleb F.', program: 'VPK', parent: 'Mike F.', phone: '813-555-0432', email: 'm.f@email.com', dateAdded: '2026-04-26', status: 'toured', source: 'website' },
];

const initialDirectorExpenses = [
  { id: 1, amount: 47.50, description: 'Pizza for parent meeting', date: '2026-04-12' },
  { id: 2, amount: 124.00, description: 'Crayons and markers — PreK3', date: '2026-04-15' },
  { id: 3, amount: 38.00, description: 'Coffee and donuts for staff PD', date: '2026-04-22' },
  { id: 4, amount: 89.00, description: 'Cleaning wipes restock', date: '2026-04-28' },
  { id: 5, amount: 215.00, description: 'Construction paper bulk order', date: '2026-05-01' },
  { id: 6, amount: 65.00, description: 'Birthday cake for office party', date: '2026-05-04' },
  { id: 7, amount: 180.00, description: 'Printer ink cartridges', date: '2026-05-06' },
  { id: 8, amount: 42.00, description: 'Gift cards for teacher appreciation', date: '2026-05-08' },
];

const initialDirectorLog = [
  { id: 101, type: 'pto', date: '2026-05-08', staff: 'Mr. Tate', dayType: 'sick', days: 1 },
  { id: 102, type: 'incident', date: '2026-05-07', student: 'Student A.', severity: 'minor', area: 'Playground' },
  { id: 103, type: 'pto', date: '2026-05-06', staff: 'Ms. Cohen', dayType: 'personal', days: 1 },
  { id: 104, type: 'maintenance', date: '2026-05-05', location: '2nd — Willow', issue: 'Light fixture flickering', priority: 'low' },
];

const enrollmentTrend = [
  { month: 'Aug', students: 220 },
  { month: 'Sep', students: 228 },
  { month: 'Oct', students: 232 },
  { month: 'Nov', students: 234 },
  { month: 'Dec', students: 235 },
  { month: 'Jan', students: 237 },
  { month: 'Feb', students: 238 },
  { month: 'Mar', students: 239 },
  { month: 'Apr', students: 240 },
  { month: 'May', students: 240 },
];

// School-wide annual budget (Owner view)
const SCHOOL_BUDGET_TOTAL = 1850000;
const SCHOOL_BUDGET_CATEGORIES = [
  { name: 'Payroll & Benefits', spent: 920000, budget: 1200000 },
  { name: 'Facilities & Rent', spent: 142000, budget: 180000 },
  { name: 'Curriculum & Books', spent: 58000, budget: 75000 },
  { name: 'Insurance', spent: 38000, budget: 45000 },
  { name: 'Marketing & Admissions', spent: 22000, budget: 35000 },
  { name: 'Tech & Equipment', spent: 31000, budget: 50000 },
  { name: 'Utilities', spent: 26000, budget: 38000 },
  { name: "Director's Discretionary", spent: 0, budget: 9000 }, // computed dynamically
];

const DIRECTOR_BUDGET_TOTAL = 9000;

// ─── Cash Flow — year-over-year by category ──────────────────────
// Source: monthly CSV from QuickBooks (uploaded by Owner/Accountant), AI-categorized.
// Each category shows spend per year. Owner picks which categories to compare.
const CASHFLOW_YEARS = [2022, 2023, 2024, 2025, 2026]; // 2026 is partial (YTD)
const CASHFLOW_DATA = [
  { category: 'Payroll',             icon: '👥', values: { 2022: 798000, 2023: 845000, 2024: 882000, 2025: 920000, 2026: 365000 }, ytdNote: 'Jan–Apr' },
  { category: 'Insurance',           icon: '🛡', values: { 2022: 28000,  2023: 31000,  2024: 34000,  2025: 38000,  2026: 16500 },  ytdNote: 'Jan–Apr' },
  { category: 'Mortgage',            icon: '🏠', values: { 2022: 138000, 2023: 138000, 2024: 138000, 2025: 142000, 2026: 56800 },  ytdNote: 'Jan–Apr' },
  { category: 'Utilities',           icon: '⚡', values: { 2022: 19000,  2023: 22000,  2024: 24000,  2025: 26000,  2026: 9200 },   ytdNote: 'Jan–Apr' },
  { category: 'Food Service',        icon: '🍎', values: { 2022: 42000,  2023: 48000,  2024: 51000,  2025: 49000,  2026: 18800 },  ytdNote: 'Jan–Apr' },
  { category: 'Bank Fees',           icon: '🏦', values: { 2022: 2400,   2023: 2800,   2024: 3100,   2025: 3500,   2026: 1300 },   ytdNote: 'Jan–Apr' },
  { category: 'Accounting & CPA',    icon: '📊', values: { 2022: 8000,   2023: 8500,   2024: 9200,   2025: 10000,  2026: 4500 },   ytdNote: 'Jan–Apr' },
  { category: 'Curriculum & Books',  icon: '📚', values: { 2022: 45000,  2023: 52000,  2024: 56000,  2025: 58000,  2026: 22500 },  ytdNote: 'Jan–Apr' },
  { category: 'Tech & Equipment',    icon: '💻', values: { 2022: 22000,  2023: 28000,  2024: 35000,  2025: 31000,  2026: 12500 },  ytdNote: 'Jan–Apr' },
  { category: 'Marketing',           icon: '📣', values: { 2022: 14000,  2023: 18000,  2024: 21000,  2025: 22000,  2026: 8800 },   ytdNote: 'Jan–Apr' },
];

// AI-generated observations (auto-generated from the data above in real build)
const CASHFLOW_INSIGHTS = [
  { tone: 'red',   icon: '↑', text: 'Insurance up 12% YoY — biggest jump in 5 years. Liability renewal July 1 — shop rates by May 2 (60 days out).' },
  { tone: 'red',   icon: '↑', text: 'Payroll grew 4.3% YoY in 2025 — pace matches prior years but is now the biggest single line by far.' },
  { tone: 'amber', icon: '→', text: 'Mortgage payment increased 2.9% in 2025 — first change in 3 years. Check if escrow recalc needed.' },
  { tone: 'green', icon: '↓', text: 'Food costs down 4% YoY — switched vendors in March 2025. Holding the savings.' },
  { tone: 'green', icon: '↓', text: 'Tech & Equipment down 11% in 2025 vs 2024 spike — last year was Chromebook refresh, this year normal.' },
  { tone: 'amber', icon: '↑', text: 'Bank Fees up 13% YoY — review accounts, may be opportunity to consolidate.' },
];

// ─── Small helpers ────────────────────────────────────────────────
const TODAY = new Date('2026-05-11');
const fmtMoney = (n) => '$' + Math.round(n).toLocaleString();
const fmtMoneyShort = (n) => n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'K' : '$' + n;
const daysUntil = (dateStr) => {
  const d = new Date(dateStr);
  return Math.ceil((d - TODAY) / 86400000);
};
const daysSince = (dateStr) => -daysUntil(dateStr);

// ─── Primitives ──────────────────────────────────────────────────
const Card = ({ children, className = '', accent, onClick, style = {} }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
    style={{
      background: C.card,
      borderTop: accent ? `3px solid ${accent}` : 'none',
      border: accent ? `1px solid ${C.line}` : `1px solid ${C.line}`,
      borderTopWidth: accent ? '3px' : '1px',
      borderTopColor: accent || C.line,
      ...style,
    }}
  >
    {children}
  </div>
);

const Pill = ({ children, tone = 'neutral', size = 'sm' }) => {
  const map = {
    blue: { bg: C.blueSoft, fg: C.blue },
    orange: { bg: C.orangeSoft, fg: C.orange },
    green: { bg: C.greenSoft, fg: C.green },
    red: { bg: C.redSoft, fg: C.red },
    amber: { bg: C.amberSoft, fg: C.amber },
    purple: { bg: C.purpleSoft, fg: C.purple },
    neutral: { bg: '#EEF1F6', fg: C.ink2 },
  };
  const s = map[tone] || map.neutral;
  const padding = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1 ${padding} rounded-full font-semibold uppercase tracking-wide`} style={{ background: s.bg, color: s.fg }}>
      {children}
    </span>
  );
};

const Btn = ({ children, onClick, kind = 'primary', size = 'md', icon: Icon, disabled }) => {
  const isPrimary = kind === 'primary';
  const isGhost = kind === 'ghost';
  const padding = size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${padding} inline-flex items-center gap-1.5 rounded-xl font-semibold transition-all disabled:opacity-40`}
      style={{
        background: isPrimary ? C.blue : isGhost ? 'transparent' : C.card,
        color: isPrimary ? '#FFF' : isGhost ? C.blue : C.ink,
        border: isGhost ? 'none' : `1px solid ${isPrimary ? C.blue : C.line}`,
      }}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
};

const SectionHead = ({ icon, title, sub, action }) => (
  <div className="flex items-end justify-between mb-4">
    <div>
      <div className="flex items-center gap-2 mb-0.5">
        {icon && <span className="text-xl">{icon}</span>}
        <h2 className="text-xl md:text-2xl font-bold" style={{ color: C.ink }}>{title}</h2>
      </div>
      {sub && <p className="text-sm" style={{ color: C.ink3 }}>{sub}</p>}
    </div>
    {action}
  </div>
);

// Donut KPI card matching v3 aesthetic
const DonutKPI = ({ emoji, label, percent, big, sub, accentColor, urgentText }) => (
  <Card accent={accentColor} className="p-5">
    <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>
      <span className="text-base">{emoji}</span> {label}
    </div>
    <div className="flex flex-col items-center py-2">
      <ResponsiveContainer width="100%" height={120}>
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: percent, fill: accentColor }]} startAngle={90} endAngle={-270}>
          <RadialBar background={{ fill: '#EEF1F6' }} dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="-mt-[88px] text-2xl font-extrabold" style={{ color: accentColor }}>{percent}%</div>
    </div>
    <div className="mt-3 text-center">
      <div className="text-sm font-semibold" style={{ color: C.ink2 }}>{big}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{sub}</div>}
      {urgentText && <div className="mt-2"><Pill tone="red" size="xs">{urgentText}</Pill></div>}
    </div>
  </Card>
);

// Big number KPI (for counts vs percents)
const NumberKPI = ({ emoji, label, value, sub, accentColor, urgentText }) => (
  <Card accent={accentColor} className="p-5">
    <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>
      <span className="text-base">{emoji}</span> {label}
    </div>
    <div className="text-5xl font-extrabold leading-none" style={{ color: accentColor }}>{value}</div>
    {sub && <div className="text-xs mt-2" style={{ color: C.ink3 }}>{sub}</div>}
    {urgentText && <div className="mt-2"><Pill tone="red" size="xs">{urgentText}</Pill></div>}
  </Card>
);

// ─── Header ──────────────────────────────────────────────────────
const Header = ({ role, setRole, setTab }) => (
  <header style={{ background: C.navyDeep, color: '#FFF' }}>
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: '#1F2A44' }}>
          🌳
        </div>
        <div className="min-w-0">
          <div className="text-lg md:text-xl font-extrabold leading-tight truncate">HCLC</div>
          <div className="text-[10px] md:text-xs uppercase tracking-widest" style={{ color: '#94A0B5' }}>
            {role === 'owner' ? 'Owner Dashboard' : 'Director · Asst. Principal'}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0" style={{ background: '#1F2A44' }}>
        <span className="hidden sm:inline text-xs uppercase tracking-wider" style={{ color: '#94A0B5' }}>Role:</span>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setTab(e.target.value === 'owner' ? 'overview' : 'log'); }}
          className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer"
          style={{ color: '#FBBF24' }}
        >
          <option value="owner" style={{ color: '#000' }}>Owner</option>
          <option value="director" style={{ color: '#000' }}>Director · AP</option>
        </select>
      </div>
    </div>
  </header>
);

// ─── Tab nav ─────────────────────────────────────────────────────
const TabNav = ({ tabs, active, setActive }) => (
  <nav className="sticky top-0 z-10 border-b" style={{ background: C.card, borderColor: C.line }}>
    <div className="max-w-7xl mx-auto px-2 md:px-6">
      <div className="flex overflow-x-auto gap-1 no-scrollbar">
        {tabs.map((t) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className="px-3 md:px-4 py-3.5 whitespace-nowrap flex items-center gap-1.5 text-sm transition-all"
              style={{
                color: on ? C.blue : C.ink3,
                borderBottom: on ? `3px solid ${C.blue}` : '3px solid transparent',
                fontWeight: on ? 700 : 500,
              }}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  </nav>
);

// ─── OWNER: Overview ─────────────────────────────────────────────
const OwnerOverview = ({ classrooms, tasks, compliance, waitlist, directorExpenses, atRisk, discounts, stepUp, log, maintenance, staff, substitutes, payrollReady, dismissPayrollAlert, setTab }) => {
  const [focusMode, setFocusMode] = useState(false);

  const totalEnrolled = classrooms.reduce((a, c) => a + c.enrolled, 0);
  const totalCap = classrooms.reduce((a, c) => a + c.capacity, 0);
  const enrollPct = Math.round((totalEnrolled / totalCap) * 100);

  // Tier breakdown for digest + targets
  const preEnrolled = classrooms.filter(c => c.tier === 'preschool').reduce((a, c) => a + c.enrolled, 0);
  const k8Enrolled = classrooms.filter(c => c.tier === 'k8').reduce((a, c) => a + c.enrolled, 0);
  const totalOpenSpots = totalCap - totalEnrolled;

  // Withdrawals YTD: preschool tracked + at-risk who left
  const preWithdrawals = classrooms.filter(c => c.tier === 'preschool').reduce((a, c) => a + (c.withdrawals || 0), 0);
  const lostAtRisk = atRisk.filter(r => r.status === 'lost').length;
  const totalWithdrawals = preWithdrawals + lostAtRisk;

  // Coverage — just: is there a sub today, yes or no. No callout counts surfaced.
  const today = TODAY.toISOString().split('T')[0];
  const todaysSubs = substitutes.filter(s => s.date === today);
  const subToday = todaysSubs.length > 0;
  const coverageMessage = subToday
    ? (todaysSubs.length === 1 ? '1 sub in today' : `${todaysSubs.length} subs in today`)
    : 'No subs today';
  const coverageTone = subToday ? 'amber' : 'green';

  const directorSpent = directorExpenses.reduce((a, e) => a + e.amount, 0);
  const totalSpent = SCHOOL_BUDGET_CATEGORIES.reduce((a, c) =>
    a + (c.name === "Director's Discretionary" ? directorSpent : c.spent), 0
  );
  const budgetPct = Math.round((totalSpent / SCHOOL_BUDGET_TOTAL) * 100);

  // Owner vs Director task split
  const myOpenTasks = tasks.filter(t => t.assignee === 'owner' && t.status !== 'done').length;
  const myHighTasks = tasks.filter(t => t.assignee === 'owner' && t.priority === 'high' && t.status !== 'done').length;
  const dirOpenTasks = tasks.filter(t => t.assignee === 'director' && t.status !== 'done').length;

  // Compliance
  const complianceExpired = compliance.filter(c => c.status === 'expired').length;
  const complianceExpiring = compliance.filter(c => c.status === 'expiring').length;
  const nextDeadline = compliance.filter(c => c.status !== 'compliant').map(c => daysUntil(c.expires)).sort((a, b) => a - b)[0] || 0;

  // At-Risk
  const activeRisk = atRisk.filter(r => r.status === 'intervening');
  const staleRisk = activeRisk.filter(r => daysSince(r.lastUpdated) > 7);

  // Discounts/Waived
  const discountPct = Math.round((discounts.length / totalEnrolled) * 100);
  const discountMonthlyValue = discounts.reduce((a, d) => a + d.monthlyValue, 0);

  // Step Up turnaround
  const stepUpPending = stepUp.filter(s => s.status === 'pending').length;
  const stepUpApproved = stepUp.filter(s => s.status === 'approved');
  const approvedFast = stepUpApproved.filter(s => {
    const turn = (new Date(s.approvedOn) - new Date(s.sent)) / 86400000;
    return turn <= 14;
  }).length;
  const turnaroundPct = stepUpApproved.length ? Math.round((approvedFast / stepUpApproved.length) * 100) : 100;
  const oldestPending = Math.max(0, ...stepUp.filter(s => s.status === 'pending').map(s => daysSince(s.sent)));
  const stepUpRedFlags = stepUp.filter(s => s.status === 'pending' && daysSince(s.sent) >= 20);

  // Payroll countdown
  const payrollDays = daysUntil(NEXT_PAYROLL);

  // Director activity digest (last 7 days)
  const sevenDaysAgo = new Date(TODAY); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weekLog = log.filter(l => new Date(l.date) >= sevenDaysAgo);
  const weekExpenses = directorExpenses.filter(e => new Date(e.date) >= sevenDaysAgo);
  const lastEntry = [...log, ...directorExpenses.map(e => ({ ...e, type: 'expense' }))]
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const lastDate = lastEntry ? lastEntry.date : null;
  const hoursSinceLastEntry = lastDate ? Math.round((TODAY - new Date(lastDate)) / 3600000) : null;

  // Owner-action-only items for focus mode
  const myTasks = tasks.filter(t => t.assignee === 'owner' && t.status !== 'done');
  const criticalCompliance = compliance.filter(c => c.status === 'expired' || (c.status === 'expiring' && daysUntil(c.expires) <= 14));
  const criticalMaintenance = maintenance.filter(m => m.priority === 'critical' && m.status !== 'done');

  const events = [
    { name: 'Spring Carnival',      date: '2026-05-16' },
    { name: 'K Graduation',         date: '2026-05-28' },
    { name: 'End of Year Ceremony', date: '2026-06-05' },
    { name: 'Summer Start',         date: '2026-06-10' },
  ];

  const pendingDecisions = [
    { title: 'HVAC Replacement Decision',    detail: '3 quotes received. CoolAir $8,200 · AirPro $8,800 · QuickCool $9,400', due: '2026-05-12' },
    { title: 'Approve Playground Equipment', detail: 'Vendor selected. PO needed for $3,200.', due: '2026-05-14' },
    { title: 'Roof Repair — Room 3B',        detail: 'DCF flagged. Leak active. Contractor standing by.', due: '2026-05-08' },
    { title: 'Tablet Purchase K–2',          detail: '12 tablets. Budget pre-approved. Need PO sign-off.', due: '2026-05-16' },
  ];

  // Count of items needing Owner input
  const inputItemCount = pendingDecisions.length + myTasks.length + criticalCompliance.length + criticalMaintenance.length + staleRisk.length + stepUpRedFlags.length + (payrollDays <= 3 ? 1 : 0);

  // ════════════ FOCUSED MODE: "Needs My Input" ════════════
  if (focusMode) {
    return (
      <div className="space-y-5">
        {/* Toggle */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-extrabold" style={{ color: C.ink }}>Needs My Input</h2>
            <Pill tone={inputItemCount > 0 ? 'red' : 'green'}>{inputItemCount} {inputItemCount === 1 ? 'item' : 'items'}</Pill>
          </div>
          <button onClick={() => setFocusMode(false)} className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: C.card, color: C.ink2, border: `1px solid ${C.line}` }}>
            Show full overview
          </button>
        </div>

        <p className="text-sm" style={{ color: C.ink3 }}>
          Director-handled items hidden. Only what's actually waiting on you.
        </p>

        {inputItemCount === 0 && (
          <Card className="p-8 text-center" accent={C.green}>
            <div className="text-5xl mb-3">✓</div>
            <div className="text-xl font-extrabold" style={{ color: C.green }}>Nothing on your plate.</div>
            <div className="text-sm mt-2" style={{ color: C.ink3 }}>Director has the rest covered. Go enjoy your day.</div>
          </Card>
        )}

        {/* Payroll if urgent */}
        {payrollDays <= 3 && (
          <Card className="p-4 flex items-center gap-3" accent={C.red}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: C.redSoft }}>
              <Calendar size={18} color={C.red} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Payroll Imminent</div>
              <div className="font-bold text-sm" style={{ color: C.ink }}>{new Date(NEXT_PAYROLL).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            </div>
            <Pill tone="red">{payrollDays}d</Pill>
          </Card>
        )}

        {/* Open Decisions */}
        {pendingDecisions.length > 0 && (
          <Card className="p-5" accent={C.amber}>
            <SectionHead icon="📋" title="Open Decisions" sub={`${pendingDecisions.length} pending`} />
            <div className="space-y-3">
              {pendingDecisions.map((d, i) => {
                const days = daysUntil(d.due);
                const tone = days < 0 ? 'red' : days <= 3 ? 'red' : days <= 7 ? 'orange' : 'amber';
                return (
                  <div key={i} className="p-4 rounded-xl flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2" style={{ background: '#F9FAFC' }}>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm md:text-base" style={{ color: C.ink }}>{d.title}</div>
                      <div className="text-xs md:text-sm mt-1" style={{ color: C.ink3 }}>{d.detail}</div>
                    </div>
                    <Pill tone={tone}>Due {new Date(d.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Pill>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* My Tasks (Owner only) */}
        {myTasks.length > 0 && (
          <Card className="p-5" accent={C.blue}>
            <SectionHead icon="📋" title="My Tasks" sub={`${myTasks.length} open · Owner-assigned`} action={
              <Btn kind="ghost" onClick={() => setTab('tasks')}>Open Tasks →</Btn>
            } />
            <div className="space-y-2">
              {myTasks.map(t => (
                <div key={t.id} className="p-3 rounded-xl flex items-center justify-between gap-2" style={{ background: '#F9FAFC' }}>
                  <div className="min-w-0">
                    <div className="font-bold text-sm" style={{ color: C.ink }}>{t.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>Due {new Date(t.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                  <Pill tone={t.priority === 'high' ? 'red' : t.priority === 'medium' ? 'amber' : 'neutral'}>{t.priority}</Pill>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Critical Compliance */}
        {criticalCompliance.length > 0 && (
          <Card className="p-5" accent={C.red}>
            <SectionHead icon="✅" title="Compliance Needs Attention" sub={`${criticalCompliance.length} expired or expiring within 14 days`} action={
              <Btn kind="ghost" onClick={() => setTab('compliance')}>Open Compliance →</Btn>
            } />
            <div className="space-y-2">
              {criticalCompliance.map(c => (
                <div key={c.id} className="p-3 rounded-xl flex items-center justify-between gap-2" style={{ background: '#F9FAFC' }}>
                  <div className="min-w-0">
                    <div className="font-bold text-sm" style={{ color: C.ink }}>{c.item}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{c.authority} · expires {c.expires}</div>
                  </div>
                  <Pill tone={c.status === 'expired' ? 'red' : 'amber'}>{c.status}</Pill>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Step Up red flags */}
        {stepUpRedFlags.length > 0 && (
          <Card className="p-5" accent={C.red}>
            <SectionHead icon="🎓" title="Step Up Stuck" sub={`${stepUpRedFlags.length} pending 20+ days · need owner-level escalation`} action={
              <Btn kind="ghost" onClick={() => setTab('scholarships')}>Open Scholarships →</Btn>
            } />
            <div className="space-y-2">
              {stepUpRedFlags.map(s => (
                <div key={s.id} className="p-3 rounded-xl flex items-center justify-between gap-2" style={{ background: '#F9FAFC' }}>
                  <div className="min-w-0">
                    <div className="font-bold text-sm" style={{ color: C.ink }}>{s.parent} · {s.student}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{fmtMoney(s.amount)} · last contact {s.lastContact}</div>
                  </div>
                  <Pill tone="red">{daysSince(s.sent)}d open</Pill>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Stale At-Risk */}
        {staleRisk.length > 0 && (
          <Card className="p-5" accent={C.red}>
            <SectionHead icon="⚠️" title="At-Risk Cases Going Cold" sub={`${staleRisk.length} not touched in over 7 days`} action={
              <Btn kind="ghost" onClick={() => setTab('enrollment')}>Open Enrollment →</Btn>
            } />
            <div className="space-y-2">
              {staleRisk.map(r => (
                <div key={r.id} className="p-3 rounded-xl flex items-center justify-between gap-2" style={{ background: '#F9FAFC' }}>
                  <div className="min-w-0">
                    <div className="font-bold text-sm" style={{ color: C.ink }}>{r.student} · {r.grade}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{r.detail}</div>
                  </div>
                  <Pill tone="red">{daysSince(r.lastUpdated)}d stale</Pill>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Critical Maintenance */}
        {criticalMaintenance.length > 0 && (
          <Card className="p-5" accent={C.red}>
            <SectionHead icon="🔧" title="Critical Maintenance" sub={`${criticalMaintenance.length} critical-priority requests`} action={
              <Btn kind="ghost" onClick={() => setTab('maintenance')}>Open Maintenance →</Btn>
            } />
            <div className="space-y-2">
              {criticalMaintenance.map(m => (
                <div key={m.id} className="p-3 rounded-xl flex items-center justify-between gap-2" style={{ background: '#F9FAFC' }}>
                  <div className="min-w-0">
                    <div className="font-bold text-sm" style={{ color: C.ink }}>{m.issue}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{m.location} · est. {fmtMoney(m.estCost)}</div>
                  </div>
                  <Pill tone="red">{m.priority}</Pill>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BIG PAYROLL ALERT — appears when Director submits payroll-ready */}
      {payrollReady && (
        <div className="rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4" style={{ background: '#7C2D12', color: '#fff', border: `3px solid ${C.red}`, boxShadow: '0 10px 30px rgba(220,38,38,0.25)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff' }}>
            <DollarSign size={28} color={C.red} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#FCA5A5' }}>Action Required</div>
            <div className="text-xl md:text-2xl font-extrabold mt-1">Payroll Ready — Submit in ADP</div>
            <div className="text-sm mt-1" style={{ color: '#FED7AA' }}>
              Director submitted for pay period ending {payrollReady.periodEnding} · {payrollReady.pto?.length || 0} PTO · {payrollReady.hoursToAdd?.length || 0} hour adjustments · {payrollReady.childCare?.length || 0} deductions
            </div>
          </div>
          <button onClick={dismissPayrollAlert} className="px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap" style={{ background: '#fff', color: '#7C2D12' }}>
            ✓ Done — submitted in ADP
          </button>
        </div>
      )}

      {/* TOGGLE BAR */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl md:text-3xl font-extrabold" style={{ color: C.ink }}>Overview</h2>
        <button onClick={() => setFocusMode(true)} className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          style={{ background: inputItemCount > 0 ? C.red : C.card, color: inputItemCount > 0 ? '#FFF' : C.ink, border: `1px solid ${inputItemCount > 0 ? C.red : C.line}` }}>
          Needs my input {inputItemCount > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: '#FFF', color: C.red }}>{inputItemCount}</span>}
        </button>
      </div>

      {/* TOP RAIL — Payroll · Director Status · Coverage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 flex items-center gap-3" accent={payrollDays <= 3 ? C.red : payrollDays <= 7 ? C.amber : C.blue}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: C.blueSoft }}>
            <Calendar size={20} color={C.blue} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Next Payroll</div>
            <div className="font-bold text-sm" style={{ color: C.ink }}>{new Date(NEXT_PAYROLL).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          </div>
          <Pill tone={payrollDays <= 3 ? 'red' : payrollDays <= 7 ? 'amber' : 'blue'}>{payrollDays}d</Pill>
        </Card>

        <Card className="p-4 flex items-center gap-3" accent={hoursSinceLastEntry !== null && hoursSinceLastEntry < 24 ? C.green : C.amber}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: C.greenSoft }}>
            <CheckCircle2 size={20} color={C.green} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Director Status</div>
            <div className="font-bold text-sm truncate" style={{ color: C.ink }}>
              {hoursSinceLastEntry === null ? 'No activity yet' :
                hoursSinceLastEntry < 24 ? `Active · last log ${hoursSinceLastEntry}h ago` :
                `Last log ${Math.floor(hoursSinceLastEntry / 24)}d ago`}
            </div>
          </div>
          <Pill tone={hoursSinceLastEntry !== null && hoursSinceLastEntry < 24 ? 'green' : 'amber'}>
            {hoursSinceLastEntry !== null && hoursSinceLastEntry < 24 ? 'Current' : 'Behind'}
          </Pill>
        </Card>

        {/* COVERAGE — binary signal · sub today or not */}
        <Card className="p-4 flex items-center gap-3" accent={subToday ? C.amber : C.green}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: subToday ? C.amberSoft : C.greenSoft }}>
            <Users size={20} color={subToday ? C.amber : C.green} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Today's Coverage</div>
            <div className="font-bold text-sm truncate" style={{ color: C.ink }}>{coverageMessage}</div>
          </div>
          <Pill tone={subToday ? 'amber' : 'green'}>{subToday ? 'Sub' : 'No sub'}</Pill>
        </Card>
      </div>

      {/* KPI GRID — 8 cards, 2 rows on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <DonutKPI emoji="👶" label="Enrollment" percent={enrollPct} big={`${totalEnrolled} / ${totalCap}`} sub="Tap to view →" accentColor={C.blue} />
        <DonutKPI emoji="💰" label="Budget" percent={budgetPct} big={`${fmtMoneyShort(totalSpent)} / ${fmtMoneyShort(SCHOOL_BUDGET_TOTAL)}`} sub="Tap to view →" accentColor={C.orange} />
        <NumberKPI emoji="✅" label="Compliance" value={Math.max(nextDeadline, 0)} sub="days to deadline" accentColor={C.red} urgentText={complianceExpired + complianceExpiring > 0 ? `${complianceExpired + complianceExpiring} urgent` : null} />
        <DonutKPI emoji="🎓" label="Step Up Turnaround" percent={turnaroundPct} big={`${stepUpPending} pending`} sub={oldestPending >= 20 ? `oldest ${oldestPending}d ⚠️` : `oldest ${oldestPending}d`} accentColor={oldestPending >= 20 ? C.red : C.amber} />
        <NumberKPI emoji="⚠️" label="At Risk" value={activeRisk.length} sub={staleRisk.length > 0 ? `${staleRisk.length} stale 🚩` : 'intervening'} accentColor={C.red} urgentText={staleRisk.length > 0 ? 'Action needed' : null} />
        <NumberKPI emoji="📝" label="Waitlist" value={waitlist.length} sub={`${waitlist.filter(w => PRESCHOOL_PROGRAMS.includes(w.program)).length} pre · ${waitlist.filter(w => K8_PROGRAMS.includes(w.program)).length} K-8`} accentColor={C.purple} />
        <NumberKPI emoji="🏷️" label="Discounts" value={discounts.length} sub={`${discountPct}% · ${fmtMoneyShort(discountMonthlyValue)}/mo`} accentColor="#0EA5E9" />
        <NumberKPI emoji="📋" label="My Tasks" value={myOpenTasks} sub={`${dirOpenTasks} on Director`} accentColor={C.green} urgentText={myHighTasks > 0 ? `${myHighTasks} high` : null} />
      </div>

      {/* DIRECTOR DIGEST — School state snapshot, no ops detail */}
      <Card className="p-5" accent={C.purple}>
        <div className="flex items-start justify-between mb-4 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} color={C.purple} />
              <h2 className="text-lg md:text-xl font-bold" style={{ color: C.ink }}>This Week — Director</h2>
            </div>
            <p className="text-sm mt-0.5" style={{ color: C.ink3 }}>Snapshot of what matters · no ops detail</p>
          </div>
          <Pill tone="purple" size="xs">Live</Pill>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Budget — director's week spend */}
          <div className="p-3 rounded-xl" style={{ background: '#F9FAFC' }}>
            <div className="text-2xl font-extrabold" style={{ color: C.orange }}>{fmtMoneyShort(weekExpenses.reduce((a, e) => a + e.amount, 0))}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: C.ink3 }}>budget spent</div>
            <div className="text-xs mt-0.5" style={{ color: C.ink2 }}>last 7 days</div>
          </div>
          {/* Enrollment — current total */}
          <div className="p-3 rounded-xl" style={{ background: '#F9FAFC' }}>
            <div className="text-2xl font-extrabold" style={{ color: C.blue }}>{totalEnrolled}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: C.ink3 }}>enrolled</div>
            <div className="text-xs mt-0.5" style={{ color: C.ink2 }}>{preEnrolled} pre · {k8Enrolled} K-8</div>
          </div>
          {/* Withdrawals — YTD count */}
          <div className="p-3 rounded-xl" style={{ background: '#F9FAFC' }}>
            <div className="text-2xl font-extrabold" style={{ color: totalWithdrawals > 5 ? C.red : C.amber }}>{totalWithdrawals}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: C.ink3 }}>withdrawals</div>
            <div className="text-xs mt-0.5" style={{ color: C.ink2 }}>YTD · kids who left</div>
          </div>
          {/* Open spots — availability */}
          <div className="p-3 rounded-xl" style={{ background: '#F9FAFC' }}>
            <div className="text-2xl font-extrabold" style={{ color: totalOpenSpots > 0 ? C.green : C.red }}>{totalOpenSpots}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: C.ink3 }}>open spots</div>
            <div className="text-xs mt-0.5" style={{ color: C.ink2 }}>seats available</div>
          </div>
        </div>
        <div className="mt-3 text-xs" style={{ color: C.ink2 }}>
          {dirOpenTasks > 0 ? <>📋 {dirOpenTasks} open tasks on her plate.</> : <>📋 No open tasks on Director.</>} {' '}
          {oldestPending >= 20 ? <span style={{ color: C.red, fontWeight: 600 }}>⚠ {oldestPending}d-old Step Up approval needs attention.</span> : <>Step Up collections on track.</>}
        </div>
      </Card>

      {/* OPEN DECISIONS */}
      <Card className="p-5">
        <SectionHead icon="📋" title="Open Decisions" sub="Items pending your action" />
        <div className="space-y-3">
          {pendingDecisions.map((d, i) => {
            const days = daysUntil(d.due);
            const tone = days < 0 ? 'red' : days <= 3 ? 'red' : days <= 7 ? 'orange' : 'amber';
            return (
              <div key={i} className="p-4 rounded-xl flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2" style={{ background: '#F9FAFC' }}>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm md:text-base" style={{ color: C.ink }}>{d.title}</div>
                  <div className="text-xs md:text-sm mt-1" style={{ color: C.ink3 }}>{d.detail}</div>
                </div>
                <Pill tone={tone}>Due {new Date(d.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Pill>
              </div>
            );
          })}
        </div>
      </Card>

      {/* UPCOMING EVENTS */}
      <Card className="p-5">
        <SectionHead icon="📅" title="Upcoming Events" sub="Next 60 days" />
        <div className="divide-y" style={{ borderColor: C.line }}>
          {events.map((e, i) => {
            const days = daysUntil(e.date);
            const tone = days <= 14 ? 'red' : days <= 28 ? 'amber' : 'green';
            return (
              <div key={i} className="py-3 flex items-center justify-between">
                <div className="font-bold text-sm md:text-base" style={{ color: C.ink }}>{e.name}</div>
                <div className="flex items-center gap-3">
                  <div className="text-xs md:text-sm" style={{ color: C.ink3 }}>{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <Pill tone={tone}>{days}d</Pill>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ─── OWNER: Enrollment (+ Targets + At Risk + Discounts) ──────────
const OwnerEnrollment = ({ classrooms, atRisk, setAtRisk, discounts }) => {
  const byProgram = ALL_PROGRAMS.map(p => {
    const rooms = classrooms.filter(c => c.program === p);
    return {
      program: p,
      enrolled: rooms.reduce((a, r) => a + r.enrolled, 0),
      capacity: rooms.reduce((a, r) => a + r.capacity, 0),
    };
  }).filter(p => p.capacity > 0);

  const total = classrooms.reduce((a, c) => a + c.enrolled, 0);
  const totalCap = classrooms.reduce((a, c) => a + c.capacity, 0);
  const preEnrolled = classrooms.filter(c => c.tier === 'preschool').reduce((a, c) => a + c.enrolled, 0);
  const k8Enrolled = classrooms.filter(c => c.tier === 'k8').reduce((a, c) => a + c.enrolled, 0);

  const activeRisk = atRisk.filter(r => r.status === 'intervening');
  const staleRisk = activeRisk.filter(r => daysSince(r.lastUpdated) > 7);
  const lostRisk = atRisk.filter(r => r.status === 'lost').length;
  const retainedRisk = atRisk.filter(r => r.status === 'retained').length;
  const discountTotal = discounts.reduce((a, d) => a + d.monthlyValue, 0);
  const discountPct = Math.round((discounts.length / total) * 100);

  const discountsByType = ['staff_child', 'sibling', 'hardship', 'other'].map(t => ({
    type: t.replace('_', ' '),
    count: discounts.filter(d => d.type === t).length,
    value: discounts.filter(d => d.type === t).reduce((a, d) => a + d.monthlyValue, 0),
  })).filter(g => g.count > 0);

  const updateRiskStatus = (id, status) => {
    const today = TODAY.toISOString().split('T')[0];
    setAtRisk(atRisk.map(x => x.id === id ? { ...x, status, lastUpdated: today } : x));
  };

  return (
    <div className="space-y-5">
      <SectionHead icon="👶" title="Enrollment" sub={`${total} students across ${classrooms.length} classrooms`} />

      {/* ENROLLMENT TARGETS — annual goals · % met */}
      <Card className="p-5" accent={C.blue}>
        <div className="flex items-start justify-between mb-4 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h3 className="text-lg font-bold" style={{ color: C.ink }}>Annual Enrollment Targets</h3>
            </div>
            <p className="text-sm mt-0.5" style={{ color: C.ink3 }}>Set each year · this dashboard tracks progress</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Total Enrollment',  actual: total,       target: ENROLLMENT_TARGETS.total,     color: C.blue },
            { label: 'Preschool',         actual: preEnrolled, target: ENROLLMENT_TARGETS.preschool, color: C.purple },
            { label: 'K–8',               actual: k8Enrolled,  target: ENROLLMENT_TARGETS.k8,        color: C.orange },
          ].map(t => {
            const pct = Math.round((t.actual / t.target) * 100);
            const met = pct >= 100;
            const close = pct >= 90 && pct < 100;
            const barColor = met ? C.green : close ? C.amber : C.red;
            const status = met ? 'Met ✓' : close ? `${100 - pct}% short` : `${100 - pct}% short`;
            return (
              <div key={t.label} className="p-4 rounded-xl" style={{ background: '#F9FAFC' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>{t.label}</div>
                  <Pill tone={met ? 'green' : close ? 'amber' : 'red'} size="xs">{status}</Pill>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold" style={{ color: t.color }}>{t.actual}</span>
                  <span className="text-sm" style={{ color: C.ink3 }}>/ {t.target}</span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] mb-1" style={{ color: C.ink3 }}>
                    <span>0</span>
                    <span className="font-bold">{pct}%</span>
                    <span>target</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: C.line }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* AT-RISK STUDENTS — prominent because they're time-sensitive */}
      <Card className="p-5" accent={activeRisk.length > 0 ? C.red : C.green}>
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} color={C.red} />
              <h3 className="text-lg font-bold" style={{ color: C.ink }}>At-Risk Students</h3>
            </div>
            <p className="text-sm mt-0.5" style={{ color: C.ink3 }}>Families signaling they may leave · intervene now</p>
          </div>
          <Pill tone={activeRisk.length > 0 ? 'red' : 'green'}>{activeRisk.length} active</Pill>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2 rounded-lg" style={{ background: C.redSoft }}>
            <div className="text-xl font-extrabold" style={{ color: C.red }}>{activeRisk.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: C.ink2 }}>Intervening</div>
          </div>
          <div className="p-2 rounded-lg" style={{ background: C.greenSoft }}>
            <div className="text-xl font-extrabold" style={{ color: C.green }}>{retainedRisk}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: C.ink2 }}>Retained</div>
          </div>
          <div className="p-2 rounded-lg" style={{ background: '#F9FAFC' }}>
            <div className="text-xl font-extrabold" style={{ color: C.ink3 }}>{lostRisk}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: C.ink2 }}>Lost</div>
          </div>
        </div>

        {/* Stale alert banner */}
        {staleRisk.length > 0 && (
          <div className="mb-3 p-3 rounded-xl flex items-center gap-2" style={{ background: C.redSoft, border: `1px solid ${C.red}` }}>
            <AlertTriangle size={16} color={C.red} />
            <div className="text-xs" style={{ color: C.ink }}>
              <span className="font-bold">{staleRisk.length} stale</span> · {staleRisk.length === 1 ? 'this case has' : 'these cases have'} not been touched in over 7 days. Status update needed.
            </div>
          </div>
        )}

        <div className="space-y-2">
          {activeRisk.map(r => {
            const days = daysSince(r.flagged);
            const daysSinceUpdate = daysSince(r.lastUpdated);
            const isStale = daysSinceUpdate > 7;
            return (
              <div key={r.id} className="p-3 rounded-xl" style={{
                background: isStale ? C.redSoft : '#F9FAFC',
                border: isStale ? `1px solid ${C.red}` : `1px solid transparent`,
              }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: C.ink }}>{r.student}</span>
                      <Pill tone="blue" size="xs">{r.grade}</Pill>
                      <Pill tone={r.reason === 'financial' ? 'amber' : r.reason === 'transferring' ? 'orange' : 'neutral'} size="xs">{r.reason}</Pill>
                      {isStale && <Pill tone="red" size="xs">⏰ stale {daysSinceUpdate}d</Pill>}
                    </div>
                    <div className="text-xs mt-1" style={{ color: C.ink2 }}>{r.detail}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>Flagged {r.flagged} · {days}d ago · last touched {daysSinceUpdate}d ago</div>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {['intervening', 'retained', 'lost'].map(s => (
                    <button key={s} onClick={() => updateRiskStatus(r.id, s)}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                      style={{ background: r.status === s ? C.red : '#EEF1F6', color: r.status === s ? '#FFF' : C.ink2 }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {activeRisk.length === 0 && (
            <div className="py-6 text-center text-sm" style={{ color: C.ink3 }}>✓ No active at-risk students. All families current.</div>
          )}
        </div>
      </Card>

      {/* DISCOUNTS / WAIVED TUITION */}
      <Card className="p-5" accent="#0EA5E9">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏷️</span>
              <h3 className="text-lg font-bold" style={{ color: C.ink }}>Discounts & Waived Tuition</h3>
            </div>
            <p className="text-sm mt-0.5" style={{ color: C.ink3 }}>Who's getting a break and how much it costs</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-xl" style={{ background: '#F9FAFC' }}>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Students</div>
            <div className="text-2xl font-extrabold mt-1" style={{ color: '#0EA5E9' }}>{discounts.length}</div>
            <div className="text-[10px]" style={{ color: C.ink3 }}>{discountPct}% of school</div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: '#F9FAFC' }}>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Monthly $</div>
            <div className="text-2xl font-extrabold mt-1" style={{ color: C.orange }}>{fmtMoneyShort(discountTotal)}</div>
            <div className="text-[10px]" style={{ color: C.ink3 }}>given away</div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: '#F9FAFC' }}>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Annualized</div>
            <div className="text-2xl font-extrabold mt-1" style={{ color: C.orange }}>{fmtMoneyShort(discountTotal * 10)}</div>
            <div className="text-[10px]" style={{ color: C.ink3 }}>10-month year</div>
          </div>
        </div>

        <div className="space-y-2">
          {discountsByType.map(g => (
            <div key={g.type} className="p-3 rounded-xl flex items-center justify-between" style={{ background: '#F9FAFC' }}>
              <div>
                <div className="font-bold text-sm capitalize" style={{ color: C.ink }}>{g.type}</div>
                <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{g.count} students</div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-sm" style={{ color: C.ink }}>{fmtMoney(g.value)}/mo</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* By-program chart (existing) */}
      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>By Program</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byProgram}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="program" tick={{ fontSize: 10, fill: C.ink2 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.ink3 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }} />
            <Bar dataKey="capacity" fill="#E5E8F0" radius={[4, 4, 0, 0]} name="Capacity" />
            <Bar dataKey="enrolled" fill={C.blue} radius={[4, 4, 0, 0]} name="Enrolled" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Total Enrolled</div>
          <div className="text-3xl font-extrabold mt-1" style={{ color: C.blue }}>{total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Open Seats</div>
          <div className="text-3xl font-extrabold mt-1" style={{ color: C.green }}>{totalCap - total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>YTD Growth</div>
          <div className="text-3xl font-extrabold mt-1" style={{ color: C.green }}>+9%</div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Detail by Program</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: C.ink3 }}>
                <th className="text-left py-2 text-xs font-bold uppercase tracking-wider">Program</th>
                <th className="text-right py-2 text-xs font-bold uppercase tracking-wider">Enrolled</th>
                <th className="text-right py-2 text-xs font-bold uppercase tracking-wider">Capacity</th>
                <th className="text-right py-2 text-xs font-bold uppercase tracking-wider">Open</th>
              </tr>
            </thead>
            <tbody>
              {byProgram.map(p => (
                <tr key={p.program} className="border-t" style={{ borderColor: C.line }}>
                  <td className="py-3 font-semibold" style={{ color: C.ink }}>{p.program}</td>
                  <td className="py-3 text-right font-semibold" style={{ color: C.ink }}>{p.enrolled}</td>
                  <td className="py-3 text-right" style={{ color: C.ink2 }}>{p.capacity}</td>
                  <td className="py-3 text-right font-semibold" style={{ color: p.capacity - p.enrolled === 0 ? C.red : C.green }}>{p.capacity - p.enrolled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ─── OWNER: Classrooms (PROFITABILITY + PERFORMANCE) ─────────────
const OwnerClassrooms = ({ classrooms }) => {
  const [tierFilter, setTierFilter] = useState('all');
  const list = tierFilter === 'all' ? classrooms : classrooms.filter(c => c.tier === tierFilter);

  // Mini chart data: monthly profit per classroom (sorted)
  const profitData = list.map(c => {
    const econ = classroomEconomics(c);
    return { name: c.program, profit: econ.monthlyProfit };
  });

  const totalProfit = list.reduce((a, c) => a + classroomEconomics(c).monthlyProfit, 0);
  const profitable = list.filter(c => classroomEconomics(c).monthlyProfit > 0).length;
  const losing = list.length - profitable;

  return (
    <div className="space-y-5">
      <SectionHead icon="🏫" title="Classrooms — P&L + Performance" sub="Is this class profitable? Is the teacher keeping kids and delivering results?" />

      {/* Tier filter */}
      <div className="flex gap-2">
        {[{ id: 'all', label: 'All' }, { id: 'preschool', label: 'Preschool' }, { id: 'k8', label: 'K–8' }].map(f => (
          <button key={f.id} onClick={() => setTierFilter(f.id)} className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: tierFilter === f.id ? C.blue : C.card, color: tierFilter === f.id ? '#FFF' : C.ink, border: `1px solid ${tierFilter === f.id ? C.blue : C.line}` }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* P&L summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4" accent={totalProfit > 0 ? C.green : C.red}>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Net (Monthly)</div>
          <div className="text-2xl md:text-3xl font-extrabold mt-1" style={{ color: totalProfit > 0 ? C.green : C.red }}>
            {totalProfit < 0 ? '-' : ''}{fmtMoneyShort(Math.abs(totalProfit))}
          </div>
        </Card>
        <Card className="p-4" accent={C.green}>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Profitable</div>
          <div className="text-2xl md:text-3xl font-extrabold mt-1" style={{ color: C.green }}>{profitable}</div>
        </Card>
        <Card className="p-4" accent={C.red}>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Losing</div>
          <div className="text-2xl md:text-3xl font-extrabold mt-1" style={{ color: C.red }}>{losing}</div>
        </Card>
      </div>

      {/* Mini chart: profit per classroom */}
      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Monthly Profit by Classroom ($)</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={profitData}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.ink2 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.ink3 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v / 1000).toFixed(0) + 'K'} />
            <Tooltip formatter={v => fmtMoney(v)} contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }} />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
              {profitData.map((d, i) => <Cell key={i} fill={d.profit > 0 ? C.green : C.red} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Classroom cards with full picture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map(c => {
          const econ = classroomEconomics(c);
          const profitable = econ.monthlyProfit > 0;
          const fillPct = Math.round((c.enrolled / c.capacity) * 100);
          // Performance signals
          const nweaBenchmark = NWEA_BENCHMARK[c.program];
          const nweaDelta = c.nweaMap && nweaBenchmark ? c.nweaMap - nweaBenchmark : null;
          const nweaTone = nweaDelta === null ? 'neutral' : nweaDelta >= 5 ? 'green' : nweaDelta >= -3 ? 'amber' : 'red';
          // K-8: incidents · Preschool: withdrawals
          const performanceSignal = c.tier === 'k8'
            ? { label: 'Incidents YTD', value: c.incidents, tone: c.incidents === 0 ? 'green' : c.incidents <= 2 ? 'amber' : 'red' }
            : { label: 'Withdrawals YTD', value: c.withdrawals, tone: c.withdrawals === 0 ? 'green' : c.withdrawals <= 1 ? 'amber' : 'red' };

          return (
            <Card key={c.id} className="p-5" accent={profitable ? C.green : C.red}>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <div className="font-bold" style={{ color: C.ink }}>{c.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{c.teacher}</div>
                </div>
                <Pill tone={profitable ? 'green' : 'red'} size="xs">{profitable ? 'Profitable' : 'Losing'}</Pill>
              </div>

              {/* Profit hero with YoY delta */}
              <div className="p-3 rounded-xl mb-3" style={{ background: profitable ? C.greenSoft : C.redSoft }}>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Monthly Net</span>
                      {(() => {
                        const d = yoyDelta(econ.monthlyProfit, c.lastYear?.monthlyProfit, true);
                        return d && <span className="text-[10px] font-bold" style={{ color: d.color }}>{d.arrow} {fmtMoneyShort(Math.abs(econ.monthlyProfit - c.lastYear.monthlyProfit))} vs LY</span>;
                      })()}
                    </div>
                    <div className="text-2xl font-extrabold mt-0.5" style={{ color: profitable ? C.green : C.red }}>
                      {econ.monthlyProfit < 0 ? '-' : ''}{fmtMoney(Math.abs(econ.monthlyProfit))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Margin</div>
                    <div className="text-2xl font-extrabold mt-0.5" style={{ color: profitable ? C.green : C.red }}>{econ.margin}%</div>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs" style={{ color: C.ink3 }}>
                  <span>Rev {fmtMoney(econ.monthlyRevenue)}</span>
                  <span>Cost {fmtMoney(c.monthlyCost)}</span>
                </div>
              </div>

              {/* Full picture grid: fill, performance signal, NWEA (k8 only) */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg" style={{ background: '#F9FAFC' }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Fill</div>
                  <div className="text-lg font-extrabold mt-0.5" style={{ color: fillPct >= 95 ? C.red : fillPct >= 85 ? C.amber : C.green }}>
                    {fillPct}%
                  </div>
                  <div className="text-[10px] flex items-center gap-1" style={{ color: C.ink3 }}>
                    <span>{c.enrolled}/{c.capacity}</span>
                    {(() => {
                      const d = yoyDelta(c.enrolled, c.lastYear?.enrolled, true);
                      return d && <span style={{ color: d.color, fontWeight: 600 }}>{d.arrow}{d.text}</span>;
                    })()}
                  </div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: '#F9FAFC' }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>{performanceSignal.label}</div>
                  <div className="text-lg font-extrabold mt-0.5" style={{
                    color: performanceSignal.tone === 'green' ? C.green : performanceSignal.tone === 'amber' ? C.amber : C.red,
                  }}>{performanceSignal.value}</div>
                  <div className="text-[10px] flex items-center gap-1" style={{ color: C.ink3 }}>
                    <span>{c.tier === 'k8' ? 'this room' : 'kids who left'}</span>
                    {(() => {
                      const ly = c.tier === 'k8' ? c.lastYear?.incidents : c.lastYear?.withdrawals;
                      const cur = c.tier === 'k8' ? c.incidents : c.withdrawals;
                      const d = yoyDelta(cur, ly, false);
                      return d && <span style={{ color: d.color, fontWeight: 600 }}>{d.arrow}{d.text}</span>;
                    })()}
                  </div>
                </div>
                {c.tier === 'k8' ? (
                  <div className="p-2 rounded-lg" style={{ background: '#F9FAFC' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>NWEA MAP</div>
                    <div className="text-lg font-extrabold mt-0.5" style={{
                      color: nweaTone === 'green' ? C.green : nweaTone === 'amber' ? C.amber : C.red,
                    }}>{c.nweaMap}</div>
                    <div className="text-[10px] flex items-center gap-1 flex-wrap" style={{ color: C.ink3 }}>
                      <span>{nweaDelta !== null && (nweaDelta >= 0 ? '+' : '') + nweaDelta + ' bench'}</span>
                      {(() => {
                        const d = yoyDelta(c.nweaMap, c.lastYear?.nweaMap, true);
                        return d && <span style={{ color: d.color, fontWeight: 600 }}>{d.arrow}{d.text}</span>;
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg" style={{ background: '#F9FAFC' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Tier</div>
                    <div className="text-sm font-extrabold mt-1" style={{ color: C.ink2 }}>Preschool</div>
                  </div>
                )}
              </div>

              {/* Verdict line */}
              <div className="mt-3 pt-3 text-xs" style={{ borderTop: `1px solid ${C.line}`, color: C.ink2 }}>
                {!profitable && <span style={{ color: C.red, fontWeight: 600 }}>⚠ Losing money. </span>}
                {c.tier === 'k8' && c.incidents > 2 && <span style={{ color: C.red, fontWeight: 600 }}>⚠ High incident count. </span>}
                {c.tier === 'preschool' && c.withdrawals > 1 && <span style={{ color: C.red, fontWeight: 600 }}>⚠ Losing kids. </span>}
                {c.tier === 'k8' && nweaDelta !== null && nweaDelta < -3 && <span style={{ color: C.red, fontWeight: 600 }}>⚠ Below benchmark. </span>}
                {profitable && (c.tier === 'k8' ? (c.incidents <= 2 && (nweaDelta === null || nweaDelta >= 0)) : c.withdrawals === 0) && (
                  <span style={{ color: C.green, fontWeight: 600 }}>✓ Healthy across the board.</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ─── OWNER: Compliance ───────────────────────────────────────────
const OwnerCompliance = ({ compliance }) => {
  const counts = {
    compliant: compliance.filter(c => c.status === 'compliant').length,
    expiring: compliance.filter(c => c.status === 'expiring').length,
    expired: compliance.filter(c => c.status === 'expired').length,
  };
  const pieData = [
    { name: 'Current', value: counts.compliant, color: C.green },
    { name: 'Expiring', value: counts.expiring, color: C.amber },
    { name: 'Expired', value: counts.expired, color: C.red },
  ];

  const regulatory = compliance.filter(c => c.category === 'regulatory' || !c.category);
  const insurance = compliance.filter(c => c.category === 'insurance');
  const contracts = compliance.filter(c => c.category === 'contract');

  // Insurance: shop rates ~60 days before renewal
  const insuranceShopAlerts = insurance.filter(c => {
    if (!c.shopReminder) return false;
    return daysUntil(c.shopReminder) <= 30 && daysUntil(c.expires) > 0;
  });

  const renderItem = (c, showShop = false) => (
    <div key={c.id} className="py-3 flex items-center justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className="font-bold text-sm" style={{ color: C.ink }}>{c.item}</div>
        <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>
          {c.authority} · expires {c.expires}
          {showShop && c.shopReminder && daysUntil(c.shopReminder) <= 60 && daysUntil(c.expires) > 0 && (
            <span className="ml-2" style={{ color: C.amber, fontWeight: 600 }}>· Shop rates by {c.shopReminder}</span>
          )}
        </div>
      </div>
      <Pill tone={c.status === 'compliant' ? 'green' : c.status === 'expired' ? 'red' : 'amber'}>{c.status}</Pill>
    </div>
  );

  return (
    <div className="space-y-5">
      <SectionHead icon="✅" title="Compliance & Contracts" sub="Regulatory, insurance & vendor agreements" />

      <div className="grid md:grid-cols-3 gap-3">
        <Card className="p-5">
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.ink2 }}>Status Mix</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={36} outerRadius={56} paddingAngle={2}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 text-xs mt-2">
            {pieData.map(d => (
              <span key={d.name} className="flex items-center gap-1" style={{ color: C.ink2 }}>
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} /> {d.name} {d.value}
              </span>
            ))}
          </div>
        </Card>
        <Card className="p-5" accent={C.amber}>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>Expiring Soon</div>
          <div className="text-5xl font-extrabold mt-2" style={{ color: C.amber }}>{counts.expiring}</div>
          <div className="text-xs mt-1" style={{ color: C.ink3 }}>within 60 days</div>
        </Card>
        <Card className="p-5" accent={counts.expired ? C.red : C.green}>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>Expired</div>
          <div className="text-5xl font-extrabold mt-2" style={{ color: counts.expired ? C.red : C.green }}>{counts.expired}</div>
          <div className="text-xs mt-1" style={{ color: C.ink3 }}>{counts.expired ? 'Action required' : 'All good'}</div>
        </Card>
      </div>

      {/* Shop-rates reminders banner */}
      {insuranceShopAlerts.length > 0 && (
        <Card className="p-4" accent={C.amber} style={{ background: C.amberSoft }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff' }}>
              <AlertTriangle size={18} color={C.amber} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: C.amber }}>Shop Rates Now</div>
              <div className="text-sm font-bold mt-1" style={{ color: C.ink }}>{insuranceShopAlerts.length} insurance {insuranceShopAlerts.length === 1 ? 'policy renews' : 'policies renew'} soon</div>
              <div className="text-xs mt-1" style={{ color: C.ink2 }}>
                {insuranceShopAlerts.map(c => c.item).join(' · ')}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Regulatory section */}
      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Regulatory & Inspections</div>
        <div className="divide-y" style={{ borderColor: C.line }}>
          {regulatory.map(c => renderItem(c))}
        </div>
      </Card>

      {/* Insurance section */}
      <Card className="p-5" accent={C.blue}>
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>Insurance Policies</div>
          <div className="text-[10px]" style={{ color: C.ink3 }}>Shop rates 60 days before renewal</div>
        </div>
        <div className="divide-y" style={{ borderColor: C.line }}>
          {insurance.map(c => renderItem(c, true))}
        </div>
      </Card>

      {/* Contracts section */}
      <Card className="p-5" accent={C.purple}>
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Vendor Contracts & Lease</div>
        <div className="divide-y" style={{ borderColor: C.line }}>
          {contracts.map(c => renderItem(c))}
        </div>
      </Card>
    </div>
  );
};

// ─── OWNER: Tasks (split by owner vs director) ──────────────────
const OwnerTasks = ({ tasks }) => {
  const [filter, setFilter] = useState('all'); // all | owner | director
  const list = filter === 'all' ? tasks : tasks.filter(t => t.assignee === filter);
  const open = list.filter(t => t.status !== 'done');
  const high = open.filter(t => t.priority === 'high');

  const ownerOpen = tasks.filter(t => t.assignee === 'owner' && t.status !== 'done').length;
  const dirOpen = tasks.filter(t => t.assignee === 'director' && t.status !== 'done').length;

  const splitData = [
    { name: 'Owner Open',    value: tasks.filter(t => t.assignee === 'owner'    && t.status === 'open').length,        color: C.red },
    { name: 'Owner WIP',     value: tasks.filter(t => t.assignee === 'owner'    && t.status === 'in_progress').length, color: C.amber },
    { name: 'Owner Done',    value: tasks.filter(t => t.assignee === 'owner'    && t.status === 'done').length,        color: C.green },
    { name: 'Director Open', value: tasks.filter(t => t.assignee === 'director' && t.status === 'open').length,        color: C.red },
    { name: 'Director WIP',  value: tasks.filter(t => t.assignee === 'director' && t.status === 'in_progress').length, color: C.amber },
    { name: 'Director Done', value: tasks.filter(t => t.assignee === 'director' && t.status === 'done').length,        color: C.green },
  ];

  return (
    <div className="space-y-5">
      <SectionHead icon="📋" title="Tasks" sub={`${ownerOpen} on you · ${dirOpen} on Director · ${high.length} high priority`} />

      {/* Owner vs Director split */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4" accent={C.blue}>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>On You (Owner)</div>
          <div className="text-3xl font-extrabold mt-1" style={{ color: C.blue }}>{ownerOpen}</div>
          <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>open · {tasks.filter(t => t.assignee === 'owner' && t.priority === 'high' && t.status !== 'done').length} high</div>
        </Card>
        <Card className="p-4" accent={C.purple}>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>On Director</div>
          <div className="text-3xl font-extrabold mt-1" style={{ color: C.purple }}>{dirOpen}</div>
          <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>open · {tasks.filter(t => t.assignee === 'director' && t.priority === 'high' && t.status !== 'done').length} high</div>
        </Card>
      </div>

      {/* Status chart */}
      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Status Split</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={splitData}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: C.ink2 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: C.ink3 }} axisLine={false} tickLine={false} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {splitData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Filter */}
      <div className="flex gap-2">
        {[{ id: 'all', label: 'All' }, { id: 'owner', label: 'On You' }, { id: 'director', label: 'On Director' }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: filter === f.id ? C.blue : C.card, color: filter === f.id ? '#FFF' : C.ink, border: `1px solid ${filter === f.id ? C.blue : C.line}` }}>
            {f.label}
          </button>
        ))}
      </div>

      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Tasks</div>
        <div className="space-y-2">
          {list.map(t => (
            <div key={t.id} className="p-3 rounded-xl flex items-center justify-between gap-2" style={{ background: '#F9FAFC' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: t.status === 'done' ? C.greenSoft : t.status === 'in_progress' ? C.amberSoft : C.redSoft }}>
                  {t.status === 'done' ? <CheckCircle2 size={16} color={C.green} /> : <Clock size={16} color={t.status === 'in_progress' ? C.amber : C.red} />}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm" style={{ color: C.ink, textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title}</div>
                  <div className="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: C.ink3 }}>
                    <Pill tone={t.assignee === 'owner' ? 'blue' : 'purple'} size="xs">{t.assignee}</Pill>
                    <span>Due {new Date(t.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <Pill tone={t.priority === 'high' ? 'red' : t.priority === 'medium' ? 'amber' : 'neutral'}>{t.priority}</Pill>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── OWNER: Maintenance ──────────────────────────────────────────
const PRIORITY_TONE = { critical: 'red', high: 'orange', medium: 'amber', low: 'neutral' };

const OwnerMaintenance = ({ maintenance }) => {
  const open = maintenance.filter(m => m.status !== 'done');
  const byPriority = ['critical', 'high', 'medium', 'low'].map(p => ({
    priority: p,
    count: maintenance.filter(m => m.priority === p && m.status !== 'done').length,
    cost: maintenance.filter(m => m.priority === p && m.status !== 'done').reduce((a, m) => a + m.estCost, 0),
  }));

  return (
    <div className="space-y-5">
      <SectionHead icon="🔧" title="Maintenance" sub={`${open.length} open requests · ${fmtMoney(open.reduce((a,m)=>a+m.estCost,0))} estimated`} />

      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Open Requests by Priority</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={byPriority}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="priority" tick={{ fontSize: 11, fill: C.ink2 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: C.ink3 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {byPriority.map((d, i) => <Cell key={i} fill={{critical:C.red, high:C.orange, medium:C.amber, low:C.ink4}[d.priority]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>All Requests</div>
        <div className="space-y-2">
          {maintenance.map(m => (
            <div key={m.id} className="p-3 rounded-xl flex items-center justify-between gap-2" style={{ background: '#F9FAFC' }}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Pill tone={PRIORITY_TONE[m.priority]} size="xs">{m.priority}</Pill>
                  <span className="font-bold text-sm" style={{ color: C.ink }}>{m.issue}</span>
                </div>
                <div className="text-xs mt-1" style={{ color: C.ink3 }}>{m.location} · logged {m.logged} · est. {fmtMoney(m.estCost)}</div>
              </div>
              <Pill tone={m.status === 'done' ? 'green' : m.status === 'in_progress' ? 'amber' : 'neutral'}>{m.status.replace('_', ' ')}</Pill>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── OWNER: Budget (consumption gauge → category pie → line items) ─
const OwnerBudget = ({ directorExpenses }) => {
  const [view, setView] = useState('gauge'); // gauge | categories | lineItems
  const [selectedCategory, setSelectedCategory] = useState(null);

  const directorSpent = directorExpenses.reduce((a, e) => a + e.amount, 0);
  const categories = SCHOOL_BUDGET_CATEGORIES.map(c => ({
    ...c,
    spent: c.name === "Director's Discretionary" ? directorSpent : c.spent,
  }));
  const totalSpent = categories.reduce((a, c) => a + c.spent, 0);
  const pct = Math.round((totalSpent / SCHOOL_BUDGET_TOTAL) * 100);

  const gaugeColor = pct < 50 ? C.green : pct < 75 ? C.amber : pct < 90 ? C.orange : C.red;

  // Compose AI-categorized line items including director's expenses tagged via keyword
  const directorLineItems = directorExpenses.map(e => ({
    ...e,
    category: categorize(e.description),
    source: 'director',
  }));

  if (view === 'lineItems' && selectedCategory) {
    let items;
    if (selectedCategory === "Director's Discretionary") {
      items = directorLineItems;
    } else {
      // Synthesize a few example line items for non-director categories
      const cat = categories.find(c => c.name === selectedCategory);
      const seedItems = {
        'Payroll & Benefits': [
          { description: 'Teacher salaries — April', amount: 165000, date: '2026-04-30' },
          { description: 'Benefits & insurance', amount: 24000, date: '2026-04-30' },
        ],
        'Facilities & Rent': [
          { description: 'Building lease — April', amount: 18500, date: '2026-04-01' },
          { description: 'HVAC service contract', amount: 1800, date: '2026-04-15' },
        ],
        'Curriculum & Books': [
          { description: 'Math textbooks — Grade 3', amount: 4200, date: '2026-03-22' },
          { description: 'Reading workbooks', amount: 1850, date: '2026-04-05' },
        ],
        'Insurance': [
          { description: 'Liability premium — Q2', amount: 9500, date: '2026-04-01' },
        ],
        'Marketing & Admissions': [
          { description: 'Open house event materials', amount: 850, date: '2026-04-12' },
          { description: 'Online ads — April', amount: 1200, date: '2026-04-30' },
        ],
        'Tech & Equipment': [
          { description: 'Chromebook replacements (4)', amount: 1600, date: '2026-04-08' },
          { description: 'WiFi access points', amount: 950, date: '2026-04-19' },
        ],
        'Utilities': [
          { description: 'Electric — April', amount: 3800, date: '2026-05-01' },
          { description: 'Water & sewer — April', amount: 720, date: '2026-05-01' },
        ],
      };
      items = seedItems[selectedCategory] || [];
    }

    return (
      <div className="space-y-5">
        <SectionHead icon="💰" title={selectedCategory} sub="Line items" action={
          <Btn kind="ghost" onClick={() => { setView('categories'); setSelectedCategory(null); }} icon={X}>Close</Btn>
        } />
        <Card className="p-5">
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="p-3 rounded-xl flex items-center justify-between gap-2" style={{ background: '#F9FAFC' }}>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm" style={{ color: C.ink }}>{it.description}</div>
                  <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: C.ink3 }}>
                    {it.date}
                    {it.source === 'director' && <Pill tone="purple" size="xs"><Sparkles size={9} /> AI-tagged</Pill>}
                  </div>
                </div>
                <div className="font-extrabold text-sm" style={{ color: C.ink }}>{fmtMoney(it.amount)}</div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="py-8 text-center text-sm" style={{ color: C.ink3 }}>No line items recorded yet.</div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (view === 'categories') {
    const pieData = categories.map(c => ({ name: c.name, value: c.spent, color: CATEGORY_COLORS[c.name] || C.blue }));
    return (
      <div className="space-y-5">
        <SectionHead icon="💰" title="Budget by Category" sub="Tap any category to see line items" action={
          <Btn kind="ghost" onClick={() => setView('gauge')} icon={ChevronDown}>Overview</Btn>
        } />
        <Card className="p-5">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={2} onClick={(d) => { setSelectedCategory(d.name); setView('lineItems'); }}>
                {pieData.map((d, i) => <Cell key={i} fill={CATEGORY_COLORS[d.name] || C.blue} style={{ cursor: 'pointer' }} />)}
              </Pie>
              <Tooltip formatter={(v) => fmtMoney(v)} contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Categories</div>
          <div className="space-y-2">
            {categories.map(c => {
              const catPct = Math.round((c.spent / c.budget) * 100);
              return (
                <button key={c.name} onClick={() => { setSelectedCategory(c.name); setView('lineItems'); }} className="w-full p-3 rounded-xl flex items-center gap-3 hover:opacity-80 transition-opacity text-left" style={{ background: '#F9FAFC' }}>
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[c.name] || C.blue }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm" style={{ color: C.ink }}>{c.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{fmtMoney(c.spent)} of {fmtMoney(c.budget)} · {catPct}%</div>
                  </div>
                  <ChevronRight size={16} color={C.ink3} />
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // Default: consumption gauge
  return (
    <div className="space-y-5">
      <SectionHead icon="💰" title="Budget" sub={`Annual: ${fmtMoneyShort(SCHOOL_BUDGET_TOTAL)} · Aug–May`} />

      <Card className="p-6" onClick={() => setView('categories')}>
        <div className="text-xs font-bold uppercase tracking-wider mb-1 text-center" style={{ color: C.ink2 }}>Consumption</div>
        <div className="text-xs text-center mb-4" style={{ color: C.ink3 }}>Tap to see categories</div>
        <div className="relative flex flex-col items-center">
          <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart innerRadius="65%" outerRadius="100%" data={[{ value: pct, fill: gaugeColor }]} startAngle={90} endAngle={-270}>
              <RadialBar background={{ fill: '#EEF1F6' }} dataKey="value" cornerRadius={20} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="-mt-[170px] text-center">
            <div className="text-6xl font-extrabold leading-none" style={{ color: gaugeColor }}>{pct}<span className="text-3xl">%</span></div>
            <div className="text-xs mt-2 font-semibold uppercase tracking-wider" style={{ color: C.ink3 }}>of annual budget</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Spent</div>
            <div className="text-xl font-extrabold mt-1" style={{ color: C.ink }}>{fmtMoney(totalSpent)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Remaining</div>
            <div className="text-xl font-extrabold mt-1" style={{ color: C.green }}>{fmtMoney(SCHOOL_BUDGET_TOTAL - totalSpent)}</div>
          </div>
        </div>
      </Card>

      <Btn kind="primary" onClick={() => setView('categories')} icon={ChevronRight}>See category breakdown</Btn>
    </div>
  );
};

// ─── OWNER: Scholarships + Step Up Approvals ─────────────────────
const OwnerScholarships = ({ stepUp }) => {
  const total = initialScholarships.reduce((a, s) => a + s.awarded, 0);
  const students = initialScholarships.reduce((a, s) => a + s.students, 0);

  // Step Up approval pipeline analysis
  const pending = stepUp.filter(s => s.status === 'pending');
  const approved = stepUp.filter(s => s.status === 'approved');

  const pendingByAge = {
    fresh: pending.filter(s => daysSince(s.sent) < 7).length,        // < 7 days, green
    aging: pending.filter(s => daysSince(s.sent) >= 7 && daysSince(s.sent) < 14).length, // 7-13 days, amber
    stale: pending.filter(s => daysSince(s.sent) >= 14 && daysSince(s.sent) < 20).length, // 14-19, orange
    redflag: pending.filter(s => daysSince(s.sent) >= 20).length,    // 20+, red
  };

  const turnaroundTimes = approved.map(s => Math.round((new Date(s.approvedOn) - new Date(s.sent)) / 86400000));
  const avgTurnaround = turnaroundTimes.length ? Math.round(turnaroundTimes.reduce((a, b) => a + b, 0) / turnaroundTimes.length) : 0;
  const fastApproval = turnaroundTimes.filter(t => t <= 14).length;
  const turnaroundPct = turnaroundTimes.length ? Math.round((fastApproval / turnaroundTimes.length) * 100) : 100;

  const sortedPending = [...pending].sort((a, b) => daysSince(b.sent) - daysSince(a.sent));

  return (
    <div className="space-y-5">
      <SectionHead icon="🎓" title="Scholarships" sub={`${students} students · ${fmtMoney(total)} awarded YTD`} />

      {/* STEP UP COLLECTION PIPELINE — the high-anxiety section */}
      <Card className="p-5" accent={pendingByAge.redflag > 0 ? C.red : pendingByAge.stale > 0 ? C.orange : C.green}>
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-bold" style={{ color: C.ink }}>Step Up Payment Approvals</h3>
            <p className="text-sm mt-0.5" style={{ color: C.ink3 }}>Parents must approve each payment in Step Up portal · Director chases weekly</p>
          </div>
          <Pill tone={pendingByAge.redflag > 0 ? 'red' : 'amber'}>{pending.length} pending</Pill>
        </div>

        {/* Turnaround summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="p-3 rounded-xl text-center" style={{ background: C.greenSoft }}>
            <div className="text-2xl font-extrabold" style={{ color: C.green }}>{pendingByAge.fresh}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: C.ink2 }}>&lt; 7 days</div>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: C.amberSoft }}>
            <div className="text-2xl font-extrabold" style={{ color: C.amber }}>{pendingByAge.aging}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: C.ink2 }}>7–13 days</div>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: C.orangeSoft }}>
            <div className="text-2xl font-extrabold" style={{ color: C.orange }}>{pendingByAge.stale}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: C.ink2 }}>14–19 days</div>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: C.redSoft }}>
            <div className="text-2xl font-extrabold" style={{ color: C.red }}>{pendingByAge.redflag}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: C.ink2 }}>20+ days 🚩</div>
          </div>
        </div>

        {/* Director's performance signal */}
        <div className="p-3 rounded-xl mb-4 flex items-center justify-between" style={{ background: '#F9FAFC' }}>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Director Turnaround</div>
            <div className="text-sm mt-0.5" style={{ color: C.ink2 }}>
              Avg {avgTurnaround} days to approval · {turnaroundPct}% closed within 14 days
            </div>
          </div>
          <Pill tone={turnaroundPct >= 75 ? 'green' : turnaroundPct >= 50 ? 'amber' : 'red'}>
            {turnaroundPct >= 75 ? 'On track' : turnaroundPct >= 50 ? 'Slipping' : 'Behind'}
          </Pill>
        </div>

        {/* Pending list — oldest first */}
        <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.ink2 }}>Pending Approvals (Oldest First)</div>
        <div className="space-y-2">
          {sortedPending.map(s => {
            const days = daysSince(s.sent);
            const tone = days >= 20 ? 'red' : days >= 14 ? 'orange' : days >= 7 ? 'amber' : 'green';
            return (
              <div key={s.id} className="p-3 rounded-xl flex items-center justify-between gap-2" style={{ background: '#F9FAFC' }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: C.ink }}>{s.parent}</span>
                    <Pill tone="blue" size="xs">{s.grade}</Pill>
                    <span className="text-xs" style={{ color: C.ink3 }}>· {s.student}</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: C.ink3 }}>
                    Sent {s.sent} · last contact {s.lastContact}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-extrabold" style={{ color: C.ink }}>{fmtMoney(s.amount)}</div>
                  <Pill tone={tone} size="xs">{days}d open</Pill>
                </div>
              </div>
            );
          })}
          {sortedPending.length === 0 && (
            <div className="py-6 text-center text-sm" style={{ color: C.ink3 }}>✓ All approvals cleared. Great work.</div>
          )}
        </div>
      </Card>

      {/* Awards by program (existing) */}
      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Awards by Program ($)</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={initialScholarships}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="program" tick={{ fontSize: 11, fill: C.ink2 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.ink3 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v/1000) + 'K'} />
            <Tooltip formatter={v => fmtMoney(v)} contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }} />
            <Bar dataKey="awarded" fill={C.amber} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Programs</div>
        <div className="divide-y" style={{ borderColor: C.line }}>
          {initialScholarships.map(s => (
            <div key={s.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm" style={{ color: C.ink }}>{s.program}</div>
                <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{s.students} students</div>
              </div>
              <div className="font-extrabold text-sm" style={{ color: C.amber }}>{fmtMoney(s.awarded)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── OWNER: Staff ────────────────────────────────────────────────
const OwnerStaff = ({ staff }) => {
  const counts = {
    present: staff.filter(s => s.today === 'present').length,
    late: staff.filter(s => s.today === 'late').length,
    callout: staff.filter(s => s.today === 'callout').length,
  };
  const data = [
    { name: 'Present', value: counts.present, color: C.green },
    { name: 'Late', value: counts.late, color: C.amber },
    { name: 'Out', value: counts.callout, color: C.red },
  ];
  return (
    <div className="space-y-5">
      <SectionHead icon="👥" title="Staff" sub={`${staff.length} total · ${counts.present} present today`} />

      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Today's Attendance</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 10, fill: C.ink3 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: C.ink2 }} axisLine={false} tickLine={false} width={70} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Roster</div>
        <div className="divide-y" style={{ borderColor: C.line }}>
          {staff.map(s => (
            <div key={s.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm" style={{ color: C.ink }}>{s.name}</div>
                <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{s.role}</div>
              </div>
              <Pill tone={s.today === 'present' ? 'green' : s.today === 'late' ? 'amber' : 'red'}>{s.today}</Pill>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── OWNER: Waitlist (TWO BIG NUMBERS + bar chart) ───────────────
const OwnerWaitlist = ({ waitlist, classrooms }) => {
  const preschoolCount = waitlist.filter(w => PRESCHOOL_PROGRAMS.includes(w.program)).length;
  const k8Count = waitlist.filter(w => K8_PROGRAMS.includes(w.program)).length;

  const preschoolOpen = classrooms.filter(c => PRESCHOOL_PROGRAMS.includes(c.program)).reduce((a, c) => a + (c.capacity - c.enrolled), 0);
  const k8Open = classrooms.filter(c => K8_PROGRAMS.includes(c.program)).reduce((a, c) => a + (c.capacity - c.enrolled), 0);

  const byProgram = ALL_PROGRAMS.map(p => {
    const items = waitlist.filter(w => w.program === p);
    const days = items.map(w => daysSince(w.dateAdded));
    const avg = days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0;
    return { program: p, count: items.length, avgWait: avg };
  }).filter(p => p.count > 0);

  return (
    <div className="space-y-5">
      <SectionHead icon="📝" title="Waitlist" sub="High-level view · two categories" />

      {/* TWO BIG NUMBERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card accent={C.purple} className="p-6">
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.ink2 }}>👶 Preschool</div>
          <div className="flex items-baseline gap-3 mt-2">
            <div className="text-6xl font-extrabold leading-none" style={{ color: C.purple }}>{preschoolCount}</div>
            <div className="text-sm" style={{ color: C.ink3 }}>on waitlist</div>
          </div>
          <div className="mt-4 pt-4 flex items-baseline justify-between" style={{ borderTop: `1px solid ${C.line}` }}>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Open Spots</div>
            <div className="text-2xl font-extrabold" style={{ color: preschoolOpen > 0 ? C.green : C.red }}>{preschoolOpen}</div>
          </div>
        </Card>

        <Card accent={C.blue} className="p-6">
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.ink2 }}>🏫 K–8</div>
          <div className="flex items-baseline gap-3 mt-2">
            <div className="text-6xl font-extrabold leading-none" style={{ color: C.blue }}>{k8Count}</div>
            <div className="text-sm" style={{ color: C.ink3 }}>on waitlist</div>
          </div>
          <div className="mt-4 pt-4 flex items-baseline justify-between" style={{ borderTop: `1px solid ${C.line}` }}>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Open Spots</div>
            <div className="text-2xl font-extrabold" style={{ color: k8Open > 0 ? C.green : C.red }}>{k8Open}</div>
          </div>
        </Card>
      </div>

      {/* Bar chart by program with avg wait */}
      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>By Program · Average Wait Days</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byProgram}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="program" tick={{ fontSize: 10, fill: C.ink2 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: C.ink3 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: C.ink3 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="count" fill={C.purple} radius={[4, 4, 0, 0]} name="On waitlist" />
            <Bar yAxisId="right" dataKey="avgWait" fill={C.orange} radius={[4, 4, 0, 0]} name="Avg wait (days)" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1" style={{ color: C.ink2 }}><span className="w-2 h-2 rounded-full" style={{ background: C.purple }} /> On waitlist</span>
          <span className="flex items-center gap-1" style={{ color: C.ink2 }}><span className="w-2 h-2 rounded-full" style={{ background: C.orange }} /> Avg wait (days)</span>
        </div>
      </Card>
    </div>
  );
};

// ─── DIRECTOR: Unified Log (PTO / Incident / Removal / Maintenance / Waitlist / Expense) ─
const LOG_TYPES = [
  { id: 'expense', label: 'Expense', icon: Receipt, color: C.orange },
  { id: 'pto', label: 'PTO', icon: LogOut, color: C.blue },
  { id: 'incident', label: 'Incident', icon: AlertTriangle, color: C.red },
  { id: 'removal', label: 'Removal', icon: Trash2, color: C.amber },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: C.purple },
  { id: 'waitlist_add', label: 'Waitlist', icon: UserPlus, color: C.green },
  { id: 'substitute', label: 'Sub Call', icon: Users, color: C.amber },
];

const DirectorLog = ({ log, setLog, expenses, setExpenses, setMaintenance, maintenance, setWaitlist, waitlist, substitutes, setSubstitutes, staff, payrollDays }) => {
  const [activeType, setActiveType] = useState('expense');
  const [form, setForm] = useState({});

  const reset = () => setForm({});

  const submit = () => {
    const today = TODAY.toISOString().split('T')[0];
    if (activeType === 'expense') {
      if (!form.amount || !form.description) return;
      const newExp = { id: Date.now(), amount: parseFloat(form.amount), description: form.description.slice(0, 100), date: today };
      setExpenses([newExp, ...expenses]);
    } else if (activeType === 'maintenance') {
      if (!form.location || !form.issue || !form.priority) return;
      const newM = { id: Date.now(), location: form.location, issue: form.issue.slice(0, 100), priority: form.priority, status: 'open', logged: today, estCost: parseInt(form.estCost) || 0 };
      setMaintenance([newM, ...maintenance]);
      setLog([{ id: Date.now() + 1, type: 'maintenance', date: today, location: form.location, issue: form.issue.slice(0, 100), priority: form.priority }, ...log]);
    } else if (activeType === 'waitlist_add') {
      if (!form.child || !form.program || !form.parent) return;
      const newW = { id: Date.now(), child: form.child.slice(0, 40), program: form.program, parent: form.parent.slice(0, 40), phone: form.phone || '', email: form.email || '', dateAdded: today, status: 'inquiry', source: form.source || 'walk_in' };
      setWaitlist([newW, ...waitlist]);
      setLog([{ id: Date.now() + 1, type: 'waitlist_add', date: today, child: form.child.slice(0, 40), program: form.program }, ...log]);
    } else if (activeType === 'pto') {
      if (!form.staff || !form.dayType || !form.days) return;
      setLog([{ id: Date.now(), type: 'pto', date: today, staff: form.staff, dayType: form.dayType, days: parseInt(form.days) }, ...log]);
    } else if (activeType === 'incident') {
      if (!form.student || !form.severity || !form.area) return;
      setLog([{ id: Date.now(), type: 'incident', date: today, student: form.student.slice(0, 40), severity: form.severity, area: form.area }, ...log]);
    } else if (activeType === 'removal') {
      if (!form.student || !form.reason) return;
      setLog([{ id: Date.now(), type: 'removal', date: today, student: form.student.slice(0, 40), reason: form.reason }, ...log]);
    } else if (activeType === 'substitute') {
      if (!form.coveringFor || !form.subName) return;
      const newSub = { id: Date.now(), date: today, coveringFor: form.coveringFor, subName: form.subName.slice(0, 40), calledBy: 'Director' };
      setSubstitutes([newSub, ...substitutes]);
      setLog([{ id: Date.now() + 1, type: 'substitute', date: today, coveringFor: form.coveringFor, subName: form.subName.slice(0, 40) }, ...log]);
    }
    reset();
  };

  // Build a unified recent feed combining expenses (treated as entries) and log
  const combinedFeed = [
    ...expenses.slice(0, 30).map(e => ({ id: 'e' + e.id, type: 'expense', date: e.date, amount: e.amount, description: e.description, category: categorize(e.description) })),
    ...log,
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);

  const renderForm = () => {
    const input = (key, label, type = 'text', placeholder = '', max) => (
      <div>
        <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: C.ink3 }}>{label}</label>
        <input
          type={type}
          value={form[key] || ''}
          maxLength={max}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
          style={{ background: '#F9FAFC', border: `1px solid ${C.line}`, color: C.ink }}
        />
      </div>
    );
    const select = (key, label, options) => (
      <div>
        <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: C.ink3 }}>{label}</label>
        <select
          value={form[key] || ''}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
          style={{ background: '#F9FAFC', border: `1px solid ${C.line}`, color: C.ink }}
        >
          <option value="">Select…</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );

    if (activeType === 'expense') {
      const preview = form.description ? categorize(form.description) : null;
      return (
        <div className="space-y-3">
          {input('amount', 'Amount ($)', 'number', '0.00')}
          {input('description', 'Description', 'text', "e.g. 'Pizza for staff PD'", 100)}
          {preview && (
            <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: C.purpleSoft }}>
              <Sparkles size={14} color={C.purple} />
              <span className="text-xs font-semibold" style={{ color: C.purple }}>AI tag: {preview}</span>
            </div>
          )}
        </div>
      );
    }
    if (activeType === 'pto') {
      return (
        <div className="space-y-3">
          {select('staff', 'Staff Member', initialStaff.map(s => s.name))}
          {select('dayType', 'Day Type', ['sick', 'personal', 'vacation', 'jury'])}
          {input('days', 'Days', 'number', '1')}
        </div>
      );
    }
    if (activeType === 'incident') {
      return (
        <div className="space-y-3">
          {input('student', 'Student', 'text', 'Initials OK', 40)}
          {select('severity', 'Severity', ['minor', 'moderate', 'major'])}
          {select('area', 'Area', ['Classroom', 'Playground', 'Cafeteria', 'Hallway', 'Bathroom', 'Outside'])}
        </div>
      );
    }
    if (activeType === 'removal') {
      return (
        <div className="space-y-3">
          {input('student', 'Student', 'text', 'Initials OK', 40)}
          {select('reason', 'Reason', ['parent_pickup', 'medical', 'behavioral', 'transferring', 'other'])}
        </div>
      );
    }
    if (activeType === 'maintenance') {
      return (
        <div className="space-y-3">
          {input('location', 'Location', 'text', 'e.g. K — Sequoia', 40)}
          {input('issue', 'Issue', 'text', 'Short description', 100)}
          {select('priority', 'Priority', ['critical', 'high', 'medium', 'low'])}
          {input('estCost', 'Est. Cost ($)', 'number', '0')}
        </div>
      );
    }
    if (activeType === 'waitlist_add') {
      return (
        <div className="space-y-3">
          {input('child', "Child's Name", 'text', '', 40)}
          {select('program', 'Program', ALL_PROGRAMS)}
          {input('parent', 'Parent Name', 'text', '', 40)}
          {input('phone', 'Phone', 'tel', '813-555-0000')}
          {input('email', 'Email', 'email', '')}
          {select('source', 'Source', ['referral', 'website', 'walk_in', 'event'])}
        </div>
      );
    }
    if (activeType === 'substitute') {
      return (
        <div className="space-y-3">
          {select('coveringFor', 'Covering For', staff ? staff.filter(s => s.role === 'Teacher').map(s => s.name) : [])}
          {input('subName', 'Sub Name', 'text', '', 40)}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <SectionHead icon="📝" title="Daily Log" sub="One place to log everything · staff log nothing" />

      {/* Payroll reminder */}
      {payrollDays !== undefined && (
        <Card className="p-4 flex items-center gap-3" accent={payrollDays <= 3 ? C.red : payrollDays <= 7 ? C.amber : C.blue}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: C.blueSoft }}>
            <Calendar size={18} color={C.blue} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Next Payroll</div>
            <div className="font-bold text-sm" style={{ color: C.ink }}>{new Date(NEXT_PAYROLL).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          </div>
          <Pill tone={payrollDays <= 3 ? 'red' : payrollDays <= 7 ? 'amber' : 'blue'}>{payrollDays}d</Pill>
        </Card>
      )}

      {/* Type picker */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {LOG_TYPES.map(t => {
          const on = activeType === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveType(t.id); reset(); }}
              className="p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all"
              style={{
                background: on ? t.color : C.card,
                color: on ? '#FFF' : C.ink,
                border: `1px solid ${on ? t.color : C.line}`,
              }}
            >
              <Icon size={18} />
              <span className="text-xs font-bold">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form */}
      <Card className="p-5">
        {renderForm()}
        <div className="mt-4 flex gap-2 justify-end">
          <Btn kind="ghost" onClick={reset}>Clear</Btn>
          <Btn kind="primary" onClick={submit} icon={Plus}>Log Entry</Btn>
        </div>
      </Card>

      {/* Recent feed */}
      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Recent Activity</div>
        <div className="space-y-2">
          {combinedFeed.map(item => {
            const typeMeta = LOG_TYPES.find(t => t.id === item.type) || LOG_TYPES[0];
            const Icon = typeMeta.icon;
            return (
              <div key={item.id} className="p-3 rounded-xl flex items-center gap-3" style={{ background: '#F9FAFC' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: typeMeta.color + '22' }}>
                  <Icon size={16} color={typeMeta.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm flex items-center gap-2 flex-wrap" style={{ color: C.ink }}>
                    {item.type === 'expense' && <>
                      <span>{fmtMoney(item.amount)}</span>
                      <span style={{ color: C.ink3, fontWeight: 400 }}>· {item.description}</span>
                    </>}
                    {item.type === 'pto' && <>{item.staff} · {item.dayType} ({item.days}d)</>}
                    {item.type === 'incident' && <>{item.student} · {item.severity} · {item.area}</>}
                    {item.type === 'removal' && <>{item.student} · {item.reason}</>}
                    {item.type === 'maintenance' && <>{item.location} · {item.issue}</>}
                    {item.type === 'waitlist_add' && <>{item.child} · {item.program}</>}
                    {item.type === 'substitute' && <>{item.subName} covering {item.coveringFor}</>}
                  </div>
                  <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: C.ink3 }}>
                    {item.date}
                    {item.type === 'expense' && <Pill tone="purple" size="xs"><Sparkles size={9} /> {item.category}</Pill>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ─── DIRECTOR: My Budget ─────────────────────────────────────────
const DirectorBudget = ({ expenses }) => {
  const spent = expenses.reduce((a, e) => a + e.amount, 0);
  const pct = Math.round((spent / DIRECTOR_BUDGET_TOTAL) * 100);
  const remaining = DIRECTOR_BUDGET_TOTAL - spent;
  const color = pct < 50 ? C.green : pct < 75 ? C.amber : pct < 90 ? C.orange : C.red;

  // Group expenses by AI category
  const grouped = expenses.reduce((acc, e) => {
    const cat = categorize(e.description);
    if (!acc[cat]) acc[cat] = { name: cat, total: 0, items: [] };
    acc[cat].total += e.amount;
    acc[cat].items.push(e);
    return acc;
  }, {});
  const groups = Object.values(grouped).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-5">
      <SectionHead icon="💰" title="My Budget" sub={`$${DIRECTOR_BUDGET_TOTAL.toLocaleString()} · Aug through end of May`} />

      <Card className="p-6">
        <div className="text-xs font-bold uppercase tracking-wider mb-1 text-center" style={{ color: C.ink2 }}>Consumption</div>
        <div className="relative flex flex-col items-center">
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart innerRadius="65%" outerRadius="100%" data={[{ value: pct, fill: color }]} startAngle={90} endAngle={-270}>
              <RadialBar background={{ fill: '#EEF1F6' }} dataKey="value" cornerRadius={20} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="-mt-[155px] text-center">
            <div className="text-5xl font-extrabold leading-none" style={{ color }}>{pct}<span className="text-2xl">%</span></div>
            <div className="text-xs mt-2 font-semibold uppercase tracking-wider" style={{ color: C.ink3 }}>of my budget</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Spent</div>
            <div className="text-xl font-extrabold mt-1" style={{ color: C.ink }}>{fmtMoney(spent)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Left</div>
            <div className="text-xl font-extrabold mt-1" style={{ color: C.green }}>{fmtMoney(remaining)}</div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} color={C.purple} />
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>By AI-tagged Category</div>
        </div>
        <div className="space-y-2">
          {groups.map(g => (
            <div key={g.name} className="p-3 rounded-xl flex items-center gap-3" style={{ background: '#F9FAFC' }}>
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[g.name] }} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm" style={{ color: C.ink }}>{g.name}</div>
                <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{g.items.length} {g.items.length === 1 ? 'entry' : 'entries'}</div>
              </div>
              <div className="font-extrabold text-sm" style={{ color: C.ink }}>{fmtMoney(g.total)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── DIRECTOR: Waitlist ──────────────────────────────────────────
const DirectorWaitlist = ({ waitlist, setWaitlist }) => {
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? waitlist : waitlist.filter(w => filter === 'preschool' ? PRESCHOOL_PROGRAMS.includes(w.program) : K8_PROGRAMS.includes(w.program));

  const updateStatus = (id, status) => {
    setWaitlist(waitlist.map(w => w.id === id ? { ...w, status } : w));
  };

  return (
    <div className="space-y-5">
      <SectionHead icon="📝" title="Waitlist" sub={`${waitlist.length} families · use the Log tab to add new ones`} />

      <div className="flex gap-2">
        {[{ id: 'all', label: 'All' }, { id: 'preschool', label: 'Preschool' }, { id: 'k8', label: 'K–8' }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: filter === f.id ? C.blue : C.card,
              color: filter === f.id ? '#FFF' : C.ink,
              border: `1px solid ${filter === f.id ? C.blue : C.line}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="p-5">
        <div className="space-y-2">
          {list.map(w => (
            <div key={w.id} className="p-3 rounded-xl" style={{ background: '#F9FAFC' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: C.ink }}>{w.child}</span>
                    <Pill tone="blue" size="xs">{w.program}</Pill>
                  </div>
                  <div className="text-xs mt-1" style={{ color: C.ink3 }}>{w.parent} · {w.phone}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>Joined {w.dateAdded} · {daysSince(w.dateAdded)}d waiting</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['inquiry', 'toured', 'applied', 'offered', 'enrolled', 'declined'].map(s => (
                  <button key={s} onClick={() => updateStatus(w.id, s)} className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: w.status === s ? C.blue : '#EEF1F6',
                      color: w.status === s ? '#FFF' : C.ink2,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <div className="py-8 text-center text-sm" style={{ color: C.ink3 }}>No families in this view.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

// ─── DIRECTOR: Payroll Ready Form ────────────────────────────────
// Replaces Director's bi-weekly email to Owner.
// Submit triggers (1) email summary to Owner, (2) BIG alert on Owner Overview.
const DirectorPayroll = ({ staff, otherDeductions, periodHolidays, payrollHistory, onSubmit, payrollDays }) => {
  // Section 1: Child Care Deductions — [{staffId, amount}]
  const [childCare, setChildCare] = useState([]);
  // Section 2: Other Deductions this period — [{loanId, amount}]
  const [otherDed, setOtherDed] = useState([]);
  // Section 3: PTO — [{staffId, startDate, endDate}]
  const [pto, setPto] = useState([]);
  // Section 4: Birthday — [{staffId, date}]
  const [birthday, setBirthday] = useState([]);
  // Section 5: Hours to Add in ADP — [{staffId, hours, type}]
  const [hoursToAdd, setHoursToAdd] = useState([]);
  // Section 6: Holiday Exceptions — { [holidayId]: [staffId, staffId,...] }
  const [holidayExceptions, setHolidayExceptions] = useState({});
  // Section 7: Notes
  const [notes, setNotes] = useState({ preschool: '', elementary: '' });

  const periodEnd = NEXT_PAYROLL;
  const teacherList = staff.filter(s => s.role === 'Teacher' || s.role === 'Front Office');

  // Helpers
  const ptoBalance = (staffId) => {
    const s = staff.find(x => x.id === staffId);
    if (!s) return null;
    return s.ptoAllowance - s.ptoUsed;
  };
  const daysBetween = (start, end) => {
    if (!start) return 0;
    if (!end || end === start) return 1;
    const ms = new Date(end) - new Date(start);
    return Math.max(1, Math.round(ms / 86400000) + 1);
  };
  const balanceTone = (n) => n <= 0 ? 'redSoft' : n <= 2 ? 'amberSoft' : 'greenSoft';
  const balanceColor = (n) => n <= 0 ? C.red : n <= 2 ? C.amber : C.green;

  // CRUD helpers (each section)
  const addCC  = () => setChildCare([...childCare, { id: Date.now(), staffId: '', amount: '' }]);
  const updCC  = (i, f, v) => setChildCare(childCare.map((r, idx) => idx === i ? { ...r, [f]: v } : r));
  const rmCC   = (i) => setChildCare(childCare.filter((_, idx) => idx !== i));

  const addOD  = () => setOtherDed([...otherDed, { id: Date.now(), loanId: '', amount: '' }]);
  const updOD  = (i, f, v) => setOtherDed(otherDed.map((r, idx) => idx === i ? { ...r, [f]: v } : r));
  const rmOD   = (i) => setOtherDed(otherDed.filter((_, idx) => idx !== i));

  const addPTO = () => setPto([...pto, { id: Date.now(), staffId: '', startDate: '', endDate: '' }]);
  const updPTO = (i, f, v) => setPto(pto.map((r, idx) => idx === i ? { ...r, [f]: v } : r));
  const rmPTO  = (i) => setPto(pto.filter((_, idx) => idx !== i));

  const addBD  = () => setBirthday([...birthday, { id: Date.now(), staffId: '', date: '' }]);
  const updBD  = (i, f, v) => setBirthday(birthday.map((r, idx) => idx === i ? { ...r, [f]: v } : r));
  const rmBD   = (i) => setBirthday(birthday.filter((_, idx) => idx !== i));

  const addHTA = () => setHoursToAdd([...hoursToAdd, { id: Date.now(), staffId: '', hours: '', type: 'After-care' }]);
  const updHTA = (i, f, v) => setHoursToAdd(hoursToAdd.map((r, idx) => idx === i ? { ...r, [f]: v } : r));
  const rmHTA  = (i) => setHoursToAdd(hoursToAdd.filter((_, idx) => idx !== i));

  const toggleExclusion = (holidayId, staffId) => {
    const current = holidayExceptions[holidayId] || [];
    const next = current.includes(staffId)
      ? current.filter(x => x !== staffId)
      : [...current, staffId];
    setHolidayExceptions({ ...holidayExceptions, [holidayId]: next });
  };

  // Submit
  const handleSubmit = () => {
    const payload = {
      periodEnding: periodEnd,
      submittedAt: new Date().toISOString(),
      submittedBy: 'Director',
      childCare: childCare.map(r => ({
        name: staff.find(s => s.id === Number(r.staffId))?.name || 'Unknown',
        amount: Number(r.amount) || 0,
      })),
      otherDeductions: otherDed.map(r => {
        const loan = otherDeductions.find(l => l.id === Number(r.loanId));
        return {
          name: loan?.staffName || 'Unknown',
          amount: Number(r.amount) || 0,
          balanceAfter: (loan?.balance || 0) - (Number(r.amount) || 0),
        };
      }),
      pto: pto.map(r => ({
        name: staff.find(s => s.id === Number(r.staffId))?.name || 'Unknown',
        startDate: r.startDate,
        endDate: r.endDate || r.startDate,
        days: daysBetween(r.startDate, r.endDate),
        balanceAfter: ptoBalance(Number(r.staffId)) - daysBetween(r.startDate, r.endDate),
      })),
      birthday: birthday.map(r => ({
        name: staff.find(s => s.id === Number(r.staffId))?.name || 'Unknown',
        date: r.date,
      })),
      hoursToAdd: hoursToAdd.map(r => ({
        name: staff.find(s => s.id === Number(r.staffId))?.name || r.staffId,
        hours: Number(r.hours) || 0,
        type: r.type,
      })),
      holidayExceptions: periodHolidays.map(h => ({
        date: h.date,
        name: h.name,
        excluded: (holidayExceptions[h.id] || []).map(sid =>
          staff.find(s => s.id === sid)?.name || 'Unknown'
        ),
      })),
      notes,
    };
    onSubmit(payload);
  };

  // ─── Row UI helpers ────────────────────────────────────────────
  const staffSelect = (value, onChange, exclude = []) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: '#fff', border: `1px solid ${C.line}`, color: C.ink }}>
      <option value="">Pick staff…</option>
      {teacherList.filter(s => !exclude.includes(s.id)).map(s =>
        <option key={s.id} value={s.id}>{s.name}</option>
      )}
    </select>
  );

  return (
    <div className="space-y-5">
      <SectionHead icon="💵" title="Payroll Ready" sub={`Pay period ending ${periodEnd} · Replaces your bi-weekly email to Owner`} />

      {/* Payroll countdown banner */}
      <Card className="p-4 flex items-center gap-3" accent={payrollDays <= 3 ? C.red : payrollDays <= 7 ? C.amber : C.blue}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: C.blueSoft }}>
          <Calendar size={18} color={C.blue} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink3 }}>Next Payroll</div>
          <div className="font-bold text-sm" style={{ color: C.ink }}>{new Date(periodEnd).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
        <Pill tone={payrollDays <= 3 ? 'red' : payrollDays <= 7 ? 'amber' : 'blue'}>{payrollDays}d</Pill>
      </Card>

      {/* 1. Child Care Deductions */}
      <Card className="p-5">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: C.ink3 }}>1 · Child Care Deductions</h3>
          <button onClick={addCC} className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: C.blueSoft, color: C.blue }}>+ Add</button>
        </div>
        <p className="text-xs mb-3" style={{ color: C.ink3 }}>Tuition-style deductions taken from staff paychecks.</p>
        <div className="space-y-2">
          {childCare.length === 0 && <div className="text-xs italic text-center py-3" style={{ color: C.ink3 }}>None this period.</div>}
          {childCare.map((row, i) => (
            <div key={row.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 110px 28px' }}>
              {staffSelect(row.staffId, v => updCC(i, 'staffId', v))}
              <input type="number" value={row.amount} onChange={e => updCC(i, 'amount', e.target.value)} placeholder="$0.00" className="px-3 py-2 rounded-lg text-sm" style={{ background: '#fff', border: `1px solid ${C.line}` }} />
              <button onClick={() => rmCC(i)} style={{ color: C.ink3 }}>×</button>
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Other Deductions */}
      <Card className="p-5">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: C.ink3 }}>2 · Other Deductions</h3>
          <button onClick={addOD} className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: C.blueSoft, color: C.blue }}>+ Add</button>
        </div>
        <p className="text-xs mb-3" style={{ color: C.ink3 }}>Loans, advances. Remaining balance auto-tracks across pay periods.</p>
        <div className="space-y-2">
          {otherDed.length === 0 && <div className="text-xs italic text-center py-3" style={{ color: C.ink3 }}>None this period.</div>}
          {otherDed.map((row, i) => {
            const loan = otherDeductions.find(l => l.id === Number(row.loanId));
            const newBal = loan ? loan.balance - (Number(row.amount) || 0) : 0;
            return (
              <div key={row.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 90px 140px 28px' }}>
                <select value={row.loanId} onChange={e => updOD(i, 'loanId', e.target.value)} className="px-3 py-2 rounded-lg text-sm" style={{ background: '#fff', border: `1px solid ${C.line}`, color: C.ink }}>
                  <option value="">Pick loan/advance…</option>
                  {otherDeductions.map(l => <option key={l.id} value={l.id}>{l.staffName} · {l.type}</option>)}
                </select>
                <input type="number" value={row.amount} onChange={e => updOD(i, 'amount', e.target.value)} placeholder="$0.00" className="px-3 py-2 rounded-lg text-sm" style={{ background: '#fff', border: `1px solid ${C.line}` }} />
                <div className="px-2 py-2 rounded-lg text-xs text-center font-bold" style={{ background: loan ? balanceTone(newBal) === 'redSoft' ? C.redSoft : balanceTone(newBal) === 'amberSoft' ? C.amberSoft : C.greenSoft : '#F1F5F9', color: loan ? balanceColor(newBal) : C.ink3 }}>
                  {loan ? `$${newBal.toLocaleString()} left` : '—'}
                </div>
                <button onClick={() => rmOD(i)} style={{ color: C.ink3 }}>×</button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. PTO This Period */}
      <Card className="p-5">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: C.ink3 }}>3 · PTO This Period</h3>
          <button onClick={addPTO} className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: C.blueSoft, color: C.blue }}>+ Add</button>
        </div>
        <p className="text-xs mb-3" style={{ color: C.ink3 }}>Single day or date range — system auto-counts and deducts from balance.</p>
        <div className="space-y-2">
          {pto.length === 0 && <div className="text-xs italic text-center py-3" style={{ color: C.ink3 }}>None this period.</div>}
          {pto.map((row, i) => {
            const balance = row.staffId ? ptoBalance(Number(row.staffId)) : null;
            const days = daysBetween(row.startDate, row.endDate);
            const afterBalance = balance !== null ? balance - days : null;
            return (
              <div key={row.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 1.3fr 140px 28px' }}>
                {staffSelect(row.staffId, v => updPTO(i, 'staffId', v))}
                <div className="flex gap-1 items-center">
                  <input type="date" value={row.startDate} onChange={e => updPTO(i, 'startDate', e.target.value)} className="flex-1 min-w-0 px-2 py-2 rounded-lg text-xs" style={{ background: '#fff', border: `1px solid ${C.line}` }} />
                  <span className="text-xs" style={{ color: C.ink3 }}>→</span>
                  <input type="date" value={row.endDate} onChange={e => updPTO(i, 'endDate', e.target.value)} className="flex-1 min-w-0 px-2 py-2 rounded-lg text-xs" style={{ background: '#fff', border: `1px solid ${C.line}` }} />
                  {row.startDate && <span className="text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap" style={{ background: '#EDE9FE', color: C.purple }}>{days}d</span>}
                </div>
                <div className="px-2 py-2 rounded-lg text-xs text-center font-bold" style={{ background: afterBalance === null ? '#F1F5F9' : afterBalance <= 0 ? C.redSoft : afterBalance <= 2 ? C.amberSoft : C.greenSoft, color: afterBalance === null ? C.ink3 : balanceColor(afterBalance) }}>
                  {afterBalance === null ? '—' : `${afterBalance} left ${afterBalance <= 0 ? '⚠' : ''}`}
                </div>
                <button onClick={() => rmPTO(i)} style={{ color: C.ink3 }}>×</button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 4. Birthday Time Off */}
      <Card className="p-5" accent={C.blue}>
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: C.ink3 }}>4 · Birthday Time Off</h3>
          <button onClick={addBD} className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: C.blueSoft, color: C.blue }}>+ Add</button>
        </div>
        <p className="text-xs mb-3" style={{ color: C.ink3 }}>Separate from PTO · one per staff per year · auto-blocks duplicates.</p>
        <div className="space-y-2">
          {birthday.length === 0 && <div className="text-xs italic text-center py-3" style={{ color: C.ink3 }}>None this period.</div>}
          {birthday.map((row, i) => {
            const s = staff.find(x => x.id === Number(row.staffId));
            const alreadyUsed = s?.birthdayUsedThisYear;
            return (
              <div key={row.id}>
                <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 140px 28px' }}>
                  {staffSelect(row.staffId, v => updBD(i, 'staffId', v))}
                  <input type="date" value={row.date} onChange={e => updBD(i, 'date', e.target.value)} className="px-2 py-2 rounded-lg text-sm" style={{ background: '#fff', border: `1px solid ${C.line}` }} />
                  <button onClick={() => rmBD(i)} style={{ color: C.ink3 }}>×</button>
                </div>
                {alreadyUsed && <div className="text-xs mt-1 ml-1" style={{ color: C.red }}>⚠ {s.name} already used birthday this year</div>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 5. Hours to Add in ADP */}
      <Card className="p-5" accent={C.red}>
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: C.ink3 }}>5 · Hours to Add in ADP <span className="ml-1 inline-block px-1.5 py-0.5 rounded text-[9px]" style={{ background: C.redSoft, color: C.red }}>ACTION</span></h3>
          <button onClick={addHTA} className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: C.blueSoft, color: C.blue }}>+ Add</button>
        </div>
        <p className="text-xs mb-3" style={{ color: C.ink3 }}>Hours not captured by ADP time clock — Owner adds these manually. Total hours for the period, no dates needed.</p>
        <div className="space-y-2">
          {hoursToAdd.length === 0 && <div className="text-xs italic text-center py-3" style={{ color: C.ink3 }}>None this period.</div>}
          {hoursToAdd.map((row, i) => (
            <div key={row.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 90px 130px 28px' }}>
              {staffSelect(row.staffId, v => updHTA(i, 'staffId', v))}
              <input type="number" step="0.25" value={row.hours} onChange={e => updHTA(i, 'hours', e.target.value)} placeholder="0 hrs" className="px-3 py-2 rounded-lg text-sm" style={{ background: '#fff', border: `1px solid ${C.line}` }} />
              <select value={row.type} onChange={e => updHTA(i, 'type', e.target.value)} className="px-2 py-2 rounded-lg text-xs font-bold" style={{ background: C.amberSoft, color: C.amber, border: `1px solid ${C.line}` }}>
                <option>After-care</option>
                <option>Non-ADP</option>
                <option>Other</option>
              </select>
              <button onClick={() => rmHTA(i)} style={{ color: C.ink3 }}>×</button>
            </div>
          ))}
        </div>
      </Card>

      {/* 6. Holiday Exceptions */}
      {periodHolidays.length > 0 && (
        <Card className="p-5" style={{ border: `2px solid ${C.amber}`, background: '#FFFBF0' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.ink3 }}>6 · Holiday This Period</h3>
          {periodHolidays.map(h => {
            const excluded = holidayExceptions[h.id] || [];
            return (
              <div key={h.id} className="bg-white rounded-xl p-4 mb-2" style={{ border: `1px solid ${C.line}` }}>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="px-3 py-2 rounded-lg text-sm font-bold" style={{ background: '#F9FAFC' }}>{h.date}</div>
                  <div className="px-3 py-2 rounded-lg text-sm font-bold" style={{ background: '#F9FAFC' }}>{h.name}</div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg mb-3" style={{ background: C.greenSoft }}>
                  <CheckCircle2 size={18} color={C.green} />
                  <span className="text-sm font-bold" style={{ color: C.green }}>ALL {teacherList.length} staff receive this holiday by default</span>
                </div>
                <div className="p-3 rounded-lg mb-3 text-xs font-medium" style={{ background: C.amberSoft, color: C.amber }}>
                  ⚠ <b>Only add staff who do NOT qualify.</b> Pick from the dropdown. Leave empty if everyone qualifies.
                </div>
                <div className="bg-white rounded-lg p-3" style={{ border: `1px solid ${C.line}` }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: C.ink3 }}>Staff excluded from this holiday</div>
                  {excluded.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {excluded.map(sid => {
                        const s = staff.find(x => x.id === sid);
                        return (
                          <span key={sid} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: C.redSoft, color: C.red }}>
                            {s?.name}
                            <button onClick={() => toggleExclusion(h.id, sid)} style={{ color: C.red, opacity: 0.7 }}>×</button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <select onChange={e => { if (e.target.value) { toggleExclusion(h.id, Number(e.target.value)); e.target.value = ''; } }} className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: '#F9FAFC', border: `1px solid ${C.line}`, color: C.ink3 }}>
                    <option value="">+ Add staff to exclude…</option>
                    {teacherList.filter(s => !excluded.includes(s.id)).map(s =>
                      <option key={s.id} value={s.id}>{s.name}</option>
                    )}
                  </select>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* 7. Notes by Division */}
      <Card className="p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.ink3 }}>7 · Notes by Division</h3>
        <p className="text-xs mb-3" style={{ color: C.ink3 }}>For anything that didn't fit a structured row. Short and specific.</p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-bold" style={{ color: C.ink3 }}>Preschool Notes</label>
              <span className="text-[10px]" style={{ color: C.ink3 }}>{notes.preschool.length} / 200</span>
            </div>
            <textarea value={notes.preschool} maxLength={200} onChange={e => setNotes({ ...notes, preschool: e.target.value })} placeholder="Optional" className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: '#F9FAFC', border: `1px solid ${C.line}`, minHeight: 60 }} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-bold" style={{ color: C.ink3 }}>Elementary Notes</label>
              <span className="text-[10px]" style={{ color: C.ink3 }}>{notes.elementary.length} / 200</span>
            </div>
            <textarea value={notes.elementary} maxLength={200} onChange={e => setNotes({ ...notes, elementary: e.target.value })} placeholder="Optional" className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: '#F9FAFC', border: `1px solid ${C.line}`, minHeight: 60 }} />
          </div>
        </div>
      </Card>

      {/* Submit */}
      <Card className="p-5">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button className="px-4 py-3 rounded-xl text-sm font-bold" style={{ background: '#fff', color: C.ink2, border: `1px solid ${C.line}` }}>Save Draft</button>
          <button onClick={handleSubmit} className="col-span-2 px-4 py-3 rounded-xl text-sm font-bold" style={{ background: C.blue, color: '#fff' }}>Mark Payroll Ready →</button>
        </div>
        <p className="text-xs text-center" style={{ color: C.ink3 }}>Submit sends Owner an email summary <b>and</b> triggers a BIG alert on Owner's dashboard.</p>
      </Card>

      {/* Recent submissions */}
      {payrollHistory.length > 0 && (
        <Card className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.ink3 }}>Recent Submissions</h3>
          <div className="space-y-2">
            {payrollHistory.map(h => (
              <div key={h.id} className="p-3 rounded-xl flex items-center justify-between" style={{ background: '#F9FAFC' }}>
                <div>
                  <div className="font-bold text-sm" style={{ color: C.ink }}>Pay period ending {h.periodEnding}</div>
                  <div className="text-xs" style={{ color: C.ink3 }}>{h.childCare.length} child-care · {h.pto.length} PTO · {h.hoursToAdd.length} hour adjustments</div>
                </div>
                <Pill tone="green">Submitted</Pill>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// ─── OWNER: Cash Flow — Year-over-Year by category ──────────────
// Source: monthly QuickBooks CSV upload, AI-categorized.
// Owner picks categories to compare, sees bar chart + AI insights.
const OwnerCashFlow = ({ data, years, insights }) => {
  // Default selected: the 5 biggest categories (by latest full year)
  const defaultPicks = [...data]
    .sort((a, b) => (b.values[2025] || 0) - (a.values[2025] || 0))
    .slice(0, 5)
    .map(d => d.category);
  const [selected, setSelected] = useState(defaultPicks);
  const [insightFilter, setInsightFilter] = useState('all'); // all | red | amber | green

  const toggle = (cat) => {
    setSelected(selected.includes(cat) ? selected.filter(c => c !== cat) : [...selected, cat]);
  };

  // Chart data — one row per year, one column per selected category
  const chartData = years.map(y => {
    const row = { year: String(y) };
    selected.forEach(cat => {
      const found = data.find(d => d.category === cat);
      row[cat] = found?.values[y] || 0;
    });
    return row;
  });

  // Per-category YoY change (2024 → 2025, last two full years)
  const yoyChange = (cat) => {
    const d = data.find(x => x.category === cat);
    if (!d) return null;
    const prev = d.values[2024];
    const curr = d.values[2025];
    if (!prev) return null;
    return ((curr - prev) / prev) * 100;
  };

  // Total spend per year (selected categories)
  const totalByYear = years.map(y => {
    const sum = selected.reduce((acc, cat) => {
      const d = data.find(x => x.category === cat);
      return acc + (d?.values[y] || 0);
    }, 0);
    return { year: String(y), total: sum };
  });

  const filteredInsights = insightFilter === 'all' ? insights : insights.filter(i => i.tone === insightFilter);

  // Distinct colors for the bars
  const palette = [C.blue, C.green, C.amber, C.red, C.purple, '#E07A5F', '#0EA5E9', '#8B5CF6', '#F59E0B', '#06B6D4'];

  return (
    <div className="space-y-5">
      <SectionHead icon="📊" title="Cash Flow — Year over Year" sub="Where the money goes, compared across years · AI-categorized from QuickBooks" />

      {/* CSV upload + filter row */}
      <Card className="p-4 flex flex-col md:flex-row items-start md:items-center gap-3">
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>Monthly Data Sync</div>
          <div className="text-sm mt-1" style={{ color: C.ink }}>Last upload: April 2026 statement · <span style={{ color: C.green, fontWeight: 600 }}>✓ AI-categorized</span></div>
        </div>
        <button className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2" style={{ background: C.blueSoft, color: C.blue }}>
          <FileText size={14} /> Upload May 2026 CSV
        </button>
      </Card>

      {/* AI Insights — auto-generated observations */}
      <Card className="p-5" accent={C.purple}>
        <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: C.purple }}>
              <Sparkles size={14} /> AI Insights
            </div>
            <div className="text-xs mt-1" style={{ color: C.ink3 }}>Auto-generated from YoY trends</div>
          </div>
          <div className="flex gap-1">
            {['all', 'red', 'amber', 'green'].map(t => (
              <button key={t} onClick={() => setInsightFilter(t)} className="px-2 py-1 rounded-md text-[10px] font-bold uppercase"
                style={{
                  background: insightFilter === t ? (t === 'red' ? C.red : t === 'amber' ? C.amber : t === 'green' ? C.green : C.ink) : C.line,
                  color: insightFilter === t ? '#fff' : C.ink2,
                }}>
                {t === 'all' ? 'All' : t === 'red' ? '↑ Up' : t === 'amber' ? '→ Watch' : '↓ Good'}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filteredInsights.map((i, idx) => {
            const bg = i.tone === 'red' ? C.redSoft : i.tone === 'amber' ? C.amberSoft : C.greenSoft;
            const fg = i.tone === 'red' ? C.red : i.tone === 'amber' ? C.amber : C.green;
            return (
              <div key={idx} className="p-3 rounded-xl flex items-start gap-2" style={{ background: bg }}>
                <span className="text-lg font-bold flex-shrink-0" style={{ color: fg }}>{i.icon}</span>
                <span className="text-xs leading-relaxed" style={{ color: C.ink }}>{i.text}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Category picker — pills */}
      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Pick Categories to Compare</div>
        <div className="flex flex-wrap gap-2">
          {data.map((d, idx) => {
            const isOn = selected.includes(d.category);
            const change = yoyChange(d.category);
            const color = palette[idx % palette.length];
            return (
              <button key={d.category} onClick={() => toggle(d.category)}
                className="px-3 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all"
                style={{
                  background: isOn ? color : C.line,
                  color: isOn ? '#fff' : C.ink2,
                  opacity: isOn ? 1 : 0.6,
                }}>
                <span>{d.icon}</span>
                <span>{d.category}</span>
                {change !== null && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      background: isOn ? 'rgba(255,255,255,0.25)' : 'transparent',
                      color: isOn ? '#fff' : (change > 0 ? C.red : C.green),
                    }}>
                    {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(0)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main YoY bar chart — selected categories */}
      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>YoY Spending — {selected.length} {selected.length === 1 ? 'Category' : 'Categories'}</div>
        {selected.length === 0 ? (
          <div className="text-center text-sm py-8" style={{ color: C.ink3 }}>Pick a category above to see the chart.</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
              <XAxis dataKey="year" tick={{ fill: C.ink3, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.ink3, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`} />
              <Tooltip
                contentStyle={{ background: C.ink, border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                formatter={(value) => fmtMoney(value)}
              />
              {selected.map((cat, idx) => (
                <Bar key={cat} dataKey={cat} fill={palette[data.findIndex(d => d.category === cat) % palette.length]} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="text-[10px] text-center mt-2" style={{ color: C.ink3 }}>2026 is YTD (Jan–Apr) — partial year</div>
      </Card>

      {/* Total selected spend per year */}
      <Card className="p-5" accent={C.blue}>
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Combined Total — Selected Categories</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={totalByYear} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
            <XAxis dataKey="year" tick={{ fill: C.ink3, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.ink3, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`} />
            <Tooltip
              contentStyle={{ background: C.ink, border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
              formatter={(value) => fmtMoney(value)}
            />
            <Line type="monotone" dataKey="total" stroke={C.blue} strokeWidth={3} dot={{ fill: C.blue, r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Category details table */}
      <Card className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.ink2 }}>Category Detail · 5-Year View</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                <th className="text-left py-2 px-2 font-bold" style={{ color: C.ink3 }}>Category</th>
                {years.map(y => (
                  <th key={y} className="text-right py-2 px-2 font-bold" style={{ color: C.ink3 }}>{y}{y === 2026 ? ' YTD' : ''}</th>
                ))}
                <th className="text-right py-2 px-2 font-bold" style={{ color: C.ink3 }}>YoY</th>
              </tr>
            </thead>
            <tbody>
              {data.map(d => {
                const change = yoyChange(d.category);
                return (
                  <tr key={d.category} style={{ borderBottom: `1px solid ${C.line}` }}>
                    <td className="py-2 px-2 font-bold" style={{ color: C.ink }}>{d.icon} {d.category}</td>
                    {years.map(y => (
                      <td key={y} className="text-right py-2 px-2" style={{ color: C.ink2 }}>{fmtMoneyShort(d.values[y] || 0)}</td>
                    ))}
                    <td className="text-right py-2 px-2 font-bold" style={{ color: change > 5 ? C.red : change < -3 ? C.green : C.ink3 }}>
                      {change !== null ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ─── Main app ────────────────────────────────────────────────────
export default function HCLCDashboard() {
  const [role, setRole] = useState('owner');
  const [tab, setTab] = useState('overview');

  const [classrooms] = useState(initialClassrooms);
  const [compliance] = useState(initialCompliance);
  const [tasks] = useState(initialTasks);
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [staff] = useState(initialStaff);
  const [waitlist, setWaitlist] = useState(initialWaitlist);
  const [expenses, setExpenses] = useState(initialDirectorExpenses);
  const [log, setLog] = useState(initialDirectorLog);
  const [atRisk, setAtRisk] = useState(initialAtRisk);
  const [discounts] = useState(initialDiscounts);
  const [stepUp] = useState(initialStepUpApprovals);
  const [substitutes, setSubstitutes] = useState(initialSubstitutes);

  // Payroll state
  const [otherDeductions] = useState(initialOtherDeductions);
  const [periodHolidays] = useState(initialPeriodHolidays);
  const [payrollHistory, setPayrollHistory] = useState(initialPayrollHistory);
  const [payrollReady, setPayrollReady] = useState(null); // null OR submitted payload object

  const submitPayroll = (payload) => {
    setPayrollHistory([{ ...payload, id: Date.now() }, ...payrollHistory]);
    setPayrollReady(payload);
  };
  const dismissPayrollAlert = () => setPayrollReady(null);

  const ownerTabs = [
    { id: 'overview', label: 'Overview', emoji: '🏠' },
    { id: 'enrollment', label: 'Enrollment', emoji: '👶' },
    { id: 'classrooms', label: 'Classrooms', emoji: '🏫' },
    { id: 'cashflow', label: 'Cash Flow', emoji: '📊' },
    { id: 'compliance', label: 'Compliance', emoji: '✅' },
    { id: 'tasks', label: 'Tasks', emoji: '📋' },
    { id: 'maintenance', label: 'Maintenance', emoji: '🔧' },
    { id: 'budget', label: 'Budget', emoji: '💰' },
    { id: 'scholarships', label: 'Scholarships', emoji: '🎓' },
    { id: 'staff', label: 'Staff', emoji: '👥' },
    { id: 'waitlist', label: 'Waitlist', emoji: '📝' },
  ];
  const directorTabs = [
    { id: 'log', label: 'Daily Log', emoji: '📝' },
    { id: 'payroll', label: 'Payroll', emoji: '💵' },
    { id: 'budget', label: 'My Budget', emoji: '💰' },
    { id: 'waitlist', label: 'Waitlist', emoji: '👨‍👩‍👧' },
  ];

  return (
    <div className="min-h-screen ff-body" style={{ background: C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .ff-body { font-family: 'Inter', system-ui, sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        select { -webkit-appearance: none; -moz-appearance: none; appearance: none; padding-right: 1.5rem; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='%236B7385' fill='none' stroke-width='2' stroke-linecap='round'/></svg>"); background-repeat: no-repeat; background-position: right 0.5rem center; }
      `}</style>

      <Header role={role} setRole={setRole} setTab={setTab} />
      <TabNav tabs={role === 'owner' ? ownerTabs : directorTabs} active={tab} setActive={setTab} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-8">
        {role === 'owner' && (
          <>
            {tab === 'overview' && <OwnerOverview classrooms={classrooms} tasks={tasks} compliance={compliance} waitlist={waitlist} directorExpenses={expenses} atRisk={atRisk} discounts={discounts} stepUp={stepUp} log={log} maintenance={maintenance} staff={staff} substitutes={substitutes} payrollReady={payrollReady} dismissPayrollAlert={dismissPayrollAlert} setTab={setTab} />}
            {tab === 'enrollment' && <OwnerEnrollment classrooms={classrooms} atRisk={atRisk} setAtRisk={setAtRisk} discounts={discounts} />}
            {tab === 'classrooms' && <OwnerClassrooms classrooms={classrooms} />}
            {tab === 'cashflow' && <OwnerCashFlow data={CASHFLOW_DATA} years={CASHFLOW_YEARS} insights={CASHFLOW_INSIGHTS} />}
            {tab === 'compliance' && <OwnerCompliance compliance={compliance} />}
            {tab === 'tasks' && <OwnerTasks tasks={tasks} />}
            {tab === 'maintenance' && <OwnerMaintenance maintenance={maintenance} />}
            {tab === 'budget' && <OwnerBudget directorExpenses={expenses} />}
            {tab === 'scholarships' && <OwnerScholarships stepUp={stepUp} />}
            {tab === 'staff' && <OwnerStaff staff={staff} />}
            {tab === 'waitlist' && <OwnerWaitlist waitlist={waitlist} classrooms={classrooms} />}
          </>
        )}
        {role === 'director' && (
          <>
            {tab === 'log' && <DirectorLog log={log} setLog={setLog} expenses={expenses} setExpenses={setExpenses} maintenance={maintenance} setMaintenance={setMaintenance} waitlist={waitlist} setWaitlist={setWaitlist} substitutes={substitutes} setSubstitutes={setSubstitutes} staff={staff} payrollDays={daysUntil(NEXT_PAYROLL)} />}
            {tab === 'payroll' && <DirectorPayroll staff={staff} otherDeductions={otherDeductions} periodHolidays={periodHolidays} payrollHistory={payrollHistory} onSubmit={submitPayroll} payrollDays={daysUntil(NEXT_PAYROLL)} />}
            {tab === 'budget' && <DirectorBudget expenses={expenses} />}
            {tab === 'waitlist' && <DirectorWaitlist waitlist={waitlist} setWaitlist={setWaitlist} />}
          </>
        )}
      </main>
    </div>
  );
}
