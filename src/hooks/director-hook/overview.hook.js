import { axiosPrivate } from "@/lib/axios.private";
import { overviewService } from "@/services/overview.service";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export const useGetDirectorOverview = () => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ["director-overview"],
        queryFn: () => overviewService.director_overview(axiosInstance),
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    return {
        directorOverviewData: data?.data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    };
};
