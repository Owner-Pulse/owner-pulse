import { axiosPrivate } from "@/lib/axios.private"
import { getBudgetService } from "@/services/budget";
import { useQuery } from "@tanstack/react-query";



// Data from the quick books API ( owner budget ==> school and director expenses )
export const useGetBudget = (type) => {
    const axisoInstance = axiosPrivate();

    const {
        data,
        isError,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["budget", type],
        queryFn: () => getBudgetService.getBudget(axisoInstance, type),
    });

    return { 
        data,
        isLoading,
        isError,
        error
     };
}