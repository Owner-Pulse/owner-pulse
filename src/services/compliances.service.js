export const compliancesService = {
    // both
    add_compliance_item: async (axiosInstance, data) => {
        try {
            const response = await axiosInstance.post("/compliance/items", data);
            return response.data;
        } catch (error) {
            console.error("Error adding compliance item:", error);
            throw error;
        }
    },

    update_compliance_item: async (axiosInstance, idOrData, dataOrId) => {
        try {
            const id = typeof idOrData === "object" ? dataOrId : idOrData;
            const data = typeof idOrData === "object" ? idOrData : dataOrId;
            const response = await axiosInstance.put(`/compliance/items/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error updating compliance item:", error);
            throw error;
        }
    },

    delete_compliance_item: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.delete(`/compliance/items/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting compliance item:", error);
            throw error;
        }
    },

    log_note: async (axiosInstance, idOrData, dataOrId) => {
        try {
            const itemId = typeof idOrData === "object" ? dataOrId : idOrData;
            const data = typeof idOrData === "object" ? idOrData : dataOrId;
            const response = await axiosInstance.post(`/compliance/items/${itemId}/logs`, data);
            return response.data;
        } catch (error) {
            console.error("Error logging note for compliance:", error);
            throw error;
        }
    },

    checklist_toggle: async (axiosInstance, idOrData, dataOrId) => {
        try {
            const itemId = typeof idOrData === "object" ? dataOrId : idOrData;
            const data = typeof idOrData === "object" ? idOrData : (dataOrId || {});
            const response = await axiosInstance.patch(`/compliance/checklists/${itemId}/toggle`, data || {});
            return response.data;
        } catch (error) {
            console.error("Error toggling checklist for compliance:", error);
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
            let body = data;
            if (!(data instanceof FormData) && typeof data === "object") {
                body = new FormData();
                Object.keys(data).forEach((key) => {
                    if (data[key] !== undefined && data[key] !== null) {
                        body.append(key, data[key]);
                    }
                });
            }
            const response = await axiosInstance.post("/owner/compliance/insurance-shopping/quotes", body);
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

    complete_insurance_shopping: async (axiosInstance, data) => {
        try {
            let body = data;
            if (!(data instanceof FormData) && data && typeof data === "object") {
                body = new FormData();
                Object.keys(data).forEach((key) => {
                    if (data[key] !== undefined && data[key] !== null) {
                        body.append(key, data[key]);
                    }
                });
            }
            const response = await axiosInstance.post("/owner/compliance/insurance-shopping/complete", body);
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
};