import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { axiosPrivate } from "@/lib/axios.private";
import { dailyLogService } from "@/services/director-service/dailyLog.service";

/**
 * Hook to fetch daily logs with query params (type, date, per_page, page, search)
 */
export const useGetDailyLogs = (params = {}) => {
  const axiosInstance = axiosPrivate();

  const queryParams = {
    type: params.type || "all",
    date: params.date || "all",
    per_page: params.per_page || 15,
    page: params.page || 1,
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["director-daily-log", queryParams],
    queryFn: () => dailyLogService.get_all_daily_logs(axiosInstance, queryParams),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const responseData = data?.data || {};
  const summary = responseData.summary || {
    total_daily_logs: 0,
    total_logs_today: 0,
    incidents: 0,
    removals: 0,
    pto_entries: 0,
    substitutes: 0,
    waitlist_inquiries: 0,
    maintenance: 0,
    at_risk_flags: 0,
  };
  const groupedTimeline = responseData.grouped_timeline || [];
  const pagination = data?.pagination || {};

  return {
    data,
    summary,
    groupedTimeline,
    pagination,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
};
