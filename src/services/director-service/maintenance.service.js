export const directorMaintenanceService = {
    get_maintenance_list: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/director/maintenance", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    create_maintenance: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.post("/director/maintenance/store", payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    get_single_maintenance: async (id, axiosInstance) => {
        try {
            const response = await axiosInstance.get(`/director/maintenance/show/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    update_maintenance: async (id, payload, axiosInstance) => {
        try {
            const response = await axiosInstance.post(`/director/maintenance/update/${id}`, payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete_maintenance: async (id, axiosInstance) => {
        try {
            const response = await axiosInstance.delete(`/director/maintenance/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

