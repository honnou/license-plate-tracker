import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export const groupsAPI = {
  create: (name: string) => api.post('/groups', { name }),
  join: (code: string) => api.post('/groups/join', { code }),
  getAll: () => api.get('/groups'),
  getMembers: (groupId: number) => api.get(`/groups/${groupId}/members`),
};

export const platesAPI = {
  create: (formData: FormData) => api.post('/plates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getGroupPlates: (groupId: number) => api.get(`/plates/group/${groupId}`),
  getUserPlates: (groupId: number) => api.get(`/plates/group/${groupId}/user`),
  getUserStates: (groupId: number) => api.get(`/plates/group/${groupId}/user/states`),
};

export const leaderboardAPI = {
  getLeaderboard: (groupId: number) => api.get(`/leaderboard/${groupId}`),
  getUserStats: (groupId: number, userId: number) =>
    api.get(`/leaderboard/${groupId}/user/${userId}`),
};

export default api;
