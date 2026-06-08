import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_URL } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';

/** Endpoints that must never trigger the 401 refresh-retry (avoids loops). */
const NO_REFRESH_PATHS = ['/auth/refresh', '/auth/login', '/auth/register'];

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send the httpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach the in-memory access token ──
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: silent refresh on 401, then retry once ──
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let pendingQueue: ((token: string | null) => void)[] = [];

function flushQueue(token: string | null): void {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
}

/** Raw refresh call (no interceptors) to avoid recursion. */
async function requestRefresh(): Promise<string | null> {
  try {
    const res = await axios.post<{ data: { accessToken: string } }>(
      `${API_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    return res.data.data.accessToken;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';

    const isRefreshable =
      status === 401 &&
      original &&
      !original._retry &&
      !NO_REFRESH_PATHS.some((p) => url.includes(p));

    if (!isRefreshable) {
      return Promise.reject(error);
    }

    original._retry = true;

    // If a refresh is already in flight, queue this request until it resolves.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    const newToken = await requestRefresh();
    isRefreshing = false;

    if (!newToken) {
      flushQueue(null);
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    useAuthStore.getState().setAccessToken(newToken);
    flushQueue(newToken);
    original.headers.Authorization = `Bearer ${newToken}`;
    return api(original);
  },
);
