
import { api } from './api';

export const AdminService = {
  login: async (email: string, password: string) => {
    return api.post('/auth/login-admin', { email, password });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout-admin', {});
    } catch(e) {}
    window.location.href = '/admin/login';
  },

  checkSession: async () => {
    try {
      return await api.get<{id: string, role: string}>('/admin/me');
    } catch (e) {
      return null;
    }
  },

  getUsers: async () => {
    return api.get<any[]>('/admin/users');
  },

  getUserDetails: async (id: string) => {
    return api.get<any>(`/admin/users/${id}`);
  },

  getSystemStatus: async () => {
    return api.get<{users: number, activeSessions: number, apiRequests: number, uptime: number}>('/admin/system-status');
  },

  getActivity: async () => {
    return api.get<any[]>('/admin/activity');
  },

  disableUser: async (id: string) => {
    return api.post(`/admin/users/${id}/disable`, {});
  },

  enableUser: async (id: string) => {
    return api.post(`/admin/users/${id}/enable`, {});
  }
};
