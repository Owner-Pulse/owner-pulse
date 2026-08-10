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

    create_task: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.post("/owner/task/store", payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating task:", error);
            throw error;
        }
    },

    in_progress_task: async (id, axiosInstance) => {
        try {
            const response = await axiosInstance.post(`/owner/task/in-progress/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error setting task to in-progress:", error);
            throw error;
        }
    },

    complete_task: async (id, axiosInstance) => {
        try {
            const response = await axiosInstance.post(`/owner/task/complete/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error completing task:", error);
            throw error;
        }
    },

    get_single_task: async (id, axiosInstance) => {
        try {
            const response = await axiosInstance.get(`/owner/task/show/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching single task:", error);
            throw error;
        }
    },

    update_task: async (id, payload, axiosInstance) => {
        try {
            const response = await axiosInstance.post(`/owner/task/update/${id}`, payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating task:", error);
            throw error;
        }
    },

    delete_task: async (id, axiosInstance) => {
        try {
            const response = await axiosInstance.delete(`/owner/task/delete/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting task:", error);
            throw error;
        }
    },




}