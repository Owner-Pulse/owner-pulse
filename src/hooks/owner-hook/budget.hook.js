import { axiosPrivate } from "@/lib/axios.private";
import { getBudgetService } from "@/services/owner-service/budget.service";
import { useQuery } from "@tanstack/react-query";

// Data from the quick books API ( owner budget ==> school and director expenses )
export const useGetBudget = (params) => {
    const axisoInstance = axiosPrivate();

    const {
        data,
        isError,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useQuery({
        queryKey: ["budget", params],
        queryFn: () => getBudgetService.getBudget(axisoInstance, params),
        keepPreviousData: true,
    });

    return { 
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
     };
};

