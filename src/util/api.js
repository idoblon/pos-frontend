import axios from "axios";
import { store } from "@/Redux Toolkit/globalState";
import { logout } from "@/Redux Toolkit/Features/auth/authSlice";
import { validateApiUrl } from "./urlValidator";
import secureStorage from "./secureStorage";

const api = axios.create({
  baseURL: "http://localhost:8080",
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
    } catch (error) {
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      secureStorage.clearAll();
      store.dispatch(logout());
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
