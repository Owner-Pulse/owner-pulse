export const cashFlowService = {
    getCashFlow: async (axiosInstance) => {
        const response = await axiosInstance.get(`/qb/dashboard/reports/cash-flow`);
        return response.data;
    }
};
