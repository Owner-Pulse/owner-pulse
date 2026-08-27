import axios from "axios";
import { toast } from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const TIME_OUT = import.meta.env.VITE_TIME_OUT;

export const axiosPublic = () => {
    const instance = axios.create({
        baseURL: `${BASE_URL}/api`,
        timeout: TIME_OUT,
        headers: {
            "Content-type": "application/json",
            "Accept": "application/json"
        }
    });

    //interceptors
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error?.response?.status;
            const message = error?.response?.data?.message;

            if (status === 404) {
                if (message) toast.error(message);
            } else if (status === 500) {
                toast.error(message || "Internal Server Error");
            } else if (status === 502) {
                toast.error(message || "Bad Gateway");
            } else if (status === 503) {
                toast.error(message || "Service Unavailable");
            } else if (status === 504) {
                toast.error(message || "Gateway Timeout");
            } else if (!error?.response) {
                toast.error(error?.message || "Network or connection error");
            }

            return Promise.reject(error);
        }
    );

    return instance;
};