export const recordList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const asList = recordList;

export const mapComplianceLogs = (list) =>
  asList(list)
    .map((l) => ({
      id: l.id,
      date: l.created_at ? String(l.created_at).slice(0, 10) : l.date || "",
      author: l.user_name || l.author || "User",
      text: l.note || l.text || "",
    }))
    .filter((l) => l.text);

export const complianceLogsFrom = (item, extra = []) => {
  const own = mapComplianceLogs(item?.activity_logs);
  if (own.length) return own;
  const latest = item?.latest_activity_log ? mapComplianceLogs([item.latest_activity_log]) : [];
  if (latest.length) return latest;
  const fromHistory = mapComplianceLogs(extra);
  if (fromHistory.length) return fromHistory;
  return mapComplianceLogs(item?.logs);
};

export const historyByItemId = (overview) => {
  const map = new Map();
  for (const log of asList(overview?.activity_logs_history)) {
    const id = log.compliance_item_id;
    if (!id) continue;
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(log);
  }
  return map;
};

// Keep a record that already has comments when a later copy of the same item has none.
export const mergeComplianceRecord = (prev, next) => {
  if (!prev) return next;
  if (!next) return prev;
  const nextLogs = asList(next.activity_logs);
  const prevLogs = asList(prev.activity_logs);
  return {
    ...prev,
    ...next,
    activity_logs: nextLogs.length ? next.activity_logs : prev.activity_logs || prevLogs,
    latest_activity_log: next.latest_activity_log || prev.latest_activity_log || null,
  };
};
