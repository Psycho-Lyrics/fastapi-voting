import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`
    }

    return config;
});

api.interceptors.response.use(
    (res) => res,
    (error) => Promise.reject(error)
);

export default api;