// Data from the quick books API ( owner budget ==> school and director expenses )
export const getBudgetService = {
    getBudget: async (axiosInstance, params) => {
        const queryParams = typeof params === "object" ? params : params ? { type: params } : undefined;
        const response = await axiosInstance.get(`/qb/dashboard/reports/budget-vs-actual`, { params: queryParams });
        return response.data;
    },

    setBudgetLimit: async (axiosInstance, payload) => {
        const response = await axiosInstance.post(`/settings/budget`, payload);
        return response.data;
    },

    getBudgetLimit: async (axiosInstance) => {
        const response = await axiosInstance.get(`/settings/budget`);
        return response.data;
    },


    logExpensesDirector: async (axiosInstance, payload) => {
        const response = await axiosInstance.post(`/director/expense/store`, payload);
        return response.data;
    },

    deleteExpenseDirector: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.delete(`/director/expense/delete/${id}`);
            return response.data;
        } catch (err) {
            const response = await axiosInstance.post(`/director/expense/delete/${id}`);
            return response.data;
        }
    },

    updateDirectorExpense: async (axiosInstance, id, payload) => {
        const response = await axiosInstance.post(`/director/expense/update/${id}`, payload);
        return response.data;
    },
};

