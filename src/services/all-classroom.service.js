export const GetAllClassroom = {
    getAllClassroom: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/procare/classrooms", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}