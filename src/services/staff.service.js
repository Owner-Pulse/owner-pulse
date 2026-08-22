const createFormData = (obj) => {
    if (obj instanceof FormData) return obj;
    const formData = new FormData();
    Object.keys(obj || {}).forEach((key) => {
        if (obj[key] !== null && obj[key] !== undefined) {
            formData.append(key, obj[key]);
        }
    });
    return formData;
};

export const staffService = {
    // ─── Owner/Director Staff Dashboard 
    getStaffOnDirectorDashboard: async (axiosInstance, params = {}) => {
        try {
            const queryParams = { per_page: 50, ...params };
            const response = await axiosInstance.get("/procare/dashboard/staff/tabs", { params: queryParams });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getStaffOnOwnerDashboard: async (axiosInstance, params = {}) => {
        try {
            const queryParams = { roster_per_page: 50, pto_per_page: 50, ...params };
            const response = await axiosInstance.get("/procare/dashboard/staff", { params: queryParams });
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
            const formData = createFormData(body);
            const response = await axiosInstance.post("/procare/staff/pto/log", formData, {
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
            const formData = createFormData(body);
            const response = await axiosInstance.post("/procare/staff/substitute/log", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Add staff API 
    addStaff: async (axiosInstance, body) => {
        try {
            const formData = createFormData(body);
            const response = await axiosInstance.post("/procare/staff", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateStaff: async (axiosInstance, staffId, body) => {
        try {
            const formData = createFormData(body);
            const response = await axiosInstance.post(`/procare/staff/${staffId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteStaff: async (axiosInstance, staffId) => {
        try {
            const response = await axiosInstance.delete(`/procare/staff/${staffId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

