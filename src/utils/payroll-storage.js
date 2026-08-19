const HISTORY_KEY = "pulse_payroll_history";
const SCHEDULE_KEY = "pulse_payroll_schedule";

const DEFAULT_HISTORY = [
  {
    id: 1,
    periodEnding: "2026-04-30",
    periodStart: "2026-04-16",
    dueDate: "2026-04-30",
    submittedAt: "2026-04-30T16:42:00",
    submittedBy: "Director",
    childCare: [{ name: "Kat", amount: 130 }, { name: "Maye", amount: 30 }],
    otherDeductions: [{ name: "Ms. Crane", amount: 160, balanceAfter: 3530 }],
    pto: [
      { name: "Eliz", startDate: "2026-04-10", endDate: "2026-04-10", days: 1, balanceAfter: 0 },
      { name: "S ll", startDate: "2026-04-08", endDate: "2026-04-10", days: 3, balanceAfter: 5 }
    ],
    birthday: [{ name: "Nam", date: "2026-04-30" }],
    hoursToAdd: [{ name: "Estra", hours: 0.5, type: "After-care" }],
    holidayExceptions: [],
    notes: { preschool: "Preschool operations running smoothly.", elementary: "Elementary staff adjustments completed." },
  },
  {
    id: 2,
    periodEnding: "2026-04-15",
    periodStart: "2026-04-01",
    dueDate: "2026-04-15",
    submittedAt: "2026-04-15T15:20:00",
    submittedBy: "Director",
    childCare: [{ name: "Kat", amount: 130 }],
    otherDeductions: [],
    pto: [{ name: "Ms. Soto", startDate: "2026-04-05", endDate: "2026-04-06", days: 2, balanceAfter: 6 }],
    birthday: [],
    hoursToAdd: [],
    holidayExceptions: [],
    notes: { preschool: "All good", elementary: "" },
  },
  {
    id: 3,
    periodEnding: "2026-03-31",
    periodStart: "2026-03-16",
    dueDate: "2026-03-31",
    submittedAt: "2026-03-31T17:10:00",
    submittedBy: "Director",
    childCare: [],
    otherDeductions: [{ name: "Mr. Levine", amount: 100, balanceAfter: 580 }],
    pto: [],
    birthday: [{ name: "Ms. Diaz", date: "2026-03-24" }],
    hoursToAdd: [],
    holidayExceptions: [],
    notes: { preschool: "", elementary: "" },
  },
  {
    id: 4,
    periodEnding: "2026-03-15",
    periodStart: "2026-03-01",
    dueDate: "2026-03-15",
    submittedAt: "2026-03-15T14:05:00",
    submittedBy: "Director",
    childCare: [],
    otherDeductions: [],
    pto: [],
    birthday: [],
    hoursToAdd: [],
    holidayExceptions: [],
    notes: { preschool: "", elementary: "" },
  },
];

const DEFAULT_SCHEDULE = [
  { id: 1, startDate: "2026-04-16", endDate: "2026-04-30", dueDate: "2026-04-30", status: "Submitted" },
  { id: 2, startDate: "2026-05-01", endDate: "2026-05-15", dueDate: "2026-05-15", status: "Pending" },
  { id: 3, startDate: "2026-05-16", endDate: "2026-05-31", dueDate: "2026-05-31", status: "Pending" },
  { id: 4, startDate: "2026-06-01", endDate: "2026-06-15", dueDate: "2026-06-15", status: "Pending" },
  { id: 5, startDate: "2026-06-16", endDate: "2026-06-30", dueDate: "2026-06-30", status: "Pending" },
];

export const getPayrollHistory = () => {
  const history = localStorage.getItem(HISTORY_KEY);
  if (!history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(DEFAULT_HISTORY));
    return DEFAULT_HISTORY;
  }
  try {
    return JSON.parse(history);
  } catch (e) {
    return DEFAULT_HISTORY;
  }
};

export const savePayrollHistory = (history) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  // Dispatch custom event to sync multi-tabs/views
  window.dispatchEvent(new Event("pulse_payroll_update"));
};

export const getPayrollSchedule = () => {
  const schedule = localStorage.getItem(SCHEDULE_KEY);
  if (!schedule) {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(DEFAULT_SCHEDULE));
    return DEFAULT_SCHEDULE;
  }
  try {
    return JSON.parse(schedule);
  } catch (e) {
    return DEFAULT_SCHEDULE;
  }
};

export const savePayrollSchedule = (schedule) => {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
  // Dispatch custom event to sync multi-tabs/views
  window.dispatchEvent(new Event("pulse_payroll_update"));
};
