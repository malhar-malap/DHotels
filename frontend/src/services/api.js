import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000, // 8-second bounded timeout to prevent hanging requests & ensure crawler completion
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      try {
        const stringified = JSON.stringify(response.data);
        if (stringified.includes('http://')) {
          const sanitized = stringified.replace(/http:\/\/dhotels\.co/g, 'https://dhotels24.in');
          response.data = JSON.parse(sanitized);
        }
      } catch (e) {
        console.error('Error sanitizing response content protocol:', e);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    const errMsg = error.response?.data?.message || '';
    if (error.response?.status === 401 && (errMsg.toLowerCase().includes('suspended') || errMsg.toLowerCase().includes('restrict'))) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  sendOtp: (email) => api.post('/auth/send-otp', { email }),
  verifyOtpRegister: (data) => api.post('/auth/verify-otp-register', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getCurrentUser: () => api.get('/auth/me'),
  checkAvailability: (email, mobileNumber) => api.get('/auth/check-availability', { params: { email, mobileNumber } }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  updateProfilePhoto: (photoUrl) => api.put('/users/profile-photo', null, { params: { photoUrl } }),
  getVerificationStatus: () => api.get('/users/verification'),
  submitVerification: (data) => api.post('/users/verification', data),
  uploadVerificationDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/verification/document', formData, { headers: { 'Content-Type': undefined } });
  },
};

// Listings API
export const listingsAPI = {
  getAll: (params, config = {}) => api.get('/listings', { params, ...config }),
  getFeatured: () => api.get('/listings/featured'),
  getById: (id) => api.get(`/listings/${id}`),
  getByCategory: (categoryId, params) => api.get(`/listings/category/${categoryId}`, { params }),
  getMy: (params) => api.get('/listings/my', { params }),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id, reason) => api.delete(`/listings/${id}`, { data: { reason } }),
  close: (id, reason) => api.post(`/listings/${id}/close`, { reason }),
};

// Jobs API
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getFeatured: () => api.get('/jobs/featured'),
  getById: (id) => api.get(`/jobs/${id}`),
  getMy: (params) => api.get('/jobs/my', { params }),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  close: (id, reason) => api.post(`/jobs/${id}/close`, { reason }),
  apply: (jobId, data) => api.post(`/jobs/${jobId}/apply`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getApplications: (jobId, params) => api.get(`/jobs/${jobId}/applications`, { params }),
  getMyApplications: (params) => api.get('/jobs/applications/my', { params }),
  getReceivedApplications: (params) => api.get('/jobs/applications/received', { params }),
  updateApplicationStatus: (applicationId, status) => 
    api.put(`/jobs/applications/${applicationId}/status`, null, { params: { status } }),
};

// Inquiries API
export const inquiriesAPI = {
  create: (listingId, data) => api.post(`/inquiries/listing/${listingId}`, data),
  getReceived: (params) => api.get('/inquiries/received', { params }),
  getSent: (params) => api.get('/inquiries/sent', { params }),
  getById: (id) => api.get(`/inquiries/${id}`),
  updateStatus: (id, status) => api.put(`/inquiries/${id}/status`, null, { params: { status } }),
  markAsRead: (id) => api.put(`/inquiries/${id}/read`),
};

