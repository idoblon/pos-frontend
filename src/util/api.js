import axios from "axios";
import { store } from "@/Redux Toolkit/globalState";
import { logout } from "@/Redux Toolkit/Features/auth/authSlice";
import { validateApiUrl } from "./urlValidator";
import secureStorage from "./secureStorage";

const api = axios.create({
  // Use the deployed API in production.  The localhost fallback keeps local
  // development working when no Vite environment value has been configured.
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    // Validate URL to prevent SSRF
    try {
      validateApiUrl(config.url);
    } catch {
      return Promise.reject(new Error("Invalid API endpoint"));
    }

    // Use secure token storage
    const token = secureStorage.getToken();
    if (token && secureStorage.isTokenValid()) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
// Single-flight token refresh: concurrent 401s share one refresh request so a
// burst of failing calls does not fire N parallel /auth/refresh calls (each of
// which would race and could invalidate the others).
let refreshPromise = null;

const refreshAccessToken = () => {
  const token = secureStorage.getToken();
  if (!token) {
    return Promise.reject(new Error("No token available to refresh"));
  }
  // The refresh endpoint accepts the current (possibly expired) access token
  // within a grace window and returns a fresh AuthResponse { jwt, ... }.
  return axios
    .post(
      `${api.defaults.baseURL}/auth/refresh`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      },
    )
    .then((res) => {
      const jwt = res.data?.jwt;
      if (!jwt) {
        throw new Error("Refresh response missing token");
      }
      secureStorage.setToken(jwt);
      return jwt;
    });
};

const forceLogout = () => {
  secureStorage.clearAll();
  store.dispatch(logout());
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    const isRefreshCall = url.includes("/auth/refresh");
    const isCredentialCall =
      url.includes("/auth/login") ||
      url.includes("/auth/signup") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password");

    if (status === 401 && originalRequest && !originalRequest._retried && !isRefreshCall && !isCredentialCall) {
      originalRequest._retried = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      try {
        const jwt = await refreshPromise;
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${jwt}`,
        };
        return api(originalRequest);
      } catch (refreshError) {
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
