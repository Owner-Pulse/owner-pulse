
export const getUserService = async (axios) => {
    const response = await axios.get("/me")
    return response?.data
};
