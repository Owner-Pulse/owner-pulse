export const dailyLogService = {
    get_all_daily_logs: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/director/daily-log", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching daily logs:", error);
            throw error;
        }
    },

}