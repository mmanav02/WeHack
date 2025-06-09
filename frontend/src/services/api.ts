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
    findUserByEmail: (email: string) => api.get(`/auth/user/find-by-email?email=${encodeURIComponent(email)}`),
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

// Hackathon Registration APIs
export const hackathonRegistrationAPI = {
    joinHackathon: (joinData: { userId: number; hackathonId: number; role: string }) => 
        api.post('/hackathon-role/join', joinData),
    createTeam: (teamData: { name: string; userId: number; hackathonId: number }) => 
        api.post('/hackathon-role/create-team', teamData),
    leaveHackathon: (leaveData: { userId: number; hackathonId: number }) => 
        api.delete('/hackathon-role/leave', { data: leaveData }),
    addTeamMember: (teamId: number, userId: number) => 
        api.post(`/hackathon-role/teams/${teamId}/add-member`, userId),
    getPendingJudgeRequests: (hackathonId: number) => 
        api.get(`/hackathon-role/hackathons/${hackathonId}/judge-requests`),
    getParticipants: (hackathonId: number) => 
        api.get(`/hackathon-role/hackathons/${hackathonId}/participants`),
    listTeams: (hackathonId: number) => 
        api.get(`/hackathon-role/hackathons/${hackathonId}/teams`),
    getAvailableTeams: (hackathonId: number) => 
        api.get(`/hackathon-role/hackathons/${hackathonId}/available-teams`),
    requestToJoinTeam: (teamId: number, userId: number) => 
        api.post(`/hackathon-role/teams/${teamId}/join-request`, userId),
    updateJudgeStatus: (statusData: { hackathonId: number; userId: number; status: string }) => 
        api.post('/hackathon-role/update-status', statusData),
};

// Submission APIs
export const submissionAPI = {
    // New API matching backend exactly
    submitProject: (formData: FormData) => 
        api.post('/submissions/submitProject', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    
    // New draft submission API
    saveDraft: (formData: FormData) => 
        api.post('/submissions/saveDraft', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    
    edit: (editData: any) => api.put('/submissions/editSubmission', editData),
    undoLastEdit: (undoData: any) => api.post('/submissions/undoLastEdit', undoData),
    
    // Legacy API - keeping for backward compatibility
    submit: (hackathonId: number, userId: number, submissionData: FormData) => 
        api.post(`/submissions/${hackathonId}/user/${userId}`, submissionData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    
    getByHackathon: (hackathonId: number) => api.get(`/submissions/hackathon/${hackathonId}`),
    getByUser: (userId: number) => api.get(`/submissions/user/${userId}`),
    getById: (submissionId: number) => api.get(`/submissions/${submissionId}`),
    downloadFile: (submissionId: number) => api.get(`/submissions/${submissionId}/download`, {
        responseType: 'blob'  // Important for file downloads
    }),
    setPrimary: (submissionId: number, userId: number) => 
        api.post(`/submissions/${submissionId}/setPrimary?userId=${userId}`),
    getPrimarySubmissions: (hackathonId: number) => 
        api.get(`/submissions/hackathon/${hackathonId}/primary`),
    
    // File info API
    getFileInfo: (submissionId: number) => api.get(`/submissions/${submissionId}/file-info`),
};

// Comment APIs
export const commentAPI = {
    addComment: (commentData: any) => {
        // Convert JSON to form data for backend compatibility
        const formData = new FormData();
        formData.append('hackathonId', commentData.hackathonId.toString());
        formData.append('userId', commentData.userId.toString());
        formData.append('content', commentData.content);
        if (commentData.parentId !== undefined) {
            formData.append('parentId', commentData.parentId.toString());
        }
        
        return api.post('/comments', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    getComments: (hackathonId: number) => api.get(`/comments/${hackathonId}`),
};

// Judge Score APIs - Updated to match JudgeScoreController
export const judgeScoreAPI = {
    submitScore: (scoreData: any) => api.post('/judge/score', scoreData),
    getFinalScore: (submissionId: number) => api.get(`/judge/score/final/${submissionId}`),
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
    getFinalScore: (submissionId: number) => judgeScoreAPI.getFinalScore(submissionId),
};

export default api; 