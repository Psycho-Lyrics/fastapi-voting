import axios from "axios";
import {refresh} from "./api/user.js";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
});

// очередь ожидающих запросов
let failedQueue = [];

// Обрабатывает очередь ожиданий после результата refresh
const processQueue = (error, token = null) => {
    failedQueue.forEach(p => {
        if (error) p.reject(error);  // уведомляем об ошибке
        else p.resolve(token);  // передаём новый токен
    });
    failedQueue = [];  // очищаем очередь
};

api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`
    }

    return config;
});

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        // Оригинальный запрос
        const originalRequest = error.config;

        const status = error?.response?.status;

        // если 401 и это не повторная попытка и не страница логина
        if (status === 401 && !originalRequest._retry && window.location.pathname !== "/login") {
            originalRequest._retry = true;
            try {
                const csrfToken = localStorage.getItem("x-csrf-token");
                const response = await refresh(csrfToken);

                const newAccessToken = response.data.access_token;
                const newCsrfToken = response.headers["x-csrf-token"];
                localStorage.setItem("access_token", newAccessToken);
                localStorage.setItem("x-csrf-token", newCsrfToken);

                // обновляем default заголовок Authorization для всех последующих запросов
                api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem("x-csrf-token");
                localStorage.removeItem("access_token");
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default api;