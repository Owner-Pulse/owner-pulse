export const adpHoursService = {
  preview: async (axiosInstance, role, formData) => {
    const response = await axiosInstance.post(`/${role}/adp-hours/import/preview`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  import: async (axiosInstance, role, formData) => {
    const response = await axiosInstance.post(`/${role}/adp-hours/import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  listImports: async (axiosInstance, role, params) => {
    const response = await axiosInstance.get(`/${role}/adp-hours/imports`, { params });
    return response.data;
  },

  getImport: async (axiosInstance, role, id) => {
    const response = await axiosInstance.get(`/${role}/adp-hours/imports/${id}`);
    return response.data;
  },
};
