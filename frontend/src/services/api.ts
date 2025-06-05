import axios from 'axios';

// Use relative URLs in production (when served by Spring Boot) or localhost in development
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8080' : '';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Test API
export const testAPI = {
    get: () => api.get('/test'),
    post: (data: string) => api.post('/test', data),
};

// Auth APIs
export const authAPI = {
    register: (userData: any) => api.post('/auth/register', userData),
    login: (userData: any) => api.post('/auth/login', userData),
};

// Hackathon APIs
export const hackathonAPI = {
    getAll: () => api.get('/hackathons/iterator'),
    create: (hackathonData: any) => api.post('/hackathons/create', hackathonData),
    delete: (hackathonId: number) => api.delete('/hackathons/delete', { data: { hackathonId } }),
    publish: (hackathonId: number) => api.put(`/hackathons/${hackathonId}/publish`),
    startJudging: (hackathonId: number) => api.put(`/hackathons/${hackathonId}/judging`),
    complete: (hackathonId: number) => api.put(`/hackathons/${hackathonId}/complete`),
    getLeaderboard: (hackathonId: number) => api.get(`/hackathons/${hackathonId}/leaderboard`),
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
    getByHackathon: (hackathonId: number) => api.get(`/submissions/hackathon/${hackathonId}`),
    getByUser: (userId: number) => api.get(`/submissions/user/${userId}`),
    getById: (submissionId: number) => api.get(`/submissions/${submissionId}`),
};

// Comment APIs
export const commentAPI = {
    addComment: (commentData: any) => api.post('/comments', commentData),
    getComments: (submissionId: number) => api.get(`/comments/submission/${submissionId}`),
};

// Judge Score APIs
export const judgeScoreAPI = {
    submitScore: (scoreData: any) => api.post('/judge-scores', scoreData),
    getScores: (submissionId: number) => api.get(`/judge-scores/submission/${submissionId}`),
};

// Hackathon Role APIs
export const hackathonRoleAPI = {
    assignRole: (roleData: any) => api.post('/hackathon-roles', roleData),
    getUserRoles: (userId: number) => api.get(`/hackathon-roles/user/${userId}`),
    getHackathonRoles: (hackathonId: number) => api.get(`/hackathon-roles/hackathon/${hackathonId}`),
    updateRole: (roleId: number, roleData: any) => api.put(`/hackathon-roles/${roleId}`, roleData),
    deleteRole: (roleId: number) => api.delete(`/hackathon-roles/${roleId}`),
};

// Analytics APIs
export const analyticsAPI = {
    getHackathonAnalytics: (hackathonId: number) => api.get(`/analytics/hackathon/${hackathonId}`),
    getUserAnalytics: (userId: number) => api.get(`/analytics/user/${userId}`),
    getSubmissionAnalytics: (submissionId: number) => api.get(`/analytics/submission/${submissionId}`),
};

// Legacy APIs for backward compatibility
export const judgeAPI = {
    submitScore: (scoreData: any) => judgeScoreAPI.submitScore(scoreData),
    getFinalScore: (submissionId: number) => judgeScoreAPI.getScores(submissionId),
};

export default api; 