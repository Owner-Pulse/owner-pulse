export const directorWaitlistService = {
    get_all_waitlist: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/director/waitlist", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching director waitlist:", error);
            throw error;
        }
    },

    get_single_waitlist: async (id, axiosInstance) => {
        try {
            const response = await axiosInstance.get(`/director/waitlist/show/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching single director waitlist entry:", error);
            throw error;
        }
    },

    add_waitlist: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.post("/director/waitlist/store", payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error adding to waitlist:", error);
            throw error;
        }
    },

    update_waitlist: async (id, payload, axiosInstance) => {
        try {
            const response = await axiosInstance.post(`/director/waitlist/update/${id}`, payload, {
                headers: {
                    "Content-type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error updating waitlist entry:", error);
            throw error;
        }
    },

    change_status: async (id, payload, axiosInstance) => {
        try {
            const response = await axiosInstance.post(`/director/waitlist/advance/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error changing waitlist status:", error);
            throw error;
        }
    },
};
