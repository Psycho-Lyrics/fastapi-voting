import api from '../axiosInstance.js';

export const register = (formData) =>
    api.post('/user/register', formData);

export const loginUser = (email, password, remember_me) =>
    api.post('/user/login', { email, password, remember_me });

export const accessLogout = () =>
    api.post('/user/access-logout');

export const refreshLogout = (csrfToken) =>
    api.post('/user/refresh-logout', null, {
        headers: { 'X-CSRF-Token': csrfToken },
    });

export const refresh = (csrfToken) =>
    api.post('/user/refresh', null, {
        headers: { 'X-CSRF-Token': csrfToken },
    });

export const changeCredentials = (credentials) =>
    api.post('/user/profile/change-credentials', credentials)

