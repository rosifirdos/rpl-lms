import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  }
);

/**
 * Dosen Dashboard API
 */
export const dosenApi = {
  /**
   * Get classes taught by current lecturer
   */
  async getMyClasses(params = {}) {
    const response = await apiClient.get('/dosen/classes', { params });
    return response.data;
  },

  /**
   * Get dashboard metrics for lecturer
   */
  async getDashboardMetrics() {
    const response = await apiClient.get('/dosen/dashboard/metrics');
    return response.data;
  },

  /**
   * Get pending grading tasks
   */
  async getPendingGrading(params = {}) {
    const response = await apiClient.get('/dosen/grading/pending', { params });
    return response.data;
  },

  /**
   * Get attendance recap
   */
  async getAttendanceRecap(classId, params = {}) {
    const response = await apiClient.get(`/dosen/classes/${classId}/attendance`, { params });
    return response.data;
  },
};

/**
 * Admin API (existing pattern)
 */
export const adminApi = {
  // Courses
  async getCourses(params = {}) {
    const response = await apiClient.get('/admin/courses', { params });
    return response.data;
  },

  async createCourse(data) {
    const response = await apiClient.post('/admin/courses', data);
    return response.data;
  },

  async updateCourse(id, data) {
    const response = await apiClient.put(`/admin/courses/${id}`, data);
    return response.data;
  },

  async deactivateCourse(id) {
    const response = await apiClient.delete(`/admin/courses/${id}`);
    return response.data;
  },

  // Classes
  async getClasses(params = {}) {
    const response = await apiClient.get('/admin/classes', { params });
    return response.data;
  },

  async createClass(data) {
    const response = await apiClient.post('/admin/classes', data);
    return response.data;
  },

  async updateClass(id, data) {
    const response = await apiClient.put(`/admin/classes/${id}`, data);
    return response.data;
  },

  async deleteClass(id) {
    const response = await apiClient.delete(`/admin/classes/${id}`);
    return response.data;
  },

  // Users
  async getUsers(params = {}) {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },
};
