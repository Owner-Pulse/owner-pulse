export const csvManageService = {
    upload_csv: async (axiosInstance, data) => {
        const response = await axiosInstance.post("/procare/single-csv-upload", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response?.data;
    },

    getFileType: async (axiosInstance) => {
        const response = await axiosInstance.get("/procare/single-csv-upload/options");
        return response?.data;
    },
};

