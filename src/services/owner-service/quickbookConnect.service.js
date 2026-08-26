export const quickbookConnectService = {
    get_connection_url: async (axiosInstance) => {
        const response = await axiosInstance.get("/qb/connect-url");
        return response?.data;
    },

    get_connection_status: async (axiosInstance) => {
        const response = await axiosInstance.get("/qb/status");
        return response?.data;
    },
}