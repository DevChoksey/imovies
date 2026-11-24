import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically add JWT token to Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified API methods
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const movieService = {
  getMovies: (params) => api.get('/movies', { params }),
  getMovieById: (id) => api.get(`/movies/${id}`),
  createMovie: (data) => api.post('/movies', data),
  updateMovie: (id, data) => api.put(`/movies/${id}`, data),
  deleteMovie: (id) => api.delete(`/movies/${id}`),
};

export const theatreService = {
  getTheatres: (params) => api.get('/theatres', { params }),
  getTheatreById: (id) => api.get(`/theatres/${id}`),
  createTheatre: (data) => api.post('/theatres', data),
  deleteTheatre: (id) => api.delete(`/theatres/${id}`),
};

export const showService = {
  getShows: (params) => api.get('/shows', { params }),
  getShowById: (id) => api.get(`/shows/${id}`),
  createShow: (data) => api.post('/shows', data),
  deleteShow: (id) => api.delete(`/shows/${id}`),
};

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id, data) => api.post(`/bookings/${id}/cancel`, data),
  sendEmail: (id, data) => api.post(`/bookings/${id}/send-email`, data),
  getAllBookingsAdmin: () => api.get('/bookings/admin/all'),
};

export const paymentService = {
  processPayment: (data) => api.post('/payments/process', data),
  getMyPayments: () => api.get('/payments/my-payments'),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
};

export default api;
