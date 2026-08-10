export const ownerTaskAssignService = {
    get_task_list: async (axiosInstance) => {
        try {
            const response = await axiosInstance.get("/owner/task");
            return response.data;
        } catch (error) {
            console.error("Error fetching task list:", error);
            throw error;
        }
    },
}