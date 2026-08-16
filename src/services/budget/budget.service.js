// Data from the quick books API ( owner budget ==> school and director expenses )
export const getBudgetService = {
    getBudget: async (axisoInstance, type) => {
        const params = typeof type === "object" ? type : type ? { type } : undefined;
        const response = await axisoInstance.get(`/qb/dashboard/reports/budget-vs-actual`, { params });
        return response.data;
    }
}