import { axiosPrivate } from "@/lib/axios.private";
import { getBudgetService } from "@/services/owner-service/budget.service";
import { useQuery, useMutation } from "@tanstack/react-query";

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

export const useSetBudgetLimit = () => {
    const axiosInstance = axiosPrivate();

    const {
        data,
        mutateAsync: setBudgetLimit,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationKey: ["set-budget-limit"],
        mutationFn: (payload) => getBudgetService.setBudgetLimit(axiosInstance, payload),
    });

    return {
        data,
        setBudgetLimit,
        isPending,
        isError,
        error,
    };
};

export const useLogDirectorExpense = () => {
    const axiosInstance = axiosPrivate();

    const {
        data,
        mutateAsync: logExpense,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationKey: ["log-director-expense"],
        mutationFn: (payload) => getBudgetService.logExpensesDirector(axiosInstance, payload),
    });

    return {
        data,
        logExpense,
        isPending,
        isError,
        error,
    };
};

export const useGetBudgetLimit = () => {
    const axiosInstance = axiosPrivate();

    const {
        data,
        isError,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useQuery({
        queryKey: ["budget-limit"],
        queryFn: () => getBudgetService.getBudgetLimit(axiosInstance),
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


