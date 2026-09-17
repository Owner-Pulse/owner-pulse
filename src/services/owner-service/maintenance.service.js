export const ownerMaintenanceService = {
    get_maintenance_list: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/owner/maintenance", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    status_change: async (axiosInstance, maintenance_id, data) => {
        try {
            const response = await axiosInstance.post(`/owner/maintenance/status/${maintenance_id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    mark_complete: async (axiosInstance, id, data = {}) => {
        try {
            const response = await axiosInstance.post(`/owner/maintenance/complete/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    update_maintenance: async (axiosInstance, id, data) => {
        try {
            const response = await axiosInstance.post(`/owner/maintenance/update/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete_maintenance: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.delete(`/owner/maintenance/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
