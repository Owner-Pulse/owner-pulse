export const payrollService = {
    director_payroll_overview: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/director/payroll/overview", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getDirectorOverview: async (axiosInstance, params) => {
        return payrollService.director_payroll_overview(axiosInstance, params);
    },

    owner_payroll_overview: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/owner/payroll/overview", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getOwnerOverview: async (axiosInstance, params) => {
        return payrollService.owner_payroll_overview(axiosInstance, params);
    },

    generate_schedule: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.post("/payroll/schedules", params);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    generateSchedule: async (axiosInstance, params) => {
        return payrollService.generate_schedule(axiosInstance, params);
    },

    delete_schedule: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.delete(`/payroll/schedules/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    deleteSchedule: async (axiosInstance, id) => {
        return payrollService.delete_schedule(axiosInstance, id);
    },

    update_schedule: async (axiosInstance, id, data) => {
        try {
            const response = await axiosInstance.post(`/payroll/schedules/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateSchedule: async (axiosInstance, id, data) => {
        return payrollService.update_schedule(axiosInstance, id, data);
    },

    director_payroll_history: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/director/payroll/history", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    payroll_history_list_director: async (axiosInstance, params) => {
        return payrollService.director_payroll_history(axiosInstance, params);
    },

    director_payroll_history_details: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.get(`/director/payroll/history/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    payroll_history_details_director: async (axiosInstance, id) => {
        return payrollService.director_payroll_history_details(axiosInstance, id);
    },

    director_schedule_list: async (axiosInstance) => {
        try {
            const response = await axiosInstance.get("/director/payroll/schedules");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    owner_schedule_list: async (axiosInstance) => {
        try {
            const response = await axiosInstance.get("/owner/payroll/schedules");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    payroll_submission_list_owner: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/owner/payroll/submissions", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    payroll_submission_details: async (axiosInstance, payroll_id) => {
        try {
            const response = await axiosInstance.get(`/owner/payroll/submissions/${payroll_id}/audit`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    submit_payroll: async (axiosInstance, data) => {
        try {
            const response = await axiosInstance.post("/director/payroll/submit", data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    submitPayroll: async (axiosInstance, data) => {
        return payrollService.submit_payroll(axiosInstance, data);
    },
};