import axios from "axios"


const BASE_URL = import.meta.env.VITE_BASE_URL;

export const axiosPrivate = () => {
    const instance = axios.create({
        baseURL: `${BASE_URL}/api`,
        headers: {
            "Content-type": "application/json",
            "Accept": "application/json"
        }
    });

    // request interceptor
    instance.interceptors.request.use(
        (config) => {
            const tokenName = import.meta.env.VITE_AUTH_TOKEN_NAME || "pulse_token";
            const token = localStorage.getItem(tokenName);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }
    );

    // response interceptor
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error?.response?.status;
            if (status === 401) {
                console.log("Unauthorized");
                // toast show here
            } else if (status === 404) {
                console.log("Not Found");
            } else if (status === 500) {
                console.log("Internal Server Error");
            } else if (status === 502) {
                console.log("Bad Gateway");
            } else if (status === 503) {
                console.log("Service Unavailable");
            } else if (status === 504) {
                console.log("Gateway Timeout");
            }
            return Promise.reject(error);
        }
    );
    return instance;
};