export const escalationService = {
    // role: "director" | "owner" — params: { status, page, per_page }
    get_escalations: async (axiosInstance, role, params) => {
        try {
            const response = await axiosInstance.get(`/${role}/escalations`, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // standalone escalation: title, the four answers and optional context at the top level
    create_escalation: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.post("/director/escalations", payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    resolve_escalation: async (axiosInstance, id, payload) => {
        try {
            const response = await axiosInstance.post(`/owner/escalations/${id}/resolve`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
