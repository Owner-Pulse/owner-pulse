import axios from "axios";
import { toast } from "react-hot-toast";

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
            const message = error?.response?.data?.message;

            if (status === 401) {
                toast.error(message || "Unauthorized access. Please log in again.");
            } else if (status === 404) {
                // Ignore silent 404s if handled by UI, or show toast when message provided
                if (message) toast.error(message);
            } else if (status === 500) {
                toast.error(message || "Internal Server Error");
            } else if (status === 502) {
                toast.error(message || "Bad Gateway");
            } else if (status === 503) {
                toast.error(message || "Service Unavailable");
            } else if (status === 504) {
                toast.error(message || "Gateway Timeout");
            }
            return Promise.reject(error);
        }
    );
    return instance;
};