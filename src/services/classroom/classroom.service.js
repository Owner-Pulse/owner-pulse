export const classroomService = {
    getClassroom: async (axiosInstance, { filter, per_page = 50, page = 1 } = {}) => {
        try {
            const params = new URLSearchParams();
            if (filter && filter !== "All Classrooms") {
                params.append("filter", filter);
            } else {
                params.append("filter", "All Classrooms");
            }
            params.append("per_page", per_page);
            params.append("page", page);

            const response = await axiosInstance.get(`/procare/dashboard/classroom-pnl?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching classroom dashboard:", error);
            throw error;
        }
    }
};

