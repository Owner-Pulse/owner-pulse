export const taskCommentService = {
  getComments: async (axiosInstance, taskId) => {
    try {
      const response = await axiosInstance.get(`/task/comments/${taskId}`);
      return response?.data;
    } catch (error) {
      throw error;
    }
  },

  postComment: async (axiosInstance, taskId, commentText) => {
    try {
      const formData = new FormData();
      formData.append("comment", commentText);

      const response = await axiosInstance.post(`/task/comments/${taskId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response?.data;
    } catch (error) {
      throw error;
    }
  },
};
