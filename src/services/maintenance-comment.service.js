export const maintenanceCommentService = {
  getComments: async (axiosInstance, requestId) => {
    const response = await axiosInstance.get(`/maintenance/comments/${requestId}`);
    return response?.data;
  },

  postComment: async (axiosInstance, requestId, commentText) => {
    const formData = new FormData();
    formData.append("comment", commentText);
    const response = await axiosInstance.post(`/maintenance/comments/${requestId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response?.data;
  },
};
