import { axiosPrivate } from "@/lib/axios.private";
import { classroomService } from "@/services/classroom";
import { useQuery } from "@tanstack/react-query";

// Data from the dashboard classroom API ( pnl lists )
export const useGetClassroom = ({ filter = "All Classrooms", per_page = 10, page = 1 } = {}) => {

    const {
        data,
        isError,
        isLoading,
        isFetching,
        error,
    } = useQuery({
        queryKey: ["classroom", filter, per_page, page],
        queryFn: ({ queryKey }) => {
            // Destructure directly from queryKey to avoid stale closure issues
            const [, qFilter, qPerPage, qPage] = queryKey;
            // Create a fresh axios instance at fetch time (axiosPrivate is a plain fn, not a hook)
            const axiosInstance = axiosPrivate();
            return classroomService.getClassroom(axiosInstance, {
                filter: qFilter,
                per_page: qPerPage,
                page: qPage,
            });
        },
        // Data is considered fresh for 5 minutes.
        // Revisiting a cached page (e.g. going back to page 1) will NOT trigger a new API call
        // as long as the cached data is less than 5 minutes old.
        staleTime: 5 * 60 * 1000,
        // Keep cached pages in memory for 10 minutes after they become inactive.
        gcTime: 10 * 60 * 1000,
        // Keep the previous page's data visible while the next page loads.
        // This means isLoading stays false on page changes — only isFetching becomes true.
        placeholderData: (previousData) => previousData,

    });

    return {
        data,
        isLoading,
        isFetching,
        isError,
        error,
    };
};
