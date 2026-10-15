// role: "owner" | "director" — the Director enters the weekly report, both roles read it
export const weeklyReportService = {
    // rows in data, pagination at the top level
    get_reports: async (axiosInstance, role, params) => {
        try {
            const response = await axiosInstance.get(`/${role}/weekly-reports`, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    get_report: async (axiosInstance, role, id) => {
        try {
            const response = await axiosInstance.get(`/${role}/weekly-reports/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // the attached PDF at the report's file.url — needs the auth header, so it is read as a blob
    get_file: async (axiosInstance, url) => {
        try {
            const response = await axiosInstance.get(url, { responseType: "blob" });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // create or update the draft for a week — FormData when a PDF is attached, JSON otherwise
    save_draft: async (axiosInstance, payload) => {
        try {
            const config = payload instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined;
            const response = await axiosInstance.post("/director/weekly-reports", payload, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // returns warnings[]
    confirm: async (axiosInstance, role, id) => {
        try {
            const response = await axiosInstance.post(`/${role}/weekly-reports/${id}/confirm`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    reopen: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.post(`/owner/weekly-reports/${id}/reopen`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    update_notes: async (axiosInstance, id, ownerNotes) => {
        try {
            const response = await axiosInstance.put(`/owner/weekly-reports/${id}/notes`, { owner_notes: ownerNotes });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    get_room_mappings: async (axiosInstance) => {
        try {
            const response = await axiosInstance.get("/owner/report-room-mappings");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // mappings[] {room_label, classroom_id or null} — only the rooms being changed
    save_room_mappings: async (axiosInstance, mappings) => {
        try {
            const response = await axiosInstance.put("/owner/report-room-mappings", { mappings });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
