import api from '../axiosInstance.js';

export const getAllVoting = (page = 1, find = '', archived) => {
    const params = { page, find };
    if (archived) params.archived = archived;
    return api.get('/voting/all', { params });
};

export const createVoting = (votingData) =>
    api.post('/voting/create', votingData);

export const deleteVoting = (votingId) =>
    api.post('/voting/delete', { 'id': votingId });
