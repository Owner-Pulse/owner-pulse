export const createDirectorService = {
    createDirector: async (payload, axiosInstance) => {
        const response = await axiosInstance.post("/owner/director/store", payload, {
            headers:{
                "Content-Type": "multipart/form-data",
            }
        });
      
        return response?.data;
    },

    getAllDirector: async (axiosInstance) => {
        const response = await axiosInstance.get("/owner/director");
        return response?.data;
    },

    getSingleDirector: async (id, axiosInstance) => {
        const response = await axiosInstance.get(`/owner/director/show/${id}`);
        return response?.data;
    },
};
