import { axiosPrivate } from "@/lib/axios.private";
import { staffService } from "@/services/director-service/staff.service";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

// ─── Staff Dashboard for Owner
export const useGetStaff = (params) => {
    const axiosInstance = axiosPrivate();

    const { data, isError, isLoading, isFetching, error } = useQuery({
        queryKey: ["staff", params],
        queryFn: () => staffService.getStaff(axiosInstance, params),
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    return { data, isLoading, isFetching, isError, error };
};
