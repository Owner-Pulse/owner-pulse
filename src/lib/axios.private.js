import axios from "axios"


const BASE_URL = import.meta.env.VITE_BASE_URL;

export const axiosPrivate = () => {
    const instance = axios.create({
        baseURL: `${BASE_URL}/api`,
        headers: {
            "Content-type": "application/json",
        }
    });

    // request interceptor
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("access_token");
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
            if (error.response.status === 401) {
                console.log("Unauthorized");
                // toast show here
            }
            if (error.response.status === 404) {
                console.log("Not Found");
            }
            if (error.response.status === 500) {
                console.log("Internal Server Error");
            }
            if (error.response.status === 502) {
                console.log("Bad Gateway");
            }
            if (error.response.status === 503) {
                console.log("Service Unavailable");
            }
            if (error.response.status === 504) {
                console.log("Gateway Timeout");
            }
            return Promise.reject(error);
        }
    );
    return instance;
};