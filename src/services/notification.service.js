export const notificationService = {
    get_notifications: async (axiosInstance) => {
        const response = await axiosInstance.get("/notifications");
        return response?.data;
    },

    mark_as_read: async (axiosInstance, notificationId) => {
        const response = await axiosInstance.post(`/notifications/read/${notificationId}`);
        return response?.data;
    },

    mark_all_as_read: async (axiosInstance) => {
        const response = await axiosInstance.post("/notifications/read-all");
        return response?.data;
    },
}