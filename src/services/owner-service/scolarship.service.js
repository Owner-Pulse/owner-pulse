export const ownerScholarshipService = {
    get_all_scholarships: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/procare/dashboard/scholarships", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching all scholarships:", error);
            throw error;
        }
    },

    add_scholarship: async (axiosInstance, payload) => {
        try {
            const response = await axiosInstance.post("/procare/scholarship-payments", payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error adding scholarship:", error);
            throw error;
        }
    },
    //   add_payload:{
    //     "procare_child_id": 3000,
    //     "program_name": "FES-EO", 
    //     "purchase_amount": 2900,
    //     "status": "Pending",
    //     "purchase_date": "2026-05-08"
    // }

    get_scholarship_program: async (axiosInstance) => {
        try {
            const response = await axiosInstance.get("/procare/scholarship-programs");
            return response.data;
        } catch (error) {
            console.error("Error fetching scholarship programs:", error);
            throw error;
        }
    },

    update_status: async (axiosInstance, payload, scholarship_id) => {
        try {
            const response = await axiosInstance.post(`/procare/scholarship-payments/${scholarship_id}/status`, payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error updating status:", error);
            throw error;
        }
    },
};