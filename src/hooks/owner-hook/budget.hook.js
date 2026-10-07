import { axiosPrivate } from "@/lib/axios.private";
import { getBudgetService } from "@/services/owner-service/budget.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

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

export const useDeleteDirectorExpense = () => {
    const axiosInstance = axiosPrivate();

    const {
        data,
        mutateAsync: deleteExpense,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationKey: ["delete-director-expense"],
        mutationFn: (id) => getBudgetService.deleteExpenseDirector(axiosInstance, id),
    });

    return {
        data,
        deleteExpense,
        isPending,
        isError,
        error,
    };
};

export const useUpdateDirectorExpense = () => {
    const axiosInstance = axiosPrivate();

    const {
        data,
        mutateAsync: updateExpense,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationKey: ["update-director-expense"],
        mutationFn: ({ id, payload }) => getBudgetService.updateDirectorExpense(axiosInstance, id, payload),
    });

    return {
        data,
        updateExpense,
        isPending,
        isError,
        error,
    };
};

export const useResetDirectorExpenses = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: resetExpenses,
        isPending,
    } = useMutation({
        mutationKey: ["reset-director-expenses"],
        mutationFn: () => getBudgetService.resetDirectorExpenses(axiosInstance),
        onSuccess: (data) => {
            toast.success(data?.message || "Test expense data reset successfully.");
            queryClient.invalidateQueries({ queryKey: ["budget-data"] });
            queryClient.invalidateQueries({ queryKey: ["director-budget"] });
            queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to reset test expense data.");
        }
    });

    return { resetExpenses, isPending };
};

// ─── Category Budget Hooks ──────────────────────────────────────────

export const useGetCategoryBudgets = (params = {}) => {
    const axiosInstance = axiosPrivate();

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["category-budgets", params],
        queryFn: () => getBudgetService.getCategoryBudgets(axiosInstance, params),
    });

    const summary = data?.summary;
    const categories = data?.categories || data?.data || [];

    return {
        data,
        summary,
        categories,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    };
};

export const useUpdateCategoryBudgets = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        data,
        mutateAsync: updateCategoryBudget,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationKey: ["update-category-budgets"],
        mutationFn: (payload) => getBudgetService.updateCategoryBudgets(axiosInstance, payload),
        onSuccess: (res) => {
            toast.success(res?.message || "Category budget updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["category-budgets"] });
            queryClient.invalidateQueries({ queryKey: ["budget"] });
            queryClient.invalidateQueries({ queryKey: ["budget-limit"] });
        },
        onError: (err) => {
            const exceeded = err?.response?.data?.exceeded_by_formatted;
            const msg = err?.response?.data?.message || (exceeded ? `Budget limit exceeded by ${exceeded}` : "Failed to update category budget.");
            toast.error(msg);
        },
    });

    return {
        data,
        updateCategoryBudget,
        isPending,
        isError,
        error,
    };
};

export const useDeleteCategoryBudget = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        data,
        mutateAsync: deleteCategoryBudget,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationKey: ["delete-category-budget"],
        mutationFn: (idOrPayload) => getBudgetService.deleteCategoryBudget(axiosInstance, idOrPayload),
        onSuccess: (res) => {
            toast.success(res?.message || "Category budget limit reset to default.");
            queryClient.invalidateQueries({ queryKey: ["category-budgets"] });
            queryClient.invalidateQueries({ queryKey: ["budget"] });
            queryClient.invalidateQueries({ queryKey: ["budget-limit"] });
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to reset category budget limit.");
        },
    });

    return {
        data,
        deleteCategoryBudget,
        isPending,
        isError,
        error,
    };
};




