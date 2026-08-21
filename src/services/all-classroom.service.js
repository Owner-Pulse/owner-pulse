export const GetAllClassroom = {
    getAllClassroom: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/procare/classrooms", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching all classroom:", error);
            throw error;
        }
    }
}