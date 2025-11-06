import api from './axiosInstance'

export const getProfileData = async () => {
    const response = await api.get(`/users/profile`, {
    });
    return response.data;
};

export const updateProfileData = async (profileData) => {
    const response = await api.put(`/users/profile`, profileData);
    return response.data;
};

export const changePassword = async (passwords) => {
    const response = await api.put(
        `/users/change-password`,
        passwords,

    );
    return response.data;
};


export const getVotingData = async (votingId) => {
    const response = await api.get(`/votings/${votingId}`);
    return response.data;
}

export const getLinkToVoting = async (votingId) => {
    const response = await api.post(`/votings/${votingId}/generate-link`);
    return response.data;
}

export const getQRcode = async (votingId) => {
    const response = await api.post(`/votings/${votingId}/generate-qr-code`);
    return response.data;
}

export const getVotingStats = async (votingId) => {
    const response = await api.get(`/votings/${votingId}/statistics`);
    return response.data;
}

export const getVotingParticipants = async (votingId, find = '') => {
    const response = await api.get(`/votings/${votingId}/participants`, {
        params: {
            find: find,
        },
    });
    return response.data;
}

export const getVotingResults = async (votingId) => {
    const response = await api.get(`/votings/${votingId}/results`);
    return response.data;
}

export const registerUserForVoting = async (votingId) => {
    const response = await api.post(`/votings/${votingId}/register`);
    return response.data;
}

export const sendVote = async (votingId, answer) => {
    const response = await api.post(`/votings/${votingId}/vote`, answer);
    return response.data;
}

export const deleteVote = async (votingId) => {
    const response = await api.delete(`/votings/${votingId}`);
    return response.data;
}

export const getDepartments = async (pageNum = 1) => {
    const response = await api.get(`/departments/`, {
        params: {
            page: pageNum,
        }
    });
    return response.data;
}

export const sendToArchive = async (votingId) => {
    const response = await api.put(`/votings/${votingId}/archive`, null);
    return response.data;
}

export const unArchive = async (votingId) => {
    const response = await api.put(`/votings/${votingId}/unarchive`, null);
    return response.data;
}

export const requestVerificationCode = async (email) => {
    const data = {
        email: email
    };

    const response = await api.post('/auth/request-verification-code', data)
    return response.data;
}

export const confirmEmail = async (email, code) => {
    const data = {
        code: code,
        email: email

    };

    const response = await api.post('/auth/confirm-email', data)
    return response.data;
}

export const saveTemplate = async (template) => {
    const response = await api.post(`/templates/`, template)
    return response.data;
}

export const getTemplates = async (page = 1, find = '', status = '') => {
    const params = {
        page: page,
        find: find,
    }

    if (status !== '') {
        params.status = status
    }

    const response = await api.get(`/templates/`);
    return response.data;
};
