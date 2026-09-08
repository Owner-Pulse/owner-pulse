const toFormData = (obj) => {
    if (obj instanceof FormData) return obj;
    const fd = new FormData();
    Object.keys(obj || {}).forEach((key) => {
        const val = obj[key];
        if (val !== null && val !== undefined && val !== "") {
            if (typeof val === "boolean") {
                fd.append(key, val ? "1" : "0");
            } else {
                fd.append(key, val);
            }
        }
    });
    return fd;
};

export const DiscountService = {
    // ─── Director Endpoints ───
    discountCategory: async (axiosInstance) => {
        try {
            const response = await axiosInstance.get("/director/tuition-discount-categories");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    discountList: async (axiosInstance, params = {}) => {
        try {
            const response = await axiosInstance.get("/director/tuition-discounts", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    directorAddDiscountStudent: async (axiosInstance, data) => {
        try {
            const payload = toFormData(data);
            const response = await axiosInstance.post("/director/tuition-discounts/store", payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    addDiscountStudent: async (axiosInstance, data) => {
        try {
            const payload = toFormData(data);
            const response = await axiosInstance.post("/director/tuition-discounts/store", payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    directorUpdateDiscountedStudent: async (axiosInstance, data, id) => {
        try {
            const payload = toFormData(data);
            const response = await axiosInstance.post(`/director/tuition-discounts/update/${id}`, payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateDiscountedStudent: async (axiosInstance, data, id) => {
        try {
            const payload = toFormData(data);
            const response = await axiosInstance.post(`/director/tuition-discounts/update/${id}`, payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    directorDeleteDiscountStudent: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.delete(`/director/tuition-discounts/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteDiscountStudent: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.delete(`/director/tuition-discounts/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ─── Owner Category Management ───
    discountCategoryList: async (axiosInstance) => {
        try {
            const response = await axiosInstance.get("/owner/tuition-discount-categories");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createCategory: async (axiosInstance, data) => {
        try {
            const payload = toFormData(data);
            const response = await axiosInstance.post("/owner/tuition-discount-categories/store", payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateCategory: async (axiosInstance, data, id) => {
        try {
            const payload = toFormData(data);
            const response = await axiosInstance.post(`/owner/tuition-discount-categories/update/${id}`, payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteCategory: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.delete(`/owner/tuition-discount-categories/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    showSingleCategory: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.get(`/owner/tuition-discount-categories/show/${id}`);
            return response.data;
        } catch (error) {
            try {
                const fallback = await axiosInstance.get(`/director/tuition-discount-categories/show/${id}`);
                return fallback.data;
            } catch {
                throw error;
            }
        }
    },

    // ─── Owner Discounts & Governance ───
    discountedStudentList: async (axiosInstance, params = {}) => {
        try {
            const response = await axiosInstance.get("/owner/tuition-discounts", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    analytics: async (axiosInstance) => {
        try {
            const response = await axiosInstance.get("/owner/tuition-discounts/analytics");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    ownerAddDiscountStudent: async (axiosInstance, data) => {
        try {
            const payload = toFormData(data);
            const response = await axiosInstance.post("/owner/tuition-discounts/store", payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    ownerUpdateDiscountedStudent: async (axiosInstance, data, id) => {
        try {
            const payload = toFormData(data);
            const response = await axiosInstance.post(`/owner/tuition-discounts/update/${id}`, payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    showSingleDiscount: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.get(`/owner/tuition-discounts/show/${id}`);
            return response.data;
        } catch (error) {
            try {
                const fallback = await axiosInstance.get(`/director/tuition-discounts/show/${id}`);
                return fallback.data;
            } catch {
                throw error;
            }
        }
    },

    showSignleDiscount: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.get(`/owner/tuition-discounts/show/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    ownerDeleteDiscountStudent: async (axiosInstance, id) => {
        try {
            const response = await axiosInstance.delete(`/owner/tuition-discounts/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    approveDiscountRequest: async (axiosInstance, data, id) => {
        try {
            const payload = toFormData(data);
            const response = await axiosInstance.post(`/owner/tuition-discounts/approve/${id}`, payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    rejectDiscountRequest: async (axiosInstance, data, id) => {
        try {
            const payload = toFormData(data);
            const response = await axiosInstance.post(`/owner/tuition-discounts/reject/${id}`, payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};