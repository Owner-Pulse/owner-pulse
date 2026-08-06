export const getUserService = {
    userDetail: async (axios) => {
        const response = await axios.get("/me");
        return response?.data;
    },

    // Update owner details
    updateOwnerUserDetails: async (axios, payload) => {
        const response = await axios.post("/owner/profile/change-all", payload, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response?.data;
    },

    // Update director details
    updateDirectorUserDetails: async (axios, payload) => {
        const response = await axios.post("/director/profile/change-all", payload, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response?.data;
    },

    // Change owner password
    changeOwnerPassword: async (axios, payload) => {
        const response = await axios.post("/owner/profile/change-password", payload, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response?.data;
    },

    // Change director password
    changeDirectorPassword: async (axios, payload) => {
        const response = await axios.post("/director/profile/change-password", payload, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response?.data;
    }
}