// Shared option lists, limits and helpers for the Director → Owner escalation questions

export const DECISION_OPTIONS = [
  { value: "approve_reject", label: "Approve / Reject" },
  { value: "decide_options", label: "Decide between options" },
  { value: "call_vendor", label: "Call a vendor" },
  { value: "call_parent", label: "Call a parent / family" },
  { value: "sign_document", label: "Sign or authorize a document" },
  { value: "other", label: "Other" },
];

export const REASON_OPTIONS = [
  { value: "approval", label: "Approval needed" },
  { value: "outside_authority", label: "Outside my authority" },
  { value: "financial_limit", label: "Financial decision above my limit" },
  { value: "safety_legal", label: "Safety / legal / regulatory" },
  { value: "other", label: "Other" },
];

export const DECISION_DETAILS_MIN = 10;
export const REASON_DETAILS_MIN = 20;

export const ESCALATION_FIELDS = ["decision_type", "decision_details", "reason_type", "reason_details"];

export const EMPTY_ESCALATION = {
  decision_type: "",
  decision_details: "",
  reason_type: "",
  reason_details: "",
};

const labelOf = (options, value) => options.find((o) => o.value === value)?.label || value || "";
export const decisionLabel = (value) => labelOf(DECISION_OPTIONS, value);
export const reasonLabel = (value) => labelOf(REASON_OPTIONS, value);

export const STATUS_META = {
  pending: { label: "Decision needed", short: "Pending", className: "bg-[#B78A2F]/15 text-[#8F6A1F] border-[#B78A2F]/30" },
  approved: { label: "Approved", short: "Approved", className: "bg-[#3E7A54]/10 text-[#2F6042] border-[#3E7A54]/30" },
  rejected: { label: "Rejected", short: "Rejected", className: "bg-[#AE4A3E]/10 text-[#8A362C] border-[#AE4A3E]/30" },
  acknowledged: { label: "Acknowledged", short: "Acknowledged", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

export const statusMeta = (status) => STATUS_META[status] || STATUS_META.pending;

export const isEscalationValid = (value) =>
  !!value?.decision_type &&
  !!value?.reason_type &&
  (value.decision_details || "").trim().length >= DECISION_DETAILS_MIN &&
  (value.reason_details || "").trim().length >= REASON_DETAILS_MIN;

export const cleanEscalation = (value) => ({
  decision_type: value.decision_type,
  decision_details: value.decision_details.trim(),
  reason_type: value.reason_type,
  reason_details: value.reason_details.trim(),
});

/**
 * Read a 422 response into { field: message }.
 * Nested keys ("escalation.decision_details") are returned without the prefix,
 * so the same four field names work for the nested and the standalone form.
 */
export const parseValidationErrors = (error) => {
  if (error?.response?.status !== 422) return {};
  const raw = error.response.data?.errors || {};
  const out = {};
  Object.entries(raw).forEach(([key, messages]) => {
    const field = key.replace(/^escalation\./, "");
    out[field] = Array.isArray(messages) ? messages[0] : String(messages);
  });
  return out;
};

// Drop the server message of every answer the user has edited since
export const clearEditedErrors = (errors, prev, next) => {
  const edited = ESCALATION_FIELDS.filter((f) => prev[f] !== next[f] && errors[f]);
  if (edited.length === 0) return errors;
  const rest = { ...errors };
  edited.forEach((f) => delete rest[f]);
  return rest;
};

export const hasEscalationError = (errors) => ESCALATION_FIELDS.some((f) => errors?.[f]);
