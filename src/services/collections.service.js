// role: "owner" | "director" — both roles read and enter the weekly Collections balance
export const collectionsService = {
    // card: current, previous, change_amount, change_pct, direction, weeks_between, this_week_entered, trend[]
    get_collections: async (axiosInstance, role, weeks = 12) => {
        try {
            const response = await axiosInstance.get(`/${role}/collections`, { params: { weeks } });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // rows in data, pagination at the top level
    get_history: async (axiosInstance, role, params) => {
        try {
            const response = await axiosInstance.get(`/${role}/collections/history`, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // week_start (optional, normalized to Monday), balance, families_count, notes — 201 new week, 200 updated week
    save_week: async (axiosInstance, role, payload) => {
        try {
            const response = await axiosInstance.post(`/${role}/collections`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // balance, families_count, notes only — the week cannot change here
    update_entry: async (axiosInstance, role, id, payload) => {
        try {
            const response = await axiosInstance.put(`/${role}/collections/${id}`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
