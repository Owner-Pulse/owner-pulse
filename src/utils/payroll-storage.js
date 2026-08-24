const HISTORY_KEY = "pulse_payroll_history";
const SCHEDULE_KEY = "pulse_payroll_schedule";

export const getPayrollHistory = () => {
  const history = localStorage.getItem(HISTORY_KEY);
  if (!history) {
    return [];
  }
  try {
    const parsed = JSON.parse(history);
    if (!Array.isArray(parsed)) return [];
    // Filter out old legacy dummy items (e.g. periodEnding 2026-04-30, 2026-04-15, 2026-03-31, 2026-03-15)
    const cleaned = parsed.filter((item) => {
      const pEnd = item.periodEnding || item.cycle_end_date;
      return !["2026-04-30", "2026-04-15", "2026-03-31", "2026-03-15"].includes(pEnd);
    });
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (e) {
    return [];
  }
};

export const savePayrollHistory = (history) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  window.dispatchEvent(new Event("pulse_payroll_update"));
};

export const getPayrollSchedule = () => {
  const schedule = localStorage.getItem(SCHEDULE_KEY);
  if (!schedule) {
    return [];
  }
  try {
    const parsed = JSON.parse(schedule);
    if (!Array.isArray(parsed)) return [];
    // Filter out old legacy dummy schedule items (e.g. startDate 2026-04-16, 2026-05-01, 2026-05-16, 2026-06-01, 2026-06-16)
    const cleaned = parsed.filter((item) => {
      const sStart = item.startDate || item.start_date;
      return !["2026-04-16", "2026-05-01", "2026-05-16", "2026-06-01", "2026-06-16"].includes(sStart);
    });
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(SCHEDULE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (e) {
    return [];
  }
};

export const savePayrollSchedule = (schedule) => {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
  window.dispatchEvent(new Event("pulse_payroll_update"));
};
