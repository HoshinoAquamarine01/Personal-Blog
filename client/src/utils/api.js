import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4500/api";

console.log("🌐 API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor - thêm token vào headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("📤 API Request:", {
      method: config.method.toUpperCase(),
      url: config.url,
      hasToken: !!token,
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi
api.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      console.log("🔴 Unauthorized - Clearing auth data");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
