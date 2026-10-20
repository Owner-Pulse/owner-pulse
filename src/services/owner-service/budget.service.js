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

    getCategoryBudgets: async (axiosInstance, params) => {
        const queryParams = typeof params === "object" ? params : params ? { type: params } : undefined;
        const response = await axiosInstance.get(`/settings/category-budgets`, { params: queryParams });
        return response.data;
    },

    updateCategoryBudgets: async (axiosInstance, payload) => {
        const response = await axiosInstance.post(`/settings/category-budgets`, payload);
        return response.data;
    },

    deleteCategoryBudget: async (axiosInstance, idOrPayload) => {
        const body = (typeof idOrPayload === "object" && idOrPayload !== null)
            ? idOrPayload
            : (typeof idOrPayload === "string" && Number.isNaN(Number(idOrPayload))
                ? { category_name: idOrPayload }
                : { id: idOrPayload });
        const id = body.id;
        const { silent, ...payload } = body;

        if (id && !payload.remove) {
            const response = await axiosInstance.delete(`/settings/category-budgets/${id}`);
            return response.data;
        }
        if (id && payload.remove) {
            const response = await axiosInstance.delete(`/settings/category-budgets/${id}`, { data: payload });
            return response.data;
        }
        const response = await axiosInstance.delete(`/settings/category-budgets`, { data: payload });
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

    resetDirectorExpenses: async (axiosInstance) => {
        const response = await axiosInstance.post(`/director/expense/reset`);
        return response.data;
    },
};

