/**
 * Resolves a file/attachment path against VITE_BASE_URL from environment variables.
 * Handles full URLs (http/https/blob/data), relative paths (with or without leading slash),
 * and null/undefined values.
 *
 * @param {string|null|undefined} path - The file path or URL
 * @returns {string} Fully qualified URL or empty string
 */
export const getFileUrl = (path) => {
  if (!path || typeof path !== "string") return "";

  const trimmed = path.trim();
  if (!trimmed) return "";

  // If already an absolute URL or blob/data URI
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  const rawBase = import.meta.env.VITE_BASE_URL || "";
  const cleanBase = rawBase.replace(/\/+$/, "");
  const cleanPath = trimmed.replace(/^\/+/, "");

  if (!cleanBase) {
    return `/${cleanPath}`;
  }

  return `${cleanBase}/${cleanPath}`;
};

export default getFileUrl;
