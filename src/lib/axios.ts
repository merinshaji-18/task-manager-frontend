import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// This "Interceptor" grabs the token from your computer's memory 
// and attaches it to every request automatically.
axiosInstance.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;