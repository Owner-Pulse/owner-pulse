export const directorStudentManageService = {
    enrollStudentByClass: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.post("/director/enrollment/store", payload);
            return response.data;
        } catch (error) {
            console.error("Error enrolling student by class:", error);
            throw error;
        }
    },

    getStudentDataByType: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get(`/director/students/tabs?page=${params?.page}&type=${params?.type}&per_page=${params?.per_page}`);
            return response.data;
        } catch (error) {
            console.error("Error getting student by type:", error);
            throw error;
        }
    },

    getStudentsByClass: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get(`/director/classrooms/${params?.id}/operations`, {
                params: {
                    page: params?.page,
                    per_page: params?.per_page
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error getting student by class:", error);
            throw error;
        }
    },

    getSingleStudent: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get(`/director/enrollment/show/${params?.id}`);
            return response.data;
        } catch (error) {
            console.error("Error getting student by class:", error);
            throw error;
        }
    },

    updateStudentByClass: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.post(`director/enrollment/update/${payload.enrolment_id}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error updating student by class:", error);
            throw error;
        }
    },

    logIncidents: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.post(`/director/incidents/store`, payload);
            return response.data;
        } catch (error) {
            console.error("Error logging incidents:", error);
            throw error;
        }
    },

    editIncident: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.post(`/director/incidents/update/${payload.incident_id}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error editing incident:", error);
            throw error;
        }
    },

    deleteIncident: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.delete(`/director/incidents/delete/${payload.incident_id}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error deleting incident:", error);
            throw error;
        }
    },

    addRemovalStudent: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.post(`/director/removals/store`, payload);
            return response.data;
        } catch (error) {
            console.error("Error adding removal student:", error);
            throw error;
        }
    },

    addAtRiskStudent: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.post(`/director/at-risk/store`, payload);
            return response.data;
        } catch (error) {
            console.error("Error adding at-risk student:", error);
            throw error;
        }
    },

    updateAtRiskStudent: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.put(`/director/at-risk/update/${payload.at_risk_id}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error updating at-risk student:", error);
            throw error;
        }
    },

    withdrawAtRisk: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.post(`/director/at-risk/withdraw/${payload.at_risk_id}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error withdrawing at-risk student:", error);
            throw error;
        }
    },

    withdrawFromClass: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.post(`/director/students/withdraw/${params?.procare_child_id}`, params);
            return response.data;
        } catch (error) {
            console.error("Error withdrawing from class:", error);
            throw error;
        }
    },




};