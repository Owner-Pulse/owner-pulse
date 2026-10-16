export const documentVaultService = {
  getCategories: async (axiosInstance, role) => {
    const response = await axiosInstance.get(`/${role}/document-vault/categories`);
    return response.data;
  },

  getExpiringSummary: async (axiosInstance) => {
    const response = await axiosInstance.get("/owner/document-vault/expiring-summary");
    return response.data;
  },

  list: async (axiosInstance, role, params) => {
    const response = await axiosInstance.get(`/${role}/document-vault`, { params });
    return response.data;
  },

  show: async (axiosInstance, role, id) => {
    const response = await axiosInstance.get(`/${role}/document-vault/${id}`);
    return response.data;
  },

  getFile: async (axiosInstance, role, id) => {
    const response = await axiosInstance.get(`/${role}/document-vault/${id}/file`, { responseType: "blob" });
    return response.data;
  },

  upload: async (axiosInstance, role, formData) => {
    const response = await axiosInstance.post(`/${role}/document-vault`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  update: async (axiosInstance, role, id, formData) => {
    const response = await axiosInstance.post(`/${role}/document-vault/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  remove: async (axiosInstance, role, id) => {
    const response = await axiosInstance.delete(`/${role}/document-vault/${id}`);
    return response.data;
  },
};
