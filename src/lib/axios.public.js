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
            if (error.response.status === 404) {
                console.log('Not Found');
            }
            if (error.response.status === 500) {
                console.log('Internal Server Error');
            }
            if (error.response.status === 502) {
                console.log('Bad Gateway');
            }
            if (error.response.status === 503) {
                console.log('Service Unavailable');
            }
            if (error.response.status === 504) {
                console.log('Gateway Timeout');
            }

            console.log('Public Axios Error:', error);
            throw error;
        }
    );

    return instance;
};