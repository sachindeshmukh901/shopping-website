import axios from "axios";

const API = axios.create({
    baseURL: "https://orgos-backend-h7ad.onrender.com/api",

    headers: {
        "Content-Type": "application/json"
    }
});

API.interceptors.request.use(
    (config) => {
        if (!config.headers) {
            config.headers = {};
        }

        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;