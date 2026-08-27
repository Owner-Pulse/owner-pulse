const TOKEN_NAME = import.meta.env.VITE_AUTH_TOKEN_NAME || "pulse_token";

export const setToken = (token) => {
    if (!token) {
        return;
    }

    localStorage.setItem(TOKEN_NAME, token);
};