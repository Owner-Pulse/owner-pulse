// Field errors from a 422 response, wherever the backend puts them

const isFilled = (value) =>
  value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;

// { "a.b": ["msg"], c: { d: "msg" }, e: [{ f: ["msg"] }] } -> { "a.b": "msg", "c.d": "msg", "e.0.f": "msg" }
const flatten = (value, prefix, out) => {
  if (value == null || value === "") return out;
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v !== "object" || v === null)) {
      if (prefix && value.length > 0 && !(prefix in out)) out[prefix] = String(value[0]);
      return out;
    }
    value.forEach((v, i) => flatten(v, prefix ? `${prefix}.${i}` : String(i), out));
    return out;
  }
  if (typeof value === "object") {
    Object.entries(value).forEach(([key, v]) => flatten(v, prefix ? `${prefix}.${key}` : key, out));
    return out;
  }
  if (prefix && !(prefix in out)) out[prefix] = String(value);
  return out;
};

/**
 * Read a 422 response into { field: first message }.
 * Looks in response.data.data, then response.data.errors, then response.data["t-errors"].
 * Nested fields come back as dotted keys ("escalation.decision_type", "headcount.3.count").
 */
export const getFieldErrors = (error) => {
  const data = error?.response?.status === 422 ? error.response.data : null;
  if (!data) return {};
  const source = [data.data, data.errors, data["t-errors"]].find(isFilled);
  return source ? flatten(source, "", {}) : {};
};

// A 422 that names the fields at fault (the forms show those themselves)
export const hasFieldErrors = (error) => Object.keys(getFieldErrors(error)).length > 0;
