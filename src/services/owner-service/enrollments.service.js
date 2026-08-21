export const enrollmentsService = {
    getEnrollments: async (axiosInstance) => {
        try {
            const response = await axiosInstance.get(`/owner/enrollment/overview`);
            return response.data;
        } catch (error) {
            console.error("Error getting enrollments:", error);
            throw error;
        }
    },
};