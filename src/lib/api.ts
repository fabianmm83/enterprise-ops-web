import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { auth } from './auth';

const API_URL = import.meta.env.VITE_API_URL;
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

export const api = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: añade access token a cada request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = auth.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: maneja 401 y refresca token automáticamente
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si no es 401 o ya se reintentó, rechazar
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Si no hay refresh token, cerrar sesión
    const refreshToken = auth.getRefreshToken();
    if (!refreshToken) {
      auth.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Si ya hay un refresh en curso, esperar
    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${API_URL}/api/${API_VERSION}/auth/refresh`, {
        refreshToken,
      });

      const newAccessToken = data.accessToken;
      auth.setSession(newAccessToken, data.refreshToken ?? refreshToken, data.user ?? auth.getUser()!);

      pendingRequests.forEach((cb) => cb(newAccessToken));
      pendingRequests = [];

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      auth.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);