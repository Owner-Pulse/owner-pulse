export const csvManageService = {
    // Queues the import and returns straight away; the result is read with getImport
    upload_csv: async (axiosInstance, data) => {
        const response = await axiosInstance.post("/procare/single-csv-upload", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            // Sending a large file on a slow connection can exceed the default 30s
            timeout: 5 * 60 * 1000,
        });
        return response?.data;
    },

    getFileType: async (axiosInstance) => {
        const response = await axiosInstance.get("/procare/single-csv-upload/options");
        return response?.data;
    },

    getImports: async (axiosInstance, page = 1) => {
        const response = await axiosInstance.get("/procare/csv-imports", { params: { page } });
        return response?.data;
    },

    getImport: async (axiosInstance, importId) => {
        const response = await axiosInstance.get(`/procare/csv-imports/${importId}`);
        return response?.data;
    },
};
