export const cashFlowService = {
    getCashFlow: async (axisoInstance) => {
        const response = await axisoInstance.get(`/qb/dashboard/reports/cash-flow`);
        return response.data;
    }
}