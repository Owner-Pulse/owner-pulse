export const ownerWaitlistService = {
    get_all_waitlist: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/owner/waitlist", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching owner waitlist:", error);
            throw error;
        }
    },

    get_single_waitlist: async (id, axiosInstance) => {
        try {
            const response = await axiosInstance.get(`/owner/waitlist/show/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching single owner waitlist entry:", error);
            throw error;
        }
    },
};
