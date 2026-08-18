export const staffService = {
    // ─── Owner Staff Dashboard 
    getStaff: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/procare/dashboard/staff", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // PTO staff list
    getPtoStaff: async (axiosInstance, params = { per_page: 1000 }) => {
        try {
            const response = await axiosInstance.get("/procare/staff/pto-balances", { params });
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

    // Note: Director Substitutes get list
    getSubstitutes: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/director/substitution", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Note: Director add substitute entry request
    addSubstitution: async (axiosInstance, body) => {
        try {
            const response = await axiosInstance.post("/procare/staff/substitute/log", body, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
