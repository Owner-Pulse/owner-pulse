export const allStaffsService = {
    get_all_staffs: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/procare/employees", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}