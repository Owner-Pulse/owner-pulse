export const overviewService = {
    owner_overview: async (axiosInstance) => {
        try {
            const response = await axiosInstance.get("/owner/overview");
            return response.data;
        } catch (error) {
            console.error("Error fetching owner overview:", error);
            throw error;
        }
    },

    director_overview: async (axiosInstance) => {
        try {
            const response = await axiosInstance.get("/director/overview");
            return response.data;
        } catch (error) {
            console.error("Error fetching director overview:", error);
            throw error;
        }
    },
};