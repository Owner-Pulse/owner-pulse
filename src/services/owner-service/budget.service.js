// Data from the quick books API ( owner budget ==> school and director expenses )
export const getBudgetService = {
    getBudget: async (axiosInstance, params) => {
        const queryParams = typeof params === "object" ? params : params ? { type: params } : undefined;
        const response = await axiosInstance.get(`/qb/dashboard/reports/budget-vs-actual`, { params: queryParams });
        return response.data;
    }
};

