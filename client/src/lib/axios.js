import axios from 'axios';

let apiHost = import.meta.env.VITE_API_URL || '';
if (apiHost && !apiHost.startsWith('http')) {
  // Render's host property often omits the protocol
  apiHost = `https://${apiHost}`;
}
const baseURL = apiHost ? `${apiHost}/api/v1` : '/api/v1';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let pendingRequests = 0;
let isWaking = false;
let wakeupTimeout;

const startWakingTimer = () => {
  if (pendingRequests === 0) {
    wakeupTimeout = setTimeout(() => {
      isWaking = true;
      window.dispatchEvent(new Event('backend-waking'));
    }, 2500); // 2.5 seconds without response = backend is sleeping
  }
  pendingRequests++;
};

const stopWakingTimer = () => {
  pendingRequests = Math.max(0, pendingRequests - 1);
  if (pendingRequests === 0) {
    clearTimeout(wakeupTimeout);
    if (isWaking) {
      isWaking = false;
      window.dispatchEvent(new Event('backend-awake'));
    }
  }
};

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  startWakingTimer();
  const token = localStorage.getItem('bb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  stopWakingTimer();
  return Promise.reject(error);
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => {
    stopWakingTimer();
    return response;
  },
  (error) => {
    stopWakingTimer();
    if (error.response?.status === 401) {
      localStorage.removeItem('bb_token');
      localStorage.removeItem('bb_user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
