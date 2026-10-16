const MAX_PAGES = 50;

/**
 * Load every page of a list whose rows sit at data.data with the paging fields
 * (current_page, last_page) next to them, and return the rows as one array.
 *
 * fetchPage: (page) => response body
 */
export const fetchAllPages = async (fetchPage) => {
  const rows = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const body = await fetchPage(page);
    const data = body?.data;
    // Not paginated: the rows are the payload itself
    if (Array.isArray(data)) return data;
    rows.push(...(Array.isArray(data?.data) ? data.data : []));
    const last = Number(data?.last_page) || 1;
    if (page >= last) break;
  }
  return rows;
};
