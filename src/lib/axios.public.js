import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const TIME_OUT = import.meta.env.VITE_TIME_OUT

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
            if (status === 404) {
                console.log('Not Found');
            } else if (status === 500) {
                console.log('Internal Server Error');
            } else if (status === 502) {
                console.log('Bad Gateway');
            } else if (status === 503) {
                console.log('Service Unavailable');
            } else if (status === 504) {
                console.log('Gateway Timeout');
            } else if (!error?.response) {
                console.log('Network or connection error:', error?.message);
            }

            console.log('Public Axios Error:', error);
            return Promise.reject(error);
        }
    );

    return instance;
};