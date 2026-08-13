export const ownerMaintenanceService = {
    get_maintenance_list: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/owner/maintenance", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching owner maintenance list:", error);
            throw error;
        }
    },

    status_change: async (axiosInstance, maintenance_id, data) => {
        try {
            const response = await axiosInstance.post(`/owner/maintenance/status/${maintenance_id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error changing owner maintenance status:", error);
            throw error;
        }
    }
}   