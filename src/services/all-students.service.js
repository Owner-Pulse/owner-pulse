export const GetAllStudentsService = {
    getAllStudents: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/procare/children", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getStudentById: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get(`/director/students/${params?.id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