// Master Data API
export const masterAPI = {
  getStates: () => api.get('/master/states'),
  getCities: () => api.get('/master/cities'),
  getCitiesWithListings: () => api.get('/master/cities/with-listings'),
  getCitiesByState: (stateId) => api.get(`/master/states/${stateId}/cities`),
  searchCities: (name) => api.get('/master/cities/search', { params: { name } }),
  getCategories: () => api.get('/master/categories'),
  getDealTypes: (categoryId) => api.get(`/master/categories/${categoryId}/deal-types`),
  getJobCategories: () => api.get('/master/job-categories'),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getListingStats: () => api.get('/admin/listings/stats'),
  getUserStats: () => api.get('/admin/users/stats'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getListings: (params) => api.get('/admin/listings', { params }),
  getListingById: (id) => api.get(`/admin/listings/${id}`),
  editListing: (id, data) => api.put(`/admin/listings/${id}`, data),
  approveListing: (id, uniqueCode, imageUrls = []) => api.post(`/admin/listings/${id}/approve`, { uniqueCode, imageUrls }),
  rejectListing: (id, reason) => api.post(`/admin/listings/${id}/reject`, { rejectionReason: reason }),
  deleteListing: (id, reason) => api.delete(`/admin/listings/${id}`, { data: { reason } }),
  featureListing: (id, days) => api.post(`/admin/listings/${id}/feature`, null, { params: { days } }),
  bulkApproveListings: (ids) => api.post('/admin/listings/bulk-approve', { ids }),
  bulkDeleteListings: (ids, reason) => api.post('/admin/listings/bulk-delete', { ids, reason }),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  approveJob: (id) => api.post(`/admin/jobs/${id}/approve`),
  rejectJob: (id, reason) => api.post(`/admin/jobs/${id}/reject`, { rejectionReason: reason }),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  archiveJob: (id) => api.put(`/admin/jobs/${id}/archive`),
  getJobApplications: (jobId, params) => api.get(`/admin/jobs/${jobId}/applications`, { params }),

  // Verifications
  getVerifications: (params) => api.get('/admin/verifications', { params }),
  approveVerification: (id) => api.post(`/admin/verifications/${id}/approve`),
  rejectVerification: (id, reason) => api.post(`/admin/verifications/${id}/reject`, { rejectionReason: reason }),
  
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  changeUserRole: (userId, data) => api.put(`/admin/users/${userId}/roles`, data),
  suspendUser: (userId, reason) => api.post(`/admin/users/${userId}/suspend`, { reason }),
  activateUser: (userId) => api.post(`/admin/users/${userId}/activate`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  // Payments
  getPayments: (params) => api.get('/admin/payments', { params }),
  getPaymentStats: (params) => api.get('/admin/payments/stats', { params }),
  syncPayment: (id) => api.post(`/admin/payments/${id}/sync`),

  // Contact Messages
  getContactMessages: (params) => api.get('/admin/contact-messages', { params }),
  markContactMessageRead: (id) => api.post(`/admin/contact-messages/${id}/read`),
  replyToContactMessage: (id, replyContent) => api.post(`/admin/contact-messages/${id}/reply`, { replyContent }),
  deleteContactMessage: (id) => api.delete(`/admin/contact-messages/${id}`),
  getContactMessageStats: () => api.get('/admin/contact-messages/stats'),

  // Consultations (Schedule a Call)
  getConsultations: (params) => api.get('/admin/consultations', { params }),
  updateConsultationStatus: (id, status, adminNotes) => api.put(`/admin/consultations/${id}/status`, null, { params: { status, adminNotes } }),
  getConsultationStats: () => api.get('/admin/consultations/stats'),

  // Mandates (Submit Your Mandate)
  getMandates: (params) => api.get('/admin/mandates', { params }),
  updateMandateStatus: (id, status, adminNotes) => api.put(`/admin/mandates/${id}/status`, null, { params: { status, adminNotes } }),
  getMandateStats: () => api.get('/admin/mandates/stats'),
};

// Payment API (Razorpay)
export const paymentAPI = {
  createOrder: (listingId) => api.post('/payments/create-order', { listingId }),
  verifyPayment: (data) => api.post('/payments/verify', data),
  checkPayment: (listingId) => api.get(`/payments/check/${listingId}`),
};

// Contact API
export const contactAPI = {
  submit: (data) => api.post('/contact/submit', data),
};

// Consultation API (Schedule a Call - Public)
export const consultationAPI = {
  schedule: (data) => api.post('/consultations/schedule', data),
};

// Mandate API (Submit Your Mandate - Public)
export const mandateAPI = {
  submit: (data) => api.post('/mandates/submit', data),
};

// In-app notifications for the signed-in user
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const mediaAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/listings/media/upload', formData, { headers: { 'Content-Type': undefined } });
  },
  uploadMultiple: (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    return api.post('/listings/media/upload-multiple', formData, { headers: { 'Content-Type': undefined } });
  }
};

/**
 * Opens a private document (CV / KYC proof). These need the login token, so a plain link
 * won't work: fetch it as a blob and show it in a new tab.
 */
export const openPrivateFile = async (url) => {
  const marker = '/files/private/';
  if (!url || !url.includes(marker)) {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  // Open the tab synchronously so popup blockers allow it, then point it at the file
  const tab = window.open('', '_blank');
  try {
    const response = await api.get(url.slice(url.indexOf(marker)), { responseType: 'blob' });
    const blobUrl = URL.createObjectURL(response.data);
    if (tab) tab.location.href = blobUrl; else window.location.href = blobUrl;
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (error) {
    if (tab) tab.close();
    throw error;
  }
};

export default api;


