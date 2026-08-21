export const directorTaskAssignService = {
    get_task_list: async (axiosInstance) => {
        try {
            const response = await axiosInstance.get("/director/task");
            return response.data;
        } catch (error) {
            console.error("Error fetching director task list:", error);
            throw error;
        }
    },

    create_task: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.post("/director/task/store", payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating director task:", error);
            throw error;
        }
    },

    in_progress_task: async (id, axiosInstance) => {
        try {
            const response = await axiosInstance.post(`/director/task/in-progress/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error setting director task to in-progress:", error);
            throw error;
        }
    },

    complete_task: async (id, axiosInstance) => {
        try {
            const response = await axiosInstance.post(`/director/task/complete/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error completing director task:", error);
            throw error;
        }
    },

    get_single_task: async (id, axiosInstance) => {
        try {
            const response = await axiosInstance.get(`/director/task/show/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching single director task:", error);
            throw error;
        }
    },

    update_task: async (id, payload, axiosInstance) => {
        try {
            const response = await axiosInstance.post(`/director/task/update/${id}`, payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating director task:", error);
            throw error;
        }
    },

    delete_task: async (id, axiosInstance) => {
        try {
            const response = await axiosInstance.delete(`/director/task/delete/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting director task:", error);
            throw error;
        }
    },
};
