export const compliancesService = {
    //both 
    add_compliance_item: async (axiosInstance, data) => {
        try {
            const response = await axiosInstance.post("/compliance/items", data);
            return response.data;
        } catch (error) {
            console.error("Error adding owner compliance item:", error);
            throw error;
        }
    },

    update_compliance_item: async (axiosInstance, data, id) => {
        try {
            const response = await axiosInstance.put(`/compliance/items/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error updating owner compliance item:", error);
            throw error;
        }
    },

    delete_compliance_item: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.delete(`/compliance/items/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting owner compliance item:", error);
            throw error;
        }
    },

    log_note: async (axiosInstance, data, item_id) => {
        try {
            const response = await axiosInstance.post(`/compliance/items/${item_id}/logs`, data);
            return response.data;
        } catch (error) {
            console.error("Error logging note for owner compliance:", error);
            throw error;
        }
    },

    checklist_toggle: async (axiosInstance, data, item_id) => {
        try {
            const response = await axiosInstance.patch(`/compliance/checklists/${item_id}/toggle`, data);
            return response.data;
        } catch (error) {
            console.error("Error toggling checklist for owner compliance:", error);
            throw error;
        }
    },

    // owner services
    overview_owner: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/owner/compliance/overview", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching owner compliances:", error);
            throw error;
        }
    },



    compliance_items: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/owner/compliance/items", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching owner compliance items:", error);
            throw error;
        }
    },

    pulse_impact: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/owner/compliance/pulse-impact", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching owner pulse impact:", error);
            throw error;
        }
    },

    insurance_Shopping: async (axiosInstance) => {
        try {
            const response = await axiosInstance.get("/owner/compliance/insurance-shopping");
            return response.data;
        } catch (error) {
            console.error("Error fetching owner insurance shopping:", error);
            throw error;
        }
    },


    add_quotes: async (axiosInstance, data) => {
        try {
            const response = await axiosInstance.post("/owner/compliance/insurance-shopping/quotes", data);
            return response.data;
        } catch (error) {
            console.error("Error adding quotes for owner insurance shopping:", error);
            throw error;
        }
    },

    select_quotes: async (axiosInstance, quote_id) => {
        try {
            const response = await axiosInstance.post(`/owner/compliance/insurance-shopping/quotes/${quote_id}/select`);
            return response.data;
        } catch (error) {
            console.error("Error selecting quotes for owner insurance shopping:", error);
            throw error;
        }
    },

    complete_insurance_shopping: async (axiosInstance) => {
        try {
            const response = await axiosInstance.post("/owner/compliance/insurance-shopping/complete");
            return response.data;
        } catch (error) {
            console.error("Error completing insurance shopping for owner:", error);
            throw error;
        }
    },


    // director services
    overview_director: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/director/compliance/overview", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching director compliances:", error);
            throw error;
        }
    },

    compliance_items_director: async (axiosInstance, params) => {
        try {
            const response = await axiosInstance.get("/director/compliance/items", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching director compliance items:", error);
            throw error;
        }
    },


}