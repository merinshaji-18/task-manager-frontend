import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
});

// This "Interceptor" grabs the token from your computer's memory 
// and attaches it to every request automatically.
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosInstance;