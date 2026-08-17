export const staffService = {
    // ─── Staff Dashboard 
    getStaff: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/procare/dashboard/staff", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // PTO staff get list
    getPtoStaff: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/director/pto", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Note: Director add PTO request
    addPto: async (axiosInstance, body) => {
        try {
            const response = await axiosInstance.post("/procare/staff/pto/log", body, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ─── Substitutes
    getSubstitutes: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/director/substitution", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    addSubstitution: async (axiosInstance, body) => {
        try {
            const response = await axiosInstance.post("/director/substitution", body);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
