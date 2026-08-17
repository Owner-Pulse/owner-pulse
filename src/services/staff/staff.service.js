export const staffService = {
    getStaff: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/procare/dashboard/staff", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching staff dashboard:", error);
            throw error;
        }
    }
};
