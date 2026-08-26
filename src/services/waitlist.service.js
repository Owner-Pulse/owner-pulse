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

    add_waitlist: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.post("/director/waitlist/store", payload);
            return response.data;
        } catch (error) {
            console.error("Error adding director waitlist:", error);
            throw error;
        }
    },

    update_waitlist: async (axiosInstance, id, payload) => {
        try {
            const response = await axiosInstance.post(`/director/waitlist/update/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error updating director waitlist:", error);
            throw error;
        }
    },

    inquiryToTour: async (axiosInstance, id, payload) => {
        try {
            const response = await axiosInstance.post(`/director/waitlist/tour/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error converting inquiry to tour:", error);
            throw error;
        }
    },

    tourToAppled: async (axiosInstance, id, payload) => {
        try {
            const response = await axiosInstance.post(`/director/waitlist/applied/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error converting tour to applied:", error);
            throw error;
        }
    },


    appledToOffered: async (axiosInstance, id, payload) => {
        try {
            const response = await axiosInstance.post(`/director/waitlist/offered/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error converting applied to offered:", error);
            throw error;
        }
    },


    offeredToEnrolled: async (axiosInstance, id, payload) => {
        try {
            const response = await axiosInstance.post(`/director/waitlist/enrolled/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error converting offered to enrolled:", error);
            throw error;
        }
    },

    lostStudent: async (axiosInstance, id, payload) => {
        try {
            const response = await axiosInstance.post(`/director/waitlist/lost/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error converting to lost:", error);
            throw error;
        }
    },

    deletefromWaitlist: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.delete(`/director/waitlist/delete/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting from waitlist:", error);
            throw error;
        }
    },

    getWaitlistForOwner: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get(`/owner/waitlist`, { params });
            return response.data;
        } catch (error) {
            console.error("Error getting waitlist for owner:", error);
            throw error;
        }
    }

}


