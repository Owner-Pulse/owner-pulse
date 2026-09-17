export const classroomService = {
    getClassroom: async (axiosInstance, { filter, per_page = 50, page = 1 } = {}) => {
        try {
            const params = new URLSearchParams();
            if (filter && filter !== "All Classrooms") {
                params.append("filter", filter);
            } else {
                params.append("filter", "All Classrooms");
            }
            params.append("per_page", per_page);
            params.append("page", page);

            const response = await axiosInstance.get(`/procare/dashboard/classroom-pnl?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getSingleClassroom: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.get(`/procare/dashboard/classroom-economics/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    addClassroom: async (axiosInstance, data) => {
        try {
            const response = await axiosInstance.post(`/owner/classroom/store`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateClassroom: async (axiosInstance, data, id) => {
        try {
            const response = await axiosInstance.post(`/owner/classroom/update/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteClassroom: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.delete(`/owner/classroom/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getEnrollmentTargets: async (axiosInstance) => {
        try {
            const response = await axiosInstance.get("/settings/enrollment-targets");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateEnrollmentTargets: async (axiosInstance, data) => {
        try {
            let body = data;
            if (!(data instanceof FormData) && typeof data === "object") {
                body = {
                    enrollment_target_preschool: data.enrollment_target_preschool,
                    enrollment_target_k8: data.enrollment_target_k8,
                };
            }
            const response = await axiosInstance.post("/settings/enrollment-targets", body);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

