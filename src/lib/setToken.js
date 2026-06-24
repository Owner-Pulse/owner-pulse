const TOKEN_NAME = import.meta.env.VITE_AUTH_TOKEN_NAME;

export const setToken = (token) => {
    if (!TOKEN_NAME) {
        throw new Error('No token name found');
    }
    if (!token) {
        throw new Error('No token found');
    }
    localStorage.setItem(TOKEN_NAME, token);
};