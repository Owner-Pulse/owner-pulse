import { axiosPrivate } from "@/lib/axios.private";
import { overviewService } from "@/services/overview.service";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export const useGetOwnerOverview = () => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ["owner-overview"],
        queryFn: () => overviewService.owner_overview(axiosInstance),
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    return {
        ownerOverviewData: data?.data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    };
};
