import api from '../axiosInstance.js';

export const getAllDepartments = () =>
    api.get('/department/all');