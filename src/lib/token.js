const TOKEN_NAME = import.meta.env.VITE_AUTH_TOKEN_NAME || "pulse_token";

export const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_NAME);
};

export const setToken = (token) => {
    if (!token) return;
    localStorage.setItem(TOKEN_NAME, token);
};

export const removeToken = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_NAME);
};

export { TOKEN_NAME };
