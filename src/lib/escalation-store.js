// ─── Escalation Store ─────────────────────────────────────────────
// Shared state between Director (submit) and Owner (review) via localStorage
// PROVISIONAL: replace with persistent API in backend phase

const STORAGE_KEY = "ownerpulse_escalations";

/**
 * Get all escalations from localStorage
 */
export function getEscalations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Add a new escalation (called by Director)
 * Returns the updated array
 * Dispatches a storage event so same-tab listeners also refresh
 */
export function addEscalation(data) {
  const escalations = getEscalations();
  const entry = {
    id: Date.now(),
    ...data,
    status: "pending", // pending | approved | rejected | acknowledged
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };
  escalations.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(escalations));
  // Dispatch storage event for same-tab listeners (e.g., Owner's Pending Decisions page)
  window.dispatchEvent(new Event("storage"));
  return escalations;
}

/**
 * Update escalation status (called by Owner)
 */
export function updateEscalationStatus(id, status) {
  const escalations = getEscalations();
  const updated = escalations.map((e) =>
    e.id === id ? { ...e, status, updatedAt: new Date().toISOString() } : e
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Get pending (unresolved) escalations
 */
export function getPendingEscalations() {
  return getEscalations().filter((e) => e.status === "pending");
}

/**
 * Get escalated item count (for badges/notifications)
 */
export function getPendingCount() {
  return getPendingEscalations().length;
}
