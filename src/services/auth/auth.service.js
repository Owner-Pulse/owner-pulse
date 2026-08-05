export const AuthService = {

  // sign in service for owner and director
  signInService: async (payload, axiosInstance) => {
    const response = await axiosInstance.post(`/login`, payload);
    return response?.data;
  },


  // sign out service for owner and director
  signOutService: async (axiosInstance) => {
    const response = await axiosInstance.get(`/logout`);
    return response?.data;
  }



}