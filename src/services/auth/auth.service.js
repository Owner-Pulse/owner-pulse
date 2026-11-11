export const AuthService = {

  // sign in service for owner and director
  signInService: async (payload, axiosInstance) => {
    const response = await axiosInstance.post(`/login`, payload);
    return response?.data;
  },


  // sign out service for owner and director
  signOutService: async (axiosInstance) => {
    const response = await axiosInstance.post(`/logout`);
    return response?.data;
  },

  forgotPassword: async (email, axiosInstance) => {
    const response = await axiosInstance.post(`/forget-password`, { email });
    return response?.data;
  },

  verifyResetOtp: async (payload, axiosInstance) => {
    const response = await axiosInstance.post(`/otp-token`, payload);
    return response?.data;
  },

  resendResetOtp: async (email, axiosInstance) => {
    const response = await axiosInstance.post(`/resend-forgot-otp`, { email });
    return response?.data;
  },

  resetPassword: async (payload, axiosInstance) => {
    const response = await axiosInstance.post(`/reset-password`, payload);
    return response?.data;
  }
};