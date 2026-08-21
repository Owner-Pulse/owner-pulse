const TOKEN_NAME = import.meta.env.VITE_AUTH_TOKEN_NAME || "pulse_token";

export const setToken = (token) => {
    if (!token) {
        console.warn('No token provided to setToken');
        return;
    }
    localStorage.setItem(TOKEN_NAME, token);
};