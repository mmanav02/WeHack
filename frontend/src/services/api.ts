import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Auth APIs
export const authAPI = {
    register: (userData: any) => api.post('/auth/register', userData),
    login: (userData: any) => api.post('/auth/login', userData),
};

// Hackathon APIs
export const hackathonAPI = {
    getAll: () => api.get('/hackathons'),
    create: (hackathonData: any) => api.post('/hackathons/create', hackathonData),
    delete: (hackathonId: number) => api.delete('/hackathons/delete', { data: { hackathonId } }),
};

// Submission APIs
export const submissionAPI = {
    submit: (hackathonId: number, userId: number, submissionData: FormData) => 
        api.post(`/submissions/${hackathonId}/user/${userId}`, submissionData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    edit: (hackathonId: number, userId: number, submissionId: number, submissionData: FormData) =>
        api.put(`/submissions/${hackathonId}/user/${userId}/submission/${submissionId}`, submissionData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
};

// Judge APIs
export const judgeAPI = {
    submitScore: (scoreData: any) => api.post('/judge/score', scoreData),
    getFinalScore: (submissionId: number) => api.get(`/judge/score/final/${submissionId}`),
};

export default api; 